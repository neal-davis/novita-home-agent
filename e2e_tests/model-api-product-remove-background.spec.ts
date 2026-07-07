import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/model-api/product/remove-background
 * （公开 model-api 图像 demo / 营销页 · 无需登录）。
 *
 * 页面类型（写断言前读 src 确认）：
 *  - remove-background/page.tsx 是同步 server component，包 <Layout_new>（Header + FirstPage_new
 *    Hero + {children} + ProductRecommendations + Footer）+ <Case>（"use client"）。
 *  - <Case> → <CaseWrapper_new>（"use client"）→ <RemoveBackground>（"use client"）demo 组件。
 *  - 该页**没有内容驱动的客户端取数**：
 *      · 示例图（Showcase）来自静态 defaultCases[REMOVE_BACKGROUND]（5 张固定图，无 XHR）。
 *      · "Estimated cost" 由 calcPrice(REMOVE_BACKGROUND) 算出——REMOVE_BACKGROUND 命中
 *        pricing.ts getFixedPrice() 的固定价 0.017（**不读 Redux/不发 XHR**），
 *        formatMoneyDisplay(0.017)="0.017" → 渲染 "Estimated cost:$0.017/image"（确定性、非 i18n）。
 *      · ProductRecommendations 用静态 model-library-config（getAudio/Image/VideoModelList，无 XHR）。
 *    实测页面唯一 XHR 是 navbar/footer 的 /v3/stripe/promotion（优惠条），显式注入避免走兜底壳子。
 *
 * RSC 边界：本页客户端组件的内容均为静态/本地计算，page.route 拦不到也无需拦——
 *  hermetic 断「结构 + 确定性计算值 + 不崩 + 未弹登录」，数据正确性（真实接口）交给 smoke。
 *
 * 选择器纪律（本仓库 JSX 文案经 i18n 管线，**绝不断言 i18n 文案**）：
 *  - 锚点优先用稳定 id：Generate 按钮 #btn-product-generate（analytics 常量 PRODUCT_GEN_BTN_ID，
 *    源自 getGenBtnId("product")，跨构建稳定）。
 *  - 示例图用稳定资源路径 src*="/case/remove-background/"（静态资产 URL，非文案）。
 *  - 结构用 heading level 计数（role，不带 name）。
 *  - 数据锚点用 calcPrice 算出的确定性价格串 "$0.017/image"（计算值，非 UI 文案）——
 *    它对 pricing 契约有牙：改成 "$0.018/image" 即 FAIL（见交付报告变异说明）。
 *  - 交互纪律：实测 Playwright 合成点击不路由到 demo 内 <div> 的 React 监听（preview 大图
 *    absolute 覆盖 + 指针路由 artifact，直接 invoke React onClick 可改状态 → 行为本身正确、
 *    非 src bug），故按 MEMORY 指引用「渲染态数据绑定」而非 flaky 点击：断言初始
 *    Showcase↔Preview 绑定（active 缩略图==preview 原图==case1.png），并用 promotion 500
 *    降级作为分支测试（有牙）。
 *
 * 页面零 data-testid（已在交付报告建议补 data-testid，便于稳定锚定 demo 控件/参数面板）。
 */

const PROMOTION = "/v3/stripe/promotion";
const PROMOTION_FIXTURE = loadFixture("remove-background-promotion.json");

/** 示例图缩略图（Showcase）：src 指向 /case/remove-background/ 的固定资产。 */
const caseImgs = (page: Page) =>
  page.locator('img[src*="/case/remove-background/"]');

/** 当前选中（active）的示例缩略图容器（CSS-module 局部名片段 case_item_active）。 */
const activeThumb = (page: Page) => page.locator('[class*="case_item_active"]');

/** 大图预览区内的原图（preview_wrapper 作用域内的 <img>）。 */
const previewImg = (page: Page) =>
  page.locator('[class*="preview_wrapper"] img').first();

test.describe("Remove Background demo（hermetic）", () => {
  test("公开 demo 页：结构 + 示例图 + 确定性价格 + 初始 Showcase↔Preview 绑定，未弹登录、不崩", async ({
    page,
  }) => {
    await mockBackend(page, { endpoints: { [PROMOTION]: PROMOTION_FIXTURE } });
    await page.goto("/model-api/product/remove-background", {
      waitUntil: "domcontentloaded",
    });

    // 稳定锚点：Generate 按钮（demo 已挂载、客户端组件就绪的信号）。
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    // --- 公开页：未被弹去登录（未 seedAuth 也应停留原路由） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);

    // === 结构：两个 h1（Hero 标题 + ProductRecommendations "Featured" 区块） ===
    // 用 heading level 计数（结构角色，不断言文案）。
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(2);

    // === Showcase：5 张静态缩略图 + preview 原图（preview 过渡态可能瞬时多一张 result 图，
    //     故用 ≥6 容差而非精确计数；5 张具名缩略图在下方逐一强断言，才是稳定契约） ===
    expect(await caseImgs(page).count()).toBeGreaterThanOrEqual(6);
    // 5 个缩略图各自的固定资产路径都渲染（defaultCases 契约，资产 URL 非文案）。
    for (const file of [
      "case1.png",
      "case2.jpg",
      "case3.png",
      "case4.jpg",
      "case5.png",
    ]) {
      await expect(
        page.locator(`img[src*="/case/remove-background/${file}"]`).first(),
      ).toBeVisible();
    }

    // === Generate 控件：稳定 id 可见且初始可点（imgSrc 预置 case1 → 非 disabled） ===
    const genBtn = page.locator("#btn-product-generate");
    await expect(genBtn).toBeVisible();
    await expect(genBtn).toBeEnabled();

    // === 确定性价格（calcPrice 固定价 0.017 → formatMoneyDisplay → "$0.017/image"） ===
    // 该串是计算值（非 i18n 文案），对 pricing 契约有牙：改成 $0.018/image 即 FAIL（已变异验证）。
    // demo 的 "Estimated cost" 在 price_info 作用域内的 <strong>（精确锚定，避开下方推荐卡同价串）。
    await expect(
      page.locator('[class*="price_info"]').getByText("$0.017/image", {
        exact: true,
      }),
    ).toBeVisible();

    // === 初始 Showcase↔Preview 数据绑定（demo 数据流就位的渲染态证据） ===
    // curCase 初始 0 → 恰 1 个 active 缩略图，且其图是 case1.png；
    // preview 原图同步为 case1.png（imgSrc=useCases[0].img）。
    await expect(activeThumb(page)).toHaveCount(1);
    await expect(
      activeThumb(page).locator('img[src*="case1.png"]'),
    ).toHaveCount(1);
    await expect(previewImg(page)).toHaveAttribute(
      "src",
      /\/case\/remove-background\/case1\.png$/,
    );

    // === ProductRecommendations：静态 model 卡片区渲染（结构存在，不断文案） ===
    // 该区块把 audio/image/video 模型映射成行卡，至少渲染若干 <a> 链接卡。
    await expect(page.getByRole("heading", { level: 1 }).nth(1)).toBeVisible();
  });

  test("唯一 XHR(/v3/stripe/promotion) 失败(500)：页面静态结构与 demo 仍渲染、未弹登录、不崩", async ({
    page,
  }) => {
    // 分支/降级：navbar/footer 的 promotion 端点 500，页面其余（demo + 静态区块）应不受影响。
    await mockBackend(page, { failEndpoints: { [PROMOTION]: 500 } });
    await page.goto("/model-api/product/remove-background", {
      waitUntil: "domcontentloaded",
    });

    // demo 仍挂载（Generate 控件在）
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    // 静态结构与确定性价格仍渲染（与 promotion 端点无关）
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(2);
    expect(await caseImgs(page).count()).toBeGreaterThanOrEqual(6);
    await expect(
      page.locator('[class*="price_info"]').getByText("$0.017/image", {
        exact: true,
      }),
    ).toBeVisible();

    // 不触发错误边界、未弹登录
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/login/);
  });
});
