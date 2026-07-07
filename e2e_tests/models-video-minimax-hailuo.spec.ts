import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models/video/minimax-hailuo-02
 * （MiniMax Hailuo 02 视频生成「营销 + demo」页，公开，无需登录）。
 *
 * 页面类型（读 src 实测确认）：
 *  - app/models/video/minimax-hailuo-02/page.tsx 是 server component，本身不取数：渲染
 *    Layout_new（Header + FirstPage hero + {children} + ProductRecommendations + Footer）
 *    包裹 <Case/>。
 *  - Case → CaseWrapper_new（"use client"）→ MinimaxHailuo02 demo（"use client"）。demo 的表单
 *    完全由「客户端本地 state + 静态 defaultCases」驱动，不发列表 XHR；ProductRecommendations
 *    也用静态 config（getAudio/Image/VideoModelList）。
 *    ⇒ 该页 hermetic 渲染**不消费任何后端列表/数据端点**：bare mockBackend() 兜底即可整页渲染
 *      （已用 probe 验证）。这里仍注入一条脱敏后的 /v3/stripe/promotion fixture（全站 provider
 *      会打的真实调用、抓取所得），既演示注入口径、又在未来该页改为消费它时不至于裸奔。
 *  - /models/video/* 不在 LOGIN_REQUIRED_URL，未登录不会被弹去登录 ⇒ 不 seedAuth。
 *  - 「Estimated cost」价格块依赖 fetchModelProductPrice（getBatchPrice）填 redux；本页未触发该
 *    fetch（probe 实测 .price_info 数量为 0、innerText 无 "Estimated cost"）⇒ 不断言价格块。
 *
 * 断言纪律：无 i18n 文案断言。结构锚点用稳定 id（#btn-product-generate，源自 analytics 常量）
 * 与稳定 CSS-module 片段（demo_form_wrapper / demo_result_wrapper / case_item / video_wrapper）、
 * 结构角色（h1/h2/combobox/option）。数据/分支锚点用「源自 src 常量的合成值」：
 *  - 表单初值 prompt = defaultCases[MINIMAX_HAILUO_02][0].prompt（合成文案，非 UI i18n）；
 *  - duration/resolution 的 option 取值（"6s"/"10s"/"768P"/"1080P"，FormContent 里写死的取值，
 *    非 i18n label）。其中 duration=6→resolution ∈ {768P,1080P}，duration=10→resolution 仅 {768P}
 *    且组件强制把 resolution 拉回 768P —— 这是真实条件分支，断言其前后差异即有牙。
 * 页面无 data-testid（见交付报告「建议补 data-testid」）。
 */

const PROMOTION = "models-video-minimax-hailuo-promotion.json";
// defaultCases[MINIMAX_HAILUO_02][0].prompt 的一段独特子串（合成文案，非 i18n）。
const SHOWCASE_PROMPT_FRAGMENT = "retro-futuristic car under a streetlight";

test.describe("MiniMax Hailuo 02 视频 demo 营销页（hermetic）", () => {
  test("公开 demo 页：结构/表单初值/控件完整，未弹登录、不崩", async ({
    page,
  }) => {
    const promotion = loadFixture<{ valid: boolean }>(PROMOTION);
    expect(promotion).toHaveProperty("valid"); // 守卫：fixture 形状即测试前提

    await mockBackend(page, {
      endpoints: { "/v3/stripe/promotion": promotion },
    });
    await page.goto("/models/video/minimax-hailuo-02", {
      waitUntil: "domcontentloaded",
    });

    // --- 首屏 Hero（结构锚点：h1，不断言文案） ---
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
    // h1 共 2 个：hero 标题 + ProductRecommendations 的 "Featured AI APIs"（结构计数，非文案）
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(2);

    // --- 公开页未被弹去登录（未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- demo 容器（表单区 + 结果区）渲染 ---
    await expect(page.locator('[class*="demo_form_wrapper"]')).toHaveCount(1);
    await expect(page.locator('[class*="demo_result_wrapper"]')).toHaveCount(1);

    // --- 表单初值：prompt 文本域回显 showcase 合成 prompt（源自 src 常量，对内容有牙） ---
    const promptArea = page.locator("textarea").first();
    await expect(promptArea).toBeVisible();
    await expect(promptArea).toHaveValue(new RegExp(SHOWCASE_PROMPT_FRAGMENT));

    // --- showcase case item（defaultCases 仅 1 条 → 恰 1 个） ---
    await expect(page.locator('[class*="case_item"]')).toHaveCount(1);

    // --- Generate 按钮（稳定 id，prompt 非空 → 不禁用） ---
    const genBtn = page.locator("#btn-product-generate");
    await expect(genBtn).toBeVisible();
    await expect(genBtn).toBeEnabled();

    // --- 结果区初始为占位（无 video 元素） ---
    await expect(page.locator('[class*="video_wrapper"]')).toHaveCount(1);
    await expect(page.locator("video")).toHaveCount(0);

    // --- discord 支持链接（稳定 href，非 i18n） ---
    await expect(
      page.locator('a[href*="discord.com/invite/Fn3peMYMQf"]'),
    ).toHaveCount(1);

    // --- duration / resolution 选择器（结构角色 combobox），初值 6s / 768P（src 取值，非 i18n） ---
    await expect(
      page.getByRole("combobox").filter({ hasText: "6s" }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("combobox").filter({ hasText: "768P" }),
    ).toHaveCount(1);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("交互/分支：duration 6→10 时 resolution 选项从 {768P,1080P} 收敛到 {768P} 且被强制回 768P", async ({
    page,
  }) => {
    await mockBackend(page);
    await page.goto("/models/video/minimax-hailuo-02", {
      waitUntil: "domcontentloaded",
    });

    const resCombo = page.getByRole("combobox").filter({ hasText: "768P" });
    await expect(resCombo).toBeVisible({ timeout: 30_000 });

    // --- 分支前置：duration=6 时 resolution 选项 = [768P, 1080P] ---
    await resCombo.click();
    await expect(page.getByRole("option").first()).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(2);
    await expect(
      page.getByRole("option", { name: "1080P", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("option")).toHaveCount(0); // listbox 关闭

    // --- 切 duration 6s → 10s ---
    const durationCombo = page.getByRole("combobox").filter({ hasText: "6s" });
    await durationCombo.click();
    await expect(page.getByRole("option").first()).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(2); // [6s, 10s]
    await page.getByRole("option", { name: "10s", exact: true }).click();

    // duration 触发器已变为 10s（确认选择生效）
    await expect(
      page.getByRole("combobox").filter({ hasText: "10s" }),
    ).toHaveCount(1);

    // --- 分支结果：resolution 被强制回 768P，且选项收敛为仅 [768P]（1080P 消失） ---
    const resAfter = page.getByRole("combobox").filter({ hasText: "768P" });
    await expect(resAfter).toHaveCount(1);
    await resAfter.click();
    await expect(page.getByRole("option").first()).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(1); // 仅 768P
    await expect(
      page.getByRole("option", { name: "1080P", exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");

    // 交互全程不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("后端兜底失败（500 通配）：静态 demo 结构仍渲染、未弹登录、不崩", async ({
    page,
  }) => {
    // 该页 hermetic 不消费列表端点，故把所有后端调用打成 500 也不应让页面崩——
    // 验证 demo 的本地 state 渲染对后端鲁棒（错误边界不触发、表单仍在）。
    await mockBackend(page, { failEndpoints: { "/": 500 } });
    await page.goto("/models/video/minimax-hailuo-02", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).not.toHaveURL(/\/login/);

    // 表单 + 结果区仍渲染
    await expect(page.locator('[class*="demo_form_wrapper"]')).toHaveCount(1);
    await expect(page.locator("textarea").first()).toBeVisible();
    await expect(page.locator("#btn-product-generate")).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
