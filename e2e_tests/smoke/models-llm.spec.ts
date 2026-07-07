import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/models/llm（营销/公开页 — LLM 模型库，无需登录，无 skip 守卫）。
 *
 * 数据流（与 hermetic 同源说明）：
 *  - 模型列表主数据是 **RSC 服务端 fetch**（page.tsx 的 getFullLLMModels → *.novita.ai）：
 *    浏览器看不到这条 XHR，真相校验落在「真实后端渲染出的卡片网格是否出现」。
 *  - 唯一的客户端 XHR 是全局 Header 的 GET /v3/stripe/promotion；用 waitForResponse 强校验其 2xx，
 *    证明真实后端在线、同源代理通。
 */
test.describe("@smoke Models LLM（真实后端）", () => {
  test("真实后端渲染出 LLM 模型卡片网格，promotion 接口 2xx，不崩", async ({
    page,
  }) => {
    // 客户端 promotion XHR 真实 2xx（真相源：后端在线）。
    const promotionResp = page.waitForResponse(
      (res) =>
        res.url().includes("/v3/stripe/promotion") && res.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/models/llm", { waitUntil: "domcontentloaded" });

    await promotionResp;

    // RSC 服务端取数 → 真实后端的模型卡片渲染出来（结构真相，不断固定数量/价格）。
    await expect(
      page.locator('[class*="BaseModelCard_container"]').first(),
    ).toBeVisible({ timeout: 30_000 });
    expect(
      await page.locator('[class*="BaseModelCard_container"]').count(),
    ).toBeGreaterThan(0);

    // create-endpoint 入口（常量 href，非 i18n）。
    await expect(
      page.locator('a[href*="llm-dedicated-endpoints"]'),
    ).toBeVisible();

    // 不触发错误边界。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
