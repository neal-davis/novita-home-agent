import { test, expect } from "@playwright/test";

/**
 * smoke 真相源（真实 dev 后端 dev-api*.novita.ai）：/models/video/minimax-hailuo-02
 * 是公开营销/demo 页，无需 token，随时可跑（照 pricing smoke 范本，无 token skip）。
 *
 * 该页 demo 表单由静态 defaultCases 驱动、不发页面级数据 XHR；可靠的真实后端信号是
 * 全站 provider 触发的 GET /v3/stripe/promotion（probe 实测：稳定一条、200）。
 * 用 waitForResponse 强校验其 2xx，再做结构断言（demo 表单 + 无错误边界），
 * 即「页面在真实后端下能正常装配」的真相源。
 */
test.describe("@smoke MiniMax Hailuo 02 视频 demo 页（真实后端）", () => {
  test("真实后端 2xx + demo 表单结构渲染、不崩", async ({ page }) => {
    const promotionResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v3/stripe/promotion") &&
        r.request().method() === "GET",
      { timeout: 30_000 },
    );

    await page.goto("/models/video/minimax-hailuo-02", {
      waitUntil: "domcontentloaded",
    });

    // 真实后端强校验：promotion 接口返回 2xx
    const resp = await promotionResp;
    expect(resp.ok()).toBeTruthy();

    // 结构：hero h1 + demo 表单 + 结果区
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('[class*="demo_form_wrapper"]')).toHaveCount(1);
    await expect(page.locator("textarea").first()).toBeVisible();
    await expect(page.locator("#btn-product-generate")).toBeVisible();

    // 未被弹去登录（公开页）
    await expect(page).not.toHaveURL(/\/login/);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
