import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/models/video/kling-v1.6-t2v（公开 demo/营销页，无需登录，随时可跑）。
 *
 * 此页是「静态 + 交互」视频 demo：挂载时不发数据 XHR（showcase/表单初值来自静态 defaultCases），
 * 故 smoke 的「真实后端 2xx」校验落在**路由文档本身**——真实 dev server 必须 2xx 返回页面文档，
 * 而非某个数据端点。再断 demo 结构从真实构建产物渲染（Generate 控件 + 单条 showcase +
 * prompt 文本框预填合成值 + 无错误边界）。
 */
test.describe("@smoke Kling V1.6 T2V demo page（真实后端）", () => {
  test("真实 dev server 2xx 返回路由文档且 demo 结构渲染", async ({ page }) => {
    const docResp = page.waitForResponse(
      (r) =>
        r.url().includes("/models/video/kling-v1.6-t2v") &&
        r.request().method() === "GET" &&
        r.request().resourceType() === "document",
      { timeout: 30_000 },
    );

    await page.goto("/models/video/kling-v1.6-t2v", {
      waitUntil: "domcontentloaded",
    });

    // 路由文档真实 2xx
    const resp = await docResp;
    expect(
      resp.status(),
      `kling-v1.6-t2v document status ${resp.status()}`,
    ).toBeLessThan(400);

    // demo 的 Generate 控件从真实产物渲染（埋点 id，稳定非 i18n）
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    // 首屏 Hero 结构
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    // 单条 showcase 渲染
    await expect(page.locator('[class*="case_item"]')).toHaveCount(1);

    // prompt 输入区存在且预填 defaultCases 合成值（确认 demo 真实挂载、表单受控初始化）
    await expect(page.getByRole("textbox").first()).toHaveValue(
      "A cute dog standing up from a sitting position while wearing sunglasses",
    );

    // 未弹登录、无错误边界
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
