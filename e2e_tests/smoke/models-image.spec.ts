import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/models/image（营销/公开页 — Image Models Playground，无需登录，无 skip 守卫）。
 *
 * 数据流（与 hermetic 同源说明）：
 *  - 初始加载 **0 个后端 XHR**：左侧功能 Nav、默认模型、表单都来自客户端静态常量
 *    （getFuncs 同步返回 + defaultCases），无服务端取数。
 *  - 唯一的真实后端 XHR 在**模型选择弹窗**：点 ModelSelector 触发器 → getModels()
 *    打 GET /v3/model。用 waitForResponse 强校验其 2xx（证明真实后端在线、CORS/代理通），
 *    再断言弹窗从真实数据渲染出至少一条模型项（结构真相，不断固定数量/具体模型名）。
 */
test.describe("@smoke Image Models Playground（真实后端）", () => {
  test("真实后端：模型选择弹窗 /v3/model 2xx 并渲染模型项，playground 结构不崩", async ({
    page,
  }) => {
    await page.goto("/models/image", { waitUntil: "domcontentloaded" });

    // playground 主体挂载（埋点 id 稳定，非 i18n）。
    await expect(page.locator("#btn-playground-generate")).toBeVisible({
      timeout: 30_000,
    });

    // 左侧功能 Nav（href = 功能名常量，locale 无关）渲染出来。
    await expect(page.locator('nav a[href="#txt2img"]')).toBeVisible();

    // 打开模型列表弹窗 → 真实 /v3/model 2xx（真相源：后端在线、模型库可达）。
    const v3ModelResp = page.waitForResponse(
      (res) =>
        res.url().includes("/v3/model") &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 30_000 },
    );
    await page.locator('[class*="model_selector_trigger"]').first().click();
    await v3ModelResp;

    // 真实后端的模型项渲染出来（结构真相，不断固定数量/具体 sd_name）。
    await expect(page.locator('[class*="img_wrap_div"]').first()).toBeVisible({
      timeout: 30_000,
    });
    expect(
      await page.locator('[class*="img_wrap_div"]').count(),
    ).toBeGreaterThan(0);

    // 不触发错误边界。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
