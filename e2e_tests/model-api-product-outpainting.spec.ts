import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/model-api/product/outpainting（公开营销/demo 路由）。
 *
 * 页面类型 & 关键发现（读 src + :3101 实测确认）：
 *  - app/model-api/product/outpainting/page.tsx 渲染 <Layout><Case/></Layout>，Case 里是
 *    Outpainting 图像 demo（Dragger 上传 + Cropper + Generate）。**但这段 demo 是死代码**：
 *    src/middleware.ts（"deprecated product pages" 段，L337-362）对 /product/<name> 做服务端判定——
 *    FUNCS.OUTPAINTING.productpageReady === false（funcs.ts L699）⇒ funcFilter(OUTPAINTING,"product")
 *    返回 false ⇒ doRedirect=true ⇒ **302 重定向到 /models/end-of-service**。
 *    该重定向硬编码于源码（非 flag/locale/env 依赖），默认 EN 无前缀请求即触发，故 Playwright 导航
 *    必然落到 end-of-service 页。outpainting 这个路由真正的「契约」就是这条退役重定向。
 *  - 重定向发生在 middleware（serverImpact）——page.route() 拦不到，是真实服务端跳转。
 *    本 spec 因此断「跳转后 end-of-service 页结构渲染正确 + 未误弹登录 + 不崩」，数据正确性交给 smoke。
 *  - end-of-service 页（EndOfService.tsx）：服务端组件壳 + "use client" 内容，无业务 XHR；
 *    唯一后端信号是共享 Header 的 /v3/stripe/promotion（capture 抓到的就是它），用 mockBackend 注入兜底。
 *
 * 选择器纪律：无 i18n 文案断言。锚点全部用 i18n 免疫的稳定结构：
 *  - 标题 id `#end-of-service-suggestions-heading` / section[aria-labelledby] / img[alt="end-of-service"]
 *    （alt 是硬编码属性，非 JSX prose）；
 *  - 4 张推荐卡按 href（URL，绝不过 i18n）逐一断言，且 scope 在 section 内（页面别处也有 /sandbox 链接）；
 *  - 退役 API 列表 `ul.grid li` 计数 == deprecatedAPIs.length（源码 29 条，结构性、确定性）；
 *  - 退役日期红字 `span.text-red-600` == "December 31, 2024"（日期字面量，非 prose，确定性）。
 *  端到端无 data-testid（见交付报告「建议补 data-testid」）。
 */

const STRIPE_PROMOTION = "model-api-product-outpainting-stripe-promotion.json";

const DEPRECATED_API_COUNT = 29; // src/app/components/error/EndOfService.tsx deprecatedAPIs 数组长度
const RECOMMEND_CARD_HREFS = [
  "/model-api",
  "/serverless",
  "/gpu-instance",
  "/sandbox",
];

test.describe("Outpainting product page → end-of-service 退役重定向（hermetic）", () => {
  test("访问已退役的 outpainting 产品页 → 落到 end-of-service，结构完整、未弹登录、不崩", async ({
    page,
  }) => {
    const promo = loadFixture(STRIPE_PROMOTION);
    await mockBackend(page, {
      endpoints: { "/v3/stripe/promotion": promo },
    });

    await page.goto("/model-api/product/outpainting", {
      waitUntil: "domcontentloaded",
    });

    // --- 退役契约：middleware 302 把 outpainting 产品页跳到 end-of-service ---
    await expect(page).toHaveURL(/\/models\/end-of-service$/, {
      timeout: 30_000,
    });
    // 未被误弹去登录（公开页，未 seedAuth）
    await expect(page).not.toHaveURL(/\/login/);

    // --- end-of-service 关键结构（i18n 免疫的 id / aria / alt 锚点） ---
    await expect(
      page.locator("#end-of-service-suggestions-heading"),
    ).toHaveCount(1, { timeout: 30_000 });
    await expect(
      page.locator(
        'section[aria-labelledby="end-of-service-suggestions-heading"]',
      ),
    ).toHaveCount(1);
    await expect(page.locator('img[alt="end-of-service"]')).toBeVisible();

    // --- 4 张推荐产品卡：section 内按 href 逐一断言（URL 锚点，确定性） ---
    const section = page.locator(
      'section[aria-labelledby="end-of-service-suggestions-heading"]',
    );
    await expect(section.locator("a[href]")).toHaveCount(
      RECOMMEND_CARD_HREFS.length,
    );
    for (const href of RECOMMEND_CARD_HREFS) {
      await expect(section.locator(`a[href="${href}"]`)).toHaveCount(1);
    }

    // --- 退役 API 列表：结构性行数（源码 29 条，确定性） ---
    await expect(page.locator("ul.grid li")).toHaveCount(DEPRECATED_API_COUNT);

    // --- 退役日期红字（日期字面量，非 i18n prose） ---
    await expect(page.locator("span.text-red-600")).toHaveText(
      "December 31, 2024",
    );

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("后端 /v3/stripe/promotion 500：end-of-service 退役页仍正常渲染、不崩", async ({
    page,
  }) => {
    // navbar 的 promotion 调用失败不应拖垮整页（end-of-service 内容不依赖它）。
    await mockBackend(page, {
      failEndpoints: { "/v3/stripe/promotion": 500 },
    });

    await page.goto("/model-api/product/outpainting", {
      waitUntil: "domcontentloaded",
    });

    // 退役重定向仍发生
    await expect(page).toHaveURL(/\/models\/end-of-service$/, {
      timeout: 30_000,
    });
    await expect(page).not.toHaveURL(/\/login/);

    // 核心结构仍在
    await expect(
      page.locator("#end-of-service-suggestions-heading"),
    ).toHaveCount(1, { timeout: 30_000 });
    await expect(page.locator("ul.grid li")).toHaveCount(DEPRECATED_API_COUNT);

    // 失败分支不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
