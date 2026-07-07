import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/gpus（营销/公开页，无需登录，随时可跑）。
 *
 * 强校验真实后端：GpusSpecsSection 客户端发 GET {service_base_url}/api/v1/market/products，
 * waitForResponse 断言它真实 2xx；再断结构（Hero h1 + 价格表容器 + 无错误边界）。
 * 不断言具体价格数值（真实库存/定价会变，那是 hermetic 层用 fixture 锁定的）。
 */
test.describe("@smoke GPUs marketing page（真实后端）", () => {
  test("真实 /api/v1/market/products 2xx 且页面结构从真实数据渲染", async ({
    page,
  }) => {
    const productsResp = page.waitForResponse(
      (r) =>
        r.url().includes("/api/v1/market/products") &&
        r.request().method() === "GET",
      { timeout: 30_000 },
    );

    await page.goto("/gpus", { waitUntil: "domcontentloaded" });

    // 真实后端命中并 2xx
    const resp = await productsResp;
    expect(
      resp.status(),
      `market/products status ${resp.status()}`,
    ).toBeLessThan(400);

    // Hero 结构（h1）渲染
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });

    // 价格表容器存在
    await expect(page.locator(".min-w-\\[980px\\]")).toHaveCount(1);

    // 价格行从真实数据渲染出来（至少一条 '/hr/GPU' 或表格非空——真实环境通常有货）。
    // 用 toBeVisible 自带重试等客户端渲染完成；不锁定数值。
    await expect(page.getByText("/hr/GPU").first()).toBeVisible({
      timeout: 15_000,
    });

    // 未弹登录、无错误边界
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
