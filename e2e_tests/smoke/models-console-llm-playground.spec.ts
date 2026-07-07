import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/models-console/llm-playground（console 类，需登录）。
 *
 * console 类路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN
 * 时整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、
 * smoke 项目自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点真实 2xx（后端契约的真相源）：
 *    /api/llm-models（模型列表，本仓库同源 route handler，Playground 数据源）。
 *  - 再做结构断言（模型选择器/操作渲染、未弹登录、不触发错误边界）。
 *  - 不断言具体模型数据值——真实目录会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke Models Console · LLM Playground（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /api/llm-models 2xx 且渲染 Playground 主体", async ({
    page,
  }) => {
    const llmModelsResp = page.waitForResponse(
      (r) => r.url().includes("/api/llm-models") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/models-console/llm-playground", {
      waitUntil: "domcontentloaded",
    });

    await llmModelsResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // 结构：模型加载完成后 Header 操作按钮渲染（"View Code" 源码硬编码字面量）
    await expect(page.getByRole("button", { name: /View Code/ })).toBeVisible({
      timeout: 30_000,
    });

    // 模型配置面板渲染（"Model Configuration" 源码硬编码字面量，非 i18n）
    await expect(
      page.getByText("Model Configuration", { exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
