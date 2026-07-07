import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/model-api/product/inpainting（公开「Try inpainting API demo」营销页，
 * 无需登录，无 token skip 守卫）。
 *
 * 数据流（与 hermetic 同源说明）：
 *  - Inpainting 组件挂载即 getModelDetail(DEFAULT_MODLE_ID) → getModels() →
 *    GET /v3/model（真实后端，dev-api.novita.ai）。这是**挂载即发、无需点击**的真实 XHR，
 *    不受同意条幅遮挡影响 —— 用 waitForResponse 强校验其 2xx（证明真实后端在线、
 *    CORS/代理通），再断言模型选择器从真实数据填出非空模型名。
 *
 * 为什么没有「点模型选择器开弹窗」的 smoke：真实站点首访会渲染 Cookiebot 同意条幅
 * （第三方 CybotCookiebotDialog / nv-cookiebot__*，role=dialog 全屏遮罩），其出现与按钮
 * markup 随共享 storageState 的同意状态非确定性变化，会拦截开弹窗的点击 → 点击驱动的断言
 * 在真实层必碎（实测：click 被同意遮罩吸收，/v3/model?is_inpainting 不发）。该开弹窗交互
 * 已在 hermetic 层确定性覆盖（hermetic 屏蔽同意脚本）。smoke 只保留挂载即发的后端真相，
 * 与点击弹窗命中**同一** /v3/model 端点，后端信号无损失。
 */
test.describe("@smoke Inpainting API demo（真实后端）", () => {
  test("真实后端：挂载即发 /v3/model 2xx 并填充模型选择器，demo 结构不崩", async ({
    page,
  }) => {
    // 挂载即触发 /v3/model（getModelDetail）—— 强校验真实 2xx（无需点击，遮罩免疫）。
    const v3ModelResp = page.waitForResponse(
      (res) =>
        res.url().includes("/v3/model") &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 30_000 },
    );

    await page.goto("/model-api/product/inpainting", {
      waitUntil: "domcontentloaded",
    });

    // demo 主体挂载（埋点 id 稳定，非 i18n）。
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    // 真实后端 /v3/model 2xx（真相源：后端在线、模型库可达）。
    await v3ModelResp;

    // 模型选择器由真实模型详情填出非空模型名（结构真相，不断具体 sd_name）。
    await expect(page.locator('[class*="model_name"]').first()).not.toBeEmpty({
      timeout: 30_000,
    });

    // 结果区图片占位、跳 playground 链接（href 常量）等静态结构在线。
    await expect(page.locator('[class*="preview_img_large"]')).toHaveCount(1);
    await expect(page.locator('a[href*="#inpainting"]').first()).toBeVisible();

    // 不触发错误边界（页面自身的 <h1>Error</h1>，与第三方同意 role=dialog 无关）。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
