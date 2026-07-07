import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/model-api/product/txt2img（公开 demo/营销页，无需登录，随时可跑）。
 *
 * 此页是「静态 + 交互」demo：挂载时不发数据 XHR（示例/模型来自静态 defaultCases），
 * 故 smoke 的「真实后端 2xx」校验落在**路由文档本身**——真实 dev server 必须 2xx 返回页面，
 * 而非某个数据端点。再断 demo 结构从真实构建产物渲染（Generate 控件 + 4 张示例图 + 无错误边界）。
 * 不锁定示例 prompt 文本（那是 hermetic 层对 defaultCases 的确定性断言）。
 */
test.describe("@smoke Text-to-Image demo page（真实后端）", () => {
  test("真实 dev server 2xx 返回路由文档且 demo 结构渲染", async ({ page }) => {
    const docResp = page.waitForResponse(
      (r) =>
        r.url().includes("/model-api/product/txt2img") &&
        r.request().method() === "GET" &&
        r.request().resourceType() === "document",
      { timeout: 30_000 },
    );

    await page.goto("/model-api/product/txt2img", {
      waitUntil: "domcontentloaded",
    });

    // 路由文档真实 2xx
    const resp = await docResp;
    expect(
      resp.status(),
      `txt2img document status ${resp.status()}`,
    ).toBeLessThan(400);

    // demo 的 Generate 控件从真实产物渲染（埋点 id，稳定非 i18n）
    const genBtn = page.locator("#btn-product-generate");
    await expect(genBtn).toBeVisible({ timeout: 30_000 });
    await expect(genBtn).toHaveAttribute("data-gtm-product-name", "txt2img");

    // 首屏 Hero 结构
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    // 4 张静态示例图渲染
    await expect(page.locator('[class*="case_item"]')).toHaveCount(4);

    // prompt 输入区存在
    await expect(page.getByRole("textbox").first()).toBeVisible();

    // 未弹登录、无错误边界
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
