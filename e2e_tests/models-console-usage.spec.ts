import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models-console/usage（客户端取数页）。
 *
 * 渲染链路（读 src 确认）：
 *  - page.tsx 是 async server component，但只渲染 <ChartContainer><Wrapper/></ChartContainer>，
 *    二者都是 "use client"；真正的取数发生在 Wrapper 挂载后的 XHR
 *    queryApiUsageByTime（GET /v1/user/queryApiUsageByTime）——可被 page.route 拦截。
 *  - 3 张图（APIUsageChart 柱 / ApiCreditUsageChart 堆叠 / APIUsagePieChart 饼）都用 echarts，
 *    渲染成 <canvas>（不是 DOM 行/表），故确定性结构断言 = canvas 计数。
 *  - 3 张图整体被 PermissionWrapper(model_api/usage/all) 包裹：
 *    uuid 缺失 → 渲染 <></>（空）；uuid 在但无权限 → 渲染 /no-permission.svg 兜底块；
 *    uuid 在 + 有权限 → 渲染图表。fixture user-info uuid 存在 + teams:[] →
 *    currentTeam=null → checkPermission() 返回 true（见 src/lib/utils/permission.ts），
 *    所以走数据路径而非兜底——这正是本 spec 要锁住的关键行为。
 *
 * 数据契约（读 wrapper.tsx + 三个 chart 组件确认）：
 *  - 响应体直接读 res.data（[{taskType,points,date}]）与 res.taskData（[{taskType,points}]），
 *    无 code 包裹要求；fixture 用 code:0 + 200 让 api 客户端视作成功（绝不能 401，
 *    否则 src/api/api.ts 会 dispatch(logout()) 并跳 /user/login）。
 *
 * 选择器纪律：不断言任何 i18n 文案。本页 3 个标题（"Recent Outcome Review" / "Cost
 * Analysis" / "Usage Proportion"）虽在 src 里是硬编码字面量，但 i18n 管线已收录对应 key
 * （locales 下 apiUsage.json / apiCreditUsage.json / apiUsagePie.json，有 ZH/JA 变体）——
 * ZH 构建下会变中文，断言必碎。故稳定锚点用：① a[href="/model-api/playground"]
 * （href 非 i18n，APIUsageChart 渲染成功的唯一确定性 DOM 锚点）；② canvas 计数=3
 * （三图均挂载）；③ 无 no-permission 兜底图。已在交付报告建议给 src 图表容器补 data-testid。
 */

const ENDPOINTS = {
  "/v1/user/info": loadFixture("models-console-usage-user-info.json"),
  "/v1/user/queryApiUsageByTime": loadFixture(
    "models-console-usage-by-time.json",
  ),
};

test.describe("Models Console · Usage（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("权限通过后从 mocked 数据渲染 3 张用量图，未弹登录、不崩、非兜底", async ({
    page,
  }) => {
    const usageResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/user/queryApiUsageByTime") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/models-console/usage");

    // 客户端取数真的发生且 2xx（Wrapper 挂载 → fetchData → queryApiUsageByTime）
    await usageResp;

    // playground CTA 链接（APIUsageChart 渲染成功的稳定结构锚点；href 非 i18n）。
    // 用它作为「页面客户端渲染完成」的等待点，再做后续断言，避免抢跑挂载期。
    const playgroundLink = page.locator('a[href="/model-api/playground"]');
    await expect(playgroundLink).toHaveCount(1, { timeout: 30_000 });
    await expect(playgroundLink.first()).toBeVisible();

    // 未被弹去登录（seedAuth + mocked /v1/user/info 成功，且 usage 响应非 401）
    await expect(page).not.toHaveURL(/\/login/);

    // 关键行为：权限闸门解析为「有权限」→ 渲染数据 UI 而非 no-permission 兜底块
    // （uuid 存在 + teams:[] → currentTeam=null → checkPermission()=true）。
    await expect(page.locator('img[alt="no permission"]')).toHaveCount(0);

    // 确定性结构：3 张 echarts 图（柱 / 堆叠 / 饼）各渲染成 1 个 <canvas>。
    await expect(page.locator("canvas")).toHaveCount(3);

    // 不触发错误边界（src/app/error.tsx → <h1>Error</h1>）。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("无数据时仍渲染图表骨架、不崩、不弹登录（空 data/taskData）", async ({
    page,
  }) => {
    // 覆盖空态分支：res.data / res.taskData 为空数组（wrapper.tsx 的 else 也置空）。
    // 图表组件 data.map 空数组 → echarts 空图，仍挂载 <canvas>，不应崩。
    await mockBackend(page, {
      endpoints: {
        "/v1/user/info": loadFixture("models-console-usage-user-info.json"),
        "/v1/user/queryApiUsageByTime": { code: 0, data: [], taskData: [] },
      },
    });

    await page.goto("/models-console/usage");

    const playgroundLink = page.locator('a[href="/model-api/playground"]');
    await expect(playgroundLink).toHaveCount(1, { timeout: 30_000 });

    await expect(page).not.toHaveURL(/\/login/);
    // 权限通过 → 不是 no-permission 兜底
    await expect(page.locator('img[alt="no permission"]')).toHaveCount(0);
    // 空数据仍挂载 3 个 canvas（图表骨架在，echarts 容器不消失）
    await expect(page.locator("canvas")).toHaveCount(3);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("uuid 缺失（未登录态）→ 权限闸门隐藏图表，但页面不崩、不报错边界", async ({
    page,
  }) => {
    // 覆盖 PermissionWrapper 的 uuid 缺失分支：info 不带 uuid → state.user.uuid 空 →
    // PermissionWrapper 返回 <></>（既不渲染图、也不渲染 no-permission）。
    // 验证此分支下页面不崩、不触发错误边界（行为门禁的负向覆盖）。
    await mockBackend(page, {
      endpoints: {
        "/v1/user/info": { email: "", uuid: "", teams: [] },
        "/v1/user/queryApiUsageByTime": loadFixture(
          "models-console-usage-by-time.json",
        ),
      },
    });

    await page.goto("/models-console/usage");

    // 等页面进入稳定态：错误边界不出现（用 toHaveCount(0) 的自带重试等待）。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0, { timeout: 30_000 });

    // uuid 空 → 权限闸门渲染空 → 既无图表 canvas、也无 no-permission 兜底。
    await expect(page.locator('a[href="/model-api/playground"]')).toHaveCount(
      0,
    );
    await expect(page.locator('img[alt="no permission"]')).toHaveCount(0);
  });
});
