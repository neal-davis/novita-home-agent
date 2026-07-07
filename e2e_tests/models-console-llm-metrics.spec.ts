import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models-console/llm-metrics（LLM Metrics 仪表盘 · 客户端取数页）。
 *
 * 这一层不只「不白屏」，而是断言**确定性行为**：登录态下 6 张指标图按 fixture 全部渲染、
 * 模型下拉绑定 fixture 的 model 列表（自动选中第一个 + 展开命中全部选项）；空态下模型选择器
 * 禁用并显示「No LLM api calls」、图表外壳仍在；未登录态被 PermissionWrapper 拦成空渲染。
 * 三态都不触发错误边界、不被弹去登录。
 *
 * 渲染契约（读 src 实测确认）：
 *  - page.tsx 是 "use client"，所有取数都是客户端 XHR（可被 page.route 拦）：
 *      · /v1/user/info → 注入 Redux state.user（updateUserInfo 要求 payload.teams 是数组）；
 *      · /v1/metrics/models（getLLMMetricsModels）→ { models:[...] } 驱动模型 <Select>；
 *        非空时 page.tsx 自动选中 models[0] 并 emit Fetch_With_Abort，使每张图触发
 *      · /v1/metrics/llm（getLLMMetrics）→ { metricsType, data:[{date,value}] } 图表时序数据。
 *  - 整页被 <PermissionWrapper resourceGroup=model_api resource=llm_metrics> 包裹：
 *    checkPermission 在 uuid 存在 && currentTeam===null 时直接放行（见 lib/utils/permission.ts）。
 *    user-info fixture 用 teams:[] → currentTeam=null，一次同时解除 uuid 门 + 通过 ACL，
 *    无需 permissionsConfig。无 uuid 时 PermissionWrapper 渲染 <></>（空，非崩溃）。
 *  - 每张图是 CharWrapper 的 <div className="console-card ...">（6 张）→ `.console-card`
 *    命中数 == 图表数，是干净的「图表块数」锚点（实测 6）。recharts 渲染出 svg.recharts-surface
 *    （实测 6）→ 图表确实消费了 /v1/metrics/llm 的数据。
 *  - 工具栏 [class*=operate] 内有 2 个 combobox（模型选择 + Refresh Rate），模型选择是第一个；
 *    展开后 role=option 命中数 == fixture.models.length（实测 3，文本逐一匹配 model id）。
 *
 * ⚠ 兜底陷阱（已做变异测试验证）：/v1/metrics/llm 必须显式注入「data 为非空数组」的 fixture。
 *   page.tsx injectEmptyData 对 res.data 做 .length / [0].date / unshift，CharWrapper.handleResponse
 *   做 res.data.map——若返回兜底 {code:0,data:{}}（data 非数组），map/length 抛错触错误边界。
 *   把该 fixture 改成 {} 后本 spec FAIL（断言有牙），随后还原。
 *
 * 选择器纪律：无 i18n 文案断言。锚点用稳定语义 class（.console-card / [class*=operate] /
 * [class*=page_wrapper]）、role（combobox/option，不带 i18n name）、与 fixture 派生内容
 * （model id）。唯一的字面量 "No LLM api calls" 是 page.tsx 硬编码英文串（非 i18n 管线），
 * 故可安全断言空态。
 */

const baseEndpoints = {
  "/v1/user/info": loadFixture("models-console-llm-metrics-user-info.json"),
};

const CHART_CARD = ".console-card";
const CHART_SVG = "svg.recharts-surface";
const TOOLBAR = "[class*='operate']";

test.describe("Models Console · LLM Metrics（hermetic）", () => {
  test("有数据：6 张指标图渲染 + 模型下拉绑定 fixture，未弹登录、不崩", async ({
    page,
  }) => {
    // 该页渲染 6 张 recharts 图表 + 客户端多端点取数，首次编译较重；放宽到 90s
    // 避免冷启动撞默认 30s（断言本身确定性，非掩盖 flaky）。
    test.setTimeout(90_000);
    const models = loadFixture<{ models: string[] }>(
      "models-console-llm-metrics-models.json",
    );
    const expectedModels = models.models; // 3 个 model id

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/v1/metrics/models": models,
        "/v1/metrics/llm": loadFixture("models-console-llm-metrics-data.json"),
      },
    });
    await page.goto("/models-console/llm-metrics");

    // --- 客户端取数 + PermissionWrapper 放行的信号：6 张图表卡渲染 ---
    await expect(page.locator(CHART_CARD)).toHaveCount(6, { timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功，uuid 注入 Redux） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 工具栏：模型选择 + Refresh Rate 两个 combobox ---
    const toolbarCombos = page.locator(TOOLBAR).getByRole("combobox");
    await expect(toolbarCombos).toHaveCount(2);

    // --- 模型下拉绑定 fixture：自动选中 models[0]（trigger 显示其文本） ---
    const modelSelect = toolbarCombos.first();
    await expect(modelSelect).toContainText(expectedModels[0]);

    // --- 展开下拉：option 命中数 == fixture.models 数，且逐一匹配 model id（确定性内容） ---
    await modelSelect.click();
    const options = page.getByRole("option");
    await expect(options).toHaveCount(expectedModels.length);
    for (let i = 0; i < expectedModels.length; i++) {
      await expect(options.nth(i)).toHaveText(expectedModels[i]);
    }
    // 收起下拉，避免遮挡后续断言
    await page.keyboard.press("Escape");

    // --- 图表确实消费了 /v1/metrics/llm：每张图渲染出一个 recharts surface（实测 6） ---
    await expect(page.locator(CHART_SVG)).toHaveCount(6);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空态：无 LLM 调用时模型选择禁用并显示空标签，图表外壳仍在、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/v1/metrics/models": loadFixture(
          "models-console-llm-metrics-models-empty.json",
        ),
        // 空模型态下 page.tsx 不会带 model 调用图表接口（getLLMMetrics 对空 model 直接 resolve([])），
        // 但仍显式注入以防兜底；charts 渲染空数据外壳。
        "/v1/metrics/llm": loadFixture("models-console-llm-metrics-data.json"),
      },
    });
    await page.goto("/models-console/llm-metrics");

    // 图表外壳仍渲染（空数据态，非崩溃）
    await expect(page.locator(CHART_CARD)).toHaveCount(6, { timeout: 30_000 });

    // 未被弹去登录
    await expect(page).not.toHaveURL(/\/login/);

    // 模型选择器：禁用 + 空标签「No LLM api calls」（page.tsx 硬编码英文串，非 i18n）
    const modelSelect = page.locator(TOOLBAR).getByRole("combobox").first();
    await expect(modelSelect).toBeDisabled();
    await expect(modelSelect).toContainText("No LLM api calls");

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("未登录：PermissionWrapper 拦成空渲染（无图表），不崩、不弹错误边界", async ({
    page,
  }) => {
    // 不 seedAuth、不注入 /v1/user/info（兜底 {code:0,data:{}} → 无 uuid）。
    await mockBackend(page, {
      endpoints: {
        "/v1/metrics/models": loadFixture(
          "models-console-llm-metrics-models.json",
        ),
        "/v1/metrics/llm": loadFixture("models-console-llm-metrics-data.json"),
      },
    });
    await page.goto("/models-console/llm-metrics");

    // 页面框架（导航等）已挂载的信号：等 body 有实质内容，再做负向断言（避免在 loading 抢跑）。
    await expect
      .poll(
        async () => (await page.locator("body").innerText()).trim().length,
        {
          timeout: 30_000,
        },
      )
      .toBeGreaterThan(100);

    // PermissionWrapper 无 uuid → 渲染 <></>：图表与工具栏都不存在（空渲染，非崩溃）。
    await expect(page.locator(CHART_CARD)).toHaveCount(0);
    await expect(page.locator(TOOLBAR)).toHaveCount(0);

    // 不触发错误边界（优雅空渲染，而非抛错） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
