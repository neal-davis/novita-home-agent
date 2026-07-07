import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/models/video/wan-2.1（公开 demo/营销页，无需登录，随时可跑）。
 *
 * 此页是「静态 + 交互」demo：挂载时不发数据 XHR（示例/模型来自静态 defaultCases），
 * 故 smoke 的「真实后端 2xx」校验落在**路由文档本身**——真实 dev server 必须 2xx 返回页面，
 * 而非某个数据端点。再断 demo 结构从真实构建产物渲染（Generate 控件 + 2 个 showcase chip +
 * 预填 prompt + 无错误边界）。不锁定 prompt 全文（那是 hermetic 层对 defaultCases 的确定性断言）。
 */
test.describe("@smoke Wan2.1 Text-to-Video demo page（真实后端）", () => {
  test("真实 dev server 2xx 返回路由文档且 demo 结构渲染", async ({ page }) => {
    const docResp = page.waitForResponse(
      (r) =>
        r.url().includes("/models/video/wan-2.1") &&
        r.request().method() === "GET" &&
        r.request().resourceType() === "document",
      { timeout: 30_000 },
    );

    await page.goto("/models/video/wan-2.1", {
      waitUntil: "domcontentloaded",
    });

    // 路由文档真实 2xx
    const resp = await docResp;
    expect(
      resp.status(),
      `wan-2.1 document status ${resp.status()}`,
    ).toBeLessThan(400);

    // demo 的 Generate 控件从真实产物渲染（埋点 id，稳定非 i18n）
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    // 首屏 Hero 结构
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    // 2 个静态 showcase chip 渲染
    await expect(page.locator('[class*="case_item"]')).toHaveCount(2);

    // prompt 输入区存在
    await expect(page.getByRole("textbox").first()).toBeVisible();

    // 未弹登录、无错误边界
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
