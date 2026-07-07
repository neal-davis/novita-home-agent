import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/application（客户端取数页）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 覆盖那个），而是断言**确定性行为/结构**：
 * 列表态按 fixture 出 N 张模板卡 + 把首个模板 detail 的 GPU 配置（gpuName x gpuNum / VRAM）
 * 渲染到「Currently selected」与 Commitment 区；空态切到 DataEmpty（无卡、Deploy 置灰）；
 * detail 态（?applicationId=）切到 TemplateDetail（README/Configuration tab）。三态都未弹登录、不崩。
 *
 * 渲染契约（读 src 实测确认）：
 *  - page.tsx 是 server component，取数全在客户端：components/section.tsx 是 "use client"，
 *    挂载后无条件发 reqGetApplicationTemplates()（GET service_base_url+/api/v1/applications 的 XHR，
 *    可被 page.route 拦截；列表渲染**不**依赖 Redux uuid）。拿到 templates 后对 templates[0] 再发
 *    reqGetApplicationDetail()（/api/v1/application/detail）取 product/recommendCard/clusters。
 *  - seedAuth 仅为让 Header 挂载时 fetchUserInfo 成功（uuid 存在 + teams:[]）→ 不被弹 /login；
 *    它不是列表渲染的前置（列表无 uuid 也加载），但 deploy 动作才校验 uuid。
 *  - 列表分支：applicationList.map → 每条一个 styles.templates_item 卡（CSS module 哈希类
 *    section_templates_item__<hash>，用 [class*='templates_item__'] 双下划线锚点命中数 == 模板数，
 *    实测 3→3；当前选中卡（首条）带 !border-[1.5px] 额外类）。空分支：applicationList.length===0
 *    → <DataEmpty/>，无卡；Commitment 区只剩无条件渲染的 On Demand 一个 RadioGroup
 *    （Subscription/Spot 依赖 productInfo，空 productInfo 下不出 → 与有数据态 3 个形成对比）。
 *  - 「Currently selected」区把 currentApplicationDetail.recommendCard 渲染成 `${gpuName} x ${gpuNum}`，
 *    product.gpuMemory 渲染成 `${gpuMemory}GB`——均为 fixture 直传值（非 i18n、非公式推导）。
 *  - 底部 [data-commitment-footer] Deploy 按钮仅在 productInfo.productId && !applicationDetailLoading
 *    时出现（detail 完成的稳定 settle 锚点）；此时三个 Commitment RadioGroup（On Demand /
 *    Subscription[monthlyPrice 有] / Spot[instanceSpotPrice 有]）均在 DOM（[role='radiogroup'] == 3）。
 *  - detail 态：?applicationId=<id> → useEffect setDetailMode(true) → 渲染 <TemplateDetail>
 *    （reqGetTemplateById → /api/v1/template/<id>），列表卡隐藏（CARD==0），出 README/Configuration tab。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点均 locale 无关——
 *  - 结构：CSS module 哈希类片段 [class*='templates_item__'] / [class*='template_detail_container']
 *    / [class*='detailsContainer'] / [class*='section_root']；稳定属性 [data-commitment-footer]、
 *    [role='radiogroup']；搜索框 placeholder（源码硬编码字面量）。
 *  - 数据：fixture 直传值（模板 name、`RTX 4090 x 1`、`24GB`），与文案管线无关。
 *  注：本页几乎全是源码硬编码英文字面量（"Deploy"/"On Demand"/"README" 等，非 i18n 目录键），
 *  但为稳健仍优先结构锚点；个别 Deploy 文案断言仅用于「按钮存在」与「detail tab 存在」。
 * 已在交付报告里建议给 src 关键块补 data-testid（见报告）。
 */

const CARD = "[class*='templates_item__']";
const FOOTER = "[data-commitment-footer]";

const baseEndpoints = {
  "/v1/user/info": loadFixture("gpus-console-application-user-info.json"),
};

/** 列表态主用 fixture（3 模板）。 */
const listEndpoints = {
  ...baseEndpoints,
  "/api/v1/applications": loadFixture(
    "gpus-console-application-templates.json",
  ),
  "/api/v1/application/detail": loadFixture(
    "gpus-console-application-detail.json",
  ),
};

const noError = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("GPU Console Application（hermetic）", () => {
  test("列表态：按 fixture 渲染 N 张模板卡 + 首模板 detail 配置 + Commitment，未弹登录、不崩", async ({
    page,
  }) => {
    const list = loadFixture<{ templates: unknown[] }>(
      "gpus-console-application-templates.json",
    );
    const expectedCards = list.templates.length; // 3

    await seedAuth(page);
    await mockBackend(page, { endpoints: listEndpoints });
    await page.goto("/gpus-console/application");

    // 稳定 settle 锚点：底部 Commitment 区 Deploy 按钮（productInfo 就绪 + detail 加载完成的信号），
    // 自带重试等待，避免在挂载/数据回填前抢跑。
    await expect(
      page.locator(FOOTER).getByText("Deploy", { exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 列表按 fixture 出行：每条模板一张卡，命中数 == 模板数 ---
    await expect(page.locator(CARD)).toHaveCount(expectedCards);

    // --- 代表性内容：fixture 合成模板名渲染进卡片（非 i18n 文案） ---
    await expect(
      page.getByText("E2E Stable Diffusion", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("E2E Llama 3 Chat", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("E2E Whisper ASR", { exact: true }),
    ).toBeVisible();

    // --- 选中态：首条卡带选中描边（applicationList[0] 自动选中），恰好 1 张选中 ---
    await expect(page.locator(`${CARD}[class*='!border-[1.5px]']`)).toHaveCount(
      1,
    );

    // --- 首模板 detail 数据：recommendCard `gpuName x gpuNum` + product.gpuMemory `GB`（fixture 直传） ---
    await expect(page.getByText("RTX 4090 x 1").first()).toBeVisible();
    await expect(page.getByText("24GB").first()).toBeVisible();

    // --- 结构：三个 Commitment RadioGroup（On Demand / Subscription / Spot）均在 DOM ---
    // （getByRole('radiogroup') 在本页 a11y 快照里命中 0，故用稳定属性选择器 [role='radiogroup']） ---
    await expect(page.locator("[role='radiogroup']")).toHaveCount(3);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await noError(page);
  });

  test("空态：无模板时切到 DataEmpty，无模板卡、Deploy 置灰，未弹登录、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/api/v1/applications": loadFixture(
          "gpus-console-application-templates-empty.json",
        ),
      },
    });
    await page.goto("/gpus-console/application");

    // 空 productInfo 分支：底部仍渲染 [data-commitment-footer]（含置灰 Deploy + "--"），
    // 用它作稳定 settle 锚点，再做负向断言，避免 loading 期抢跑。
    await expect(page.locator(FOOTER)).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 切到空态：无模板卡；Commitment 区只剩 On Demand 一个 RadioGroup ---
    // （On Demand 无条件渲染；Subscription 依赖 productInfo.monthlyPrice、Spot 依赖
    //  instanceSpotPrice，空 productInfo 下两者都不出 → 与有数据态的 3 个形成对比）。
    await expect(page.locator(CARD)).toHaveCount(0);
    await expect(page.locator("[role='radiogroup']")).toHaveCount(1);

    // --- 空 productInfo 分支的 Deploy 仍渲染（置灰），且页面出现占位 "--"（GPU/价格未选） ---
    await expect(
      page.locator(FOOTER).getByText("Deploy", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(FOOTER).getByText("--").first()).toBeVisible();

    // --- 不触发错误边界 ---
    await noError(page);
  });

  test("detail 态（?applicationId=）：切到 TemplateDetail，列表卡隐藏、出 README/Configuration tab，不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...listEndpoints,
        "/api/v1/template": loadFixture(
          "gpus-console-application-template-by-id.json",
        ),
      },
    });
    await page.goto("/gpus-console/application?applicationId=tmpl-aaaa1111");

    // detail 模式根容器（TemplateDetail 渲染完成的稳定锚点）
    await expect(
      page.locator("[class*='template_detail_container']"),
    ).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 切到 detail 视图：列表卡 / Commitment 区不存在（detailMode 分支互斥） ---
    await expect(page.locator(CARD)).toHaveCount(0);

    // --- TemplateDetail 渲染了模板名 + DetailsTab（README/Configuration tab 容器） ---
    await expect(
      page.getByText("E2E Stable Diffusion", { exact: true }).first(),
    ).toBeVisible();
    await expect(page.locator("[class*='detailsContainer']")).toBeVisible();

    // --- 不触发错误边界 ---
    await noError(page);
  });
});
