import { test, expect } from "@playwright/test";

/**
 * smoke（真实 dev 后端）：/model-api/product/img2img 是公开 image-to-image demo / 营销页，
 * 无需登录 → 不加 token skip 守卫（参照 smoke/pricing.spec.ts）。
 *
 * 真相源校验：
 *  - waitForResponse 强校验真实后端：页面挂载时发 GET {service_base_url}/v3/stripe/promotion
 *    （configSlice queryUserDiscount），实测真实 dev 后端返回 200。
 *  - 结构断言：demo 的 Generate 控件（稳定 id #btn-product-generate）渲染 + 3 张示例原图
 *    （/case/img2img/ori_*）从真实静态资源 200 加载 + 不触发错误边界。
 */
test.describe("@smoke Image-to-Image product demo（真实后端）", () => {
  test("真实后端渲染 demo：promotion 2xx + 示例/控件出现、不崩", async ({
    page,
  }) => {
    // 强校验真实后端 2xx（该调用在本页挂载时确定触发）。
    const promotionResp = page.waitForResponse(
      (resp) =>
        resp.url().includes("/v3/stripe/promotion") && resp.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/model-api/product/img2img", {
      waitUntil: "domcontentloaded",
    });

    await promotionResp; // 真实后端 promotion 返回 200

    // demo 主控件（稳定 id）渲染
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    // 3 张示例原图从真实资源渲染（静态资源 src，非 i18n）
    await expect(page.locator('img[src*="/case/img2img/ori_"]')).toHaveCount(3);

    // prompt 输入区可见
    await expect(page.getByRole("textbox").first()).toBeVisible();

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
