import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/gpu-baremetal（营销/公开页，无需登录，随时可跑；不加 token skip）。
 *
 * 页面主体（Hero + GpuBareMetalPageContent）是静态 server component、不发业务 XHR，
 * 但共享导航/促销上下文会对真实后端发 GET /v3/stripe/promotion。smoke 用 waitForResponse
 * 强校验它真实 2xx（证明真实后端可达 + 该路由集成链路通），再断页面结构从真实渲染出来。
 * 不锁定具体促销内容/价格数值（那是 hermetic 层用 fixture 锁的）。
 */
test.describe("@smoke GPU Bare Metal marketing page（真实后端）", () => {
  test("真实 /v3/stripe/promotion 2xx 且静态页结构从真实渲染", async ({
    page,
  }) => {
    // 共享 dev server 冷编译该路由可能耗时 60s+（多 agent 抢占）；navigation 给足超时，
    // promo 真实响应等待时窗也对齐——避免把环境冷启误判成测试失败。
    const promoResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v3/stripe/promotion") &&
        r.request().method() === "GET",
      { timeout: 90_000 },
    );

    await page.goto("/gpu-baremetal", {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });

    // 真实后端命中并 2xx（promo 调用来自共享导航上下文，证明真实后端可达）
    const resp = await promoResp;
    expect(
      resp.status(),
      `stripe/promotion status ${resp.status()}`,
    ).toBeLessThan(400);

    // Hero 结构（h1）渲染
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });

    // 内容主体：Solutions 区块 8 张 GPU 卡片从真实页面渲染
    const solutions = page.locator('section[aria-label="Solutions"]');
    await expect(solutions).toHaveCount(1);
    await expect(solutions.locator("article")).toHaveCount(8);

    // 型号名（跨 i18n 变体恒定的 SKU 专名）渲染出来
    await expect(
      page.getByText("H100 SXM", { exact: true }).first(),
    ).toBeVisible();

    // 未弹登录、无错误边界
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
