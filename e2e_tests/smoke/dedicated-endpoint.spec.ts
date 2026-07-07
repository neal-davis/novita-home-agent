import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/dedicated-endpoint（公开营销页，无需登录）。
 *
 * 营销页随时可跑——不加 token skip 守卫（无 .env.e2e 的 E2E_NOVITA_TOKEN 也照跑）。
 * 该页客户端 DedicatedEndpointGpuBudgetList 经 useDedicatedGpuPricing →
 * getLLMDedicatedSpec()（无 token → 命中 /api/v1/llm/dedicated/spec）打真实后端。
 *
 * 断言策略（参照 pricing.spec.ts + e2e-test-author 纪律）：
 *  - waitForResponse 强校验真实 /api/v1/llm/dedicated/spec 2xx（后端契约的真相源）；
 *  - 再做结构断言（静态定价表出现、未弹登录、不触发错误边界）。
 *  - 不断言具体价格——真实价目会变；确定性价格行断言在 hermetic 层。
 */
test.describe("@smoke Dedicated Endpoint（真实后端）", () => {
  test("真实 spec 端点 2xx 且渲染定价主体", async ({ page }) => {
    const specResp = page.waitForResponse(
      (r) =>
        r.url().includes("/api/v1/llm/dedicated/spec") &&
        r.request().method() === "GET" &&
        r.status() >= 200 &&
        r.status() < 300,
      { timeout: 30_000 },
    );

    await page.goto("/dedicated-endpoint", { waitUntil: "domcontentloaded" });

    await specResp;

    // 公开页：未被弹去登录
    await expect(page).not.toHaveURL(/\/login/);

    // 静态定价表出现（表头列名 "Price / GPU-hour" 是源码字面量，非 i18n）。
    // <th> 不暴露 columnheader role，故用 <th> 文案定位。
    await expect(
      page.locator("th", { hasText: "Price / GPU-hour" }).first(),
    ).toBeVisible({ timeout: 30_000 });

    // 关键区块标题（硬编码字面量）出现，证明页面主体渲染完整
    await expect(
      page.getByRole("heading", { name: "Transparent GPU Pricing" }),
    ).toBeVisible();

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
