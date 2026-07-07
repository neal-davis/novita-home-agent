import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/model-api/product/remove-background
 * （公开 model-api 图像 demo / 营销页，无需登录）。
 *
 * 营销页随时可跑——不加 token skip 守卫（无 .env.e2e 的 E2E_NOVITA_TOKEN 也照跑）。
 *
 * 该 demo 页内容均为静态/本地计算（示例图 defaultCases、价格 calcPrice 固定价），
 * 唯一真实后端 XHR 是 navbar/footer 的 /v3/stripe/promotion（优惠条）。smoke 用它
 * 作为「真实后端连通 + 页面挂载链路打通」的 2xx 真相源（参照 pricing.spec.ts 纪律）。
 *
 * 断言策略：waitForResponse 强校验真实 /v3/stripe/promotion 2xx，再做结构断言
 * （demo 控件 + 示例图渲染、未弹登录、不触发错误边界）。不断言价格数值——hermetic 层
 * 已断确定性计算值；这里只验真实环境下页面主体可渲染。
 */
test.describe("@smoke Remove Background demo（真实后端）", () => {
  test("真实 promotion 端点 2xx 且 demo 主体从真实页渲染", async ({ page }) => {
    const promoResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v3/stripe/promotion") &&
        r.status() >= 200 &&
        r.status() < 300,
      { timeout: 30_000 },
    );

    await page.goto("/model-api/product/remove-background", {
      waitUntil: "domcontentloaded",
    });

    await promoResp;

    // 公开页：未被弹去登录
    await expect(page).not.toHaveURL(/\/login/);

    // demo 已挂载：Generate 控件（稳定 id #btn-product-generate）可见
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    // 示例图（Showcase）渲染：/case/remove-background/ 资产存在（5 缩略图 + 1 预览原图）
    await expect(
      page.locator('img[src*="/case/remove-background/"]').first(),
    ).toBeVisible();

    // 两个 h1（Hero + Featured 区块），证明页面主体结构完整
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(2);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
