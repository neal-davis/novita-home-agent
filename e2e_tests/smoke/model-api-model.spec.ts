import { test, expect } from "@playwright/test";

/**
 * smoke 真相源：/model-api/model（**已废弃路由 → 308 重定向到 /models 模型库**；
 * 营销/公开页，无需登录，无 skip 守卫）。
 *
 * 真相源职责（与 hermetic 互补 —— hermetic 用 fixture 断确定性结构/交互；smoke 打真实 dev 后端）：
 *  - 核心行为：真实 middleware 把 /model-api/model 308 落到 /models（确定性、与登录态无关）。
 *  - 真实客户端取数：落地页 Content 挂载发 GET /v1/product/multimodal-model/list（多模态媒体模型）。
 *    用 waitForResponse 强校验其 2xx（证明真实后端在线、CORS/代理通），再断模型库从真实数据
 *    渲染出至少一张卡片（结构真相，不断固定数量/具体模型名 —— 那随后端漂移）。
 */
test.describe("@smoke model-api/model → /models 模型库（真实后端）", () => {
  test("真实 308 落到 /models，multimodal-model/list 2xx 并渲染模型卡，不崩", async ({
    page,
  }) => {
    // 落地页客户端取数 → 真实 /v1/product/multimodal-model/list 2xx（真相源：后端在线、模型库可达）。
    const multimodalResp = page.waitForResponse(
      (res) =>
        res.url().includes("/v1/product/multimodal-model/list") &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 30_000 },
    );

    await page.goto("/model-api/model", { waitUntil: "domcontentloaded" });

    // 真实 308 → 落在 /models。
    await expect(page).toHaveURL(/\/models$/, { timeout: 30_000 });

    // 模型库主体挂载（稳定 id，非 i18n）。
    await expect(page.locator("#models-library")).toBeVisible({
      timeout: 30_000,
    });

    // 真实后端 2xx。
    await multimodalResp;

    // 真实数据渲染出模型卡片（结构真相，不断固定数量/具体模型名）。
    await expect(
      page.locator('[class*="BaseModelCard_container"]').first(),
    ).toBeVisible({ timeout: 30_000 });
    expect(
      await page.locator('[class*="BaseModelCard_container"]').count(),
    ).toBeGreaterThan(0);

    // 未弹去登录（公开页）。
    await expect(page).not.toHaveURL(/\/login/);

    // 不触发错误边界。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
