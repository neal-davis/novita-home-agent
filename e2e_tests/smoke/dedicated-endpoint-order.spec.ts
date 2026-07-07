import { test, expect } from "@playwright/test";

/**
 * smoke（真实 dev 后端）：/dedicated-endpoint-order 是 console 鉴权页，需要
 * E2E_NOVITA_TOKEN，无 token 自动 skip。
 *
 * 该页订单详情来自 localforage（上游真实购买流程写入的 oid），smoke 无法伪造真实
 * 购买态；因此 smoke 聚焦两件可在真实后端验证的事：
 *  ① 页面真正消费的 /v1/enterprise-plan/product-list 端点在真实后端返回 2xx；
 *  ② 无 oid 时页面的真实客户端行为 = 重定向到 /pricing（与 hermetic 对齐的真相源）。
 * 数据值的正确性（折后价/Total/卡片）由 hermetic 层在 mocked 数据上断言。
 */
test.describe("@smoke Dedicated Endpoint Order（真实后端）", () => {
  test.beforeEach(() => {
    test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");
  });

  test("product-list 端点真实 2xx + 无 oid 重定向到 /pricing", async ({
    page,
    context,
  }) => {
    // 注入真实 token（与 hermetic 的 fake token 不同，这里打真实后端）
    await context.addCookies([
      {
        name: "token",
        value: process.env.E2E_NOVITA_TOKEN as string,
        domain: "localhost",
        path: "/",
      },
    ]);

    const productListResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/enterprise-plan/product-list") &&
        r.request().method() === "GET",
      { timeout: 30_000 },
    );

    await page.goto("/dedicated-endpoint-order", {
      waitUntil: "domcontentloaded",
    });

    // ① 真实后端 product-list 2xx
    const resp = await productListResp;
    expect(resp.status(), "product-list should be 2xx").toBeLessThan(300);

    // ② 无 oid → 真实客户端重定向到 /pricing
    await page.waitForURL(/\/pricing/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/pricing/);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
