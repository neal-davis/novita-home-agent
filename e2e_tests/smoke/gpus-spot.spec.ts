import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/gpus-spot（营销/公开页，无需登录，随时可跑）。
 *
 * 强校验真实后端：GPUPricing 客户端发 GET {service_base_url}/api/v1/market/products?billingMethod=spot，
 * waitForResponse 断言它真实 2xx；再断结构（FirstPage h1 + 价格区桌面容器 + 价格卡片非空 + 无错误边界）。
 * 不断言具体价格数值（真实库存/定价会变，那是 hermetic 层用 fixture 锁定的）。
 */
test.describe("@smoke GPU Spot marketing page（真实后端）", () => {
  test("真实 /api/v1/market/products 2xx 且价格区从真实数据渲染", async ({
    page,
  }) => {
    const productsResp = page.waitForResponse(
      (r) =>
        r.url().includes("/api/v1/market/products") &&
        r.request().method() === "GET",
      { timeout: 30_000 },
    );

    await page.goto("/gpus-spot", { waitUntil: "domcontentloaded" });

    // 真实后端命中并 2xx
    const resp = await productsResp;
    expect(
      resp.status(),
      `market/products status ${resp.status()}`,
    ).toBeLessThan(400);

    // FirstPage 结构（h1）渲染
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });

    // 价格区桌面容器存在
    const desktop = page.locator('[class*="webContainer"]');
    await expect(desktop).toHaveCount(1);

    // 价格卡片从真实数据渲染出来（spot 营销页真实环境通常有 spot 货）。
    // 用 toBeVisible 自带重试等客户端渲染完成；不锁定数值。
    await expect(
      desktop.locator('[class*="GPUPricingCard_box"]').first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(desktop.getByText("/hr/GPU").first()).toBeVisible();

    // 未弹登录、无错误边界
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
