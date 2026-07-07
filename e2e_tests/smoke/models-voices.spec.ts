import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/models/voices（公开 demo/营销页 "AI Text to Speech"，无需登录，随时可跑）。
 *
 * 此页是「静态 + 交互」demo：挂载时不发数据 XHR（voice/language/library 全部来自静态 getData()），
 * 故 smoke 的「真实后端 2xx」校验落在**路由文档本身**——真实 dev server 必须 2xx 返回页面，
 * 而非某个数据端点（与 models-video/wan-2.1 smoke 同范式）。再断 demo 结构从真实构建产物渲染
 * （textarea 输入区 + 4 voice 选择 + 3 language + 6 library 卡 + 文档链接 + 无错误边界）。
 * 不锁定预填 prompt 全文（那是 hermetic 层对 getLanguageData() 的确定性断言）。
 */
test.describe("@smoke Voices (Text-to-Speech) demo page（真实后端）", () => {
  test("真实 dev server 2xx 返回路由文档且 demo 结构渲染", async ({ page }) => {
    const docResp = page.waitForResponse(
      (r) =>
        r.url().includes("/models/voices") &&
        r.request().method() === "GET" &&
        r.request().resourceType() === "document",
      { timeout: 30_000 },
    );

    await page.goto("/models/voices", { waitUntil: "domcontentloaded" });

    // 路由文档真实 2xx
    const resp = await docResp;
    expect(
      resp.status(),
      `voices document status ${resp.status()}`,
    ).toBeLessThan(400);

    // demo 输入区从真实产物渲染（唯一 textarea，等客户端 hydration 完成）
    await expect(page.locator("textarea")).toBeVisible({ timeout: 30_000 });

    // 首屏 Hero 结构
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 确定性静态结构：4 voice 选择 / 3 language / 6 library 卡
    await expect(
      page.locator(
        '[class*="Playground_voice_box_list__"] [class*="Playground_item__"]',
      ),
    ).toHaveCount(4);
    await expect(
      page.locator('[class*="Playground_language_item__"]'),
    ).toHaveCount(3);
    await expect(page.locator('[class*="VoiceLibrary_item__"]')).toHaveCount(6);

    // 文档链接 href（常量，非 i18n 文案）
    await expect(
      page
        .locator('a[href="/docs/api-reference/model-apis-text-to-speech"]')
        .first(),
    ).toBeVisible();

    // 未弹登录、无错误边界
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
