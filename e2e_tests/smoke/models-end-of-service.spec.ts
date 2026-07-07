import { test, expect } from "@playwright/test";

/**
 * smoke（真实 dev 后端，dev-api.novita.ai）：/models/end-of-service 是公开「服务终止」通告页，
 * 无需登录 → 无 token skip 守卫（参照 smoke/pricing.spec.ts）。
 *
 * 页面主体 EndOfService 完全静态（无 XHR）；唯一后端调用是共享 promo 上下文的
 * /v3/stripe/promotion。smoke 在真实后端上校验：
 *   ① 该端点真实返回 2xx（页面唯一的后端依赖健康）；
 *   ② 静态结构（示例图 + 弃用列表 + 推荐区块）从真实环境渲染、不崩。
 */
test.describe("@smoke End-of-Service 通告页（真实后端）", () => {
  test("真实后端下静态通告结构渲染、促销端点 2xx、不崩", async ({ page }) => {
    // 强校验：共享 promo 上下文的端点真实返回 2xx（页面唯一后端依赖）。
    const promoResp = page.waitForResponse(
      (r) => r.url().includes("/v3/stripe/promotion") && r.status() < 400,
      { timeout: 30_000 },
    );

    await page.goto("/models/end-of-service", {
      waitUntil: "domcontentloaded",
    });

    await promoResp;

    // 静态主体从真实环境渲染：示例图 + 弃用列表 + 推荐区块
    await expect(page.locator('img[alt="end-of-service"]')).toHaveCount(1, {
      timeout: 30_000,
    });
    await expect(page.locator("ul.grid-cols-3 li").first()).toBeVisible();
    await expect(
      page.locator(
        'section[aria-labelledby="end-of-service-suggestions-heading"] a',
      ),
    ).toHaveCount(4);

    // 未弹登录、不触发错误边界
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
