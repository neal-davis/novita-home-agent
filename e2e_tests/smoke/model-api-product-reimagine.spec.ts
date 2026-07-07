import { test, expect } from "@playwright/test";

/**
 * smoke（真实 dev 后端）：/model-api/product/reimagine 是已弃用产品路由，公开页、无需登录
 * → 不加 token skip 守卫（参照 smoke/pricing.spec.ts、smoke/model-api-product-img2img.spec.ts）。
 *
 * 真相源校验：
 *  - 重定向真相：真实 middleware 把该弃用产品路由 302 重定向到 /models/end-of-service（真实落地）。
 *  - waitForResponse 强校验真实后端：落地的弃用页 Header 挂载时发
 *    GET {service_base_url}/v3/stripe/promotion，实测真实 dev 后端返回 200。
 *  - 结构断言：弃用插图（img[alt="end-of-service"]）+ 推荐位 section（aria 锚点）
 *    + 弃用 API 清单含 "Reimagine"（本路由弃用身份）从真实后端渲染 + 不触发错误边界。
 */
test.describe("@smoke Reimagine deprecated product → end-of-service（真实后端）", () => {
  test("真实后端：弃用路由重定向落地 end-of-service，promotion 2xx + 弃用页结构出现、不崩", async ({
    page,
  }) => {
    // 强校验真实后端 2xx（落地弃用页挂载时确定触发）。
    const promotionResp = page.waitForResponse(
      (resp) =>
        resp.url().includes("/v3/stripe/promotion") && resp.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/model-api/product/reimagine", {
      waitUntil: "domcontentloaded",
    });

    await promotionResp; // 真实后端 promotion 返回 200

    // 真实 middleware 重定向落地 end-of-service
    await expect(page).toHaveURL(/\/models\/end-of-service/);

    // 弃用页核心结构从真实后端渲染（稳定 id/aria/alt，非 i18n）
    await expect(
      page.locator("#end-of-service-suggestions-heading"),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('img[alt="end-of-service"]')).toHaveCount(1);
    await expect(
      page.locator(
        'section[aria-labelledby="end-of-service-suggestions-heading"]',
      ),
    ).toBeVisible();

    // 本路由弃用身份：弃用清单含 "Reimagine"（FUNC_DISPLAY_NAME.REIMAGINE）
    await expect(
      page.locator("ul.list-none.grid.grid-cols-3 > li", {
        hasText: "Reimagine",
      }),
    ).toHaveCount(1);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
