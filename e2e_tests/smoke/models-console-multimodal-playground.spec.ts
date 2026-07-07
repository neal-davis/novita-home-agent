import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/models-console/multimodal-playground（console 类）。
 *
 * console 类路由 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时整组
 * 自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点真实 2xx（后端契约的真相源）：
 *    /v1/product/multimodal-model/list（多模态模型配置，Playground 数据源；page.tsx 挂载
 *    dispatch fetchMultimodalConfigs → getEnabledFusionProductConfigs 打这个端点）。
 *  - 再做结构断言（loader 结束后 #playground section 渲染、未弹登录、不触发错误边界）。
 *  - 不断言具体模型数据值——真实目录会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke Models Console · Multimodal Playground（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /v1/product/multimodal-model/list 2xx 且渲染 Playground 主体", async ({
    page,
  }) => {
    const listResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/product/multimodal-model/list") &&
        r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/models-console/multimodal-playground", {
      waitUntil: "domcontentloaded",
    });

    await listResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // 结构：模型配置驱动 loader 结束后渲染 playground section（id 源码硬编码，非 i18n）
    await expect(page.locator("#playground")).toBeVisible({ timeout: 30_000 });
    // Tabs 的 JSON section 也应渲染（结构稳定锚点）
    await expect(page.locator("#json")).toHaveCount(1);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
