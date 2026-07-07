import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/models-console/llm-metrics（LLM Metrics 仪表盘）。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN
 * 时整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、
 * smoke 项目自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页首屏核心端点真实 2xx（后端契约的真相源）：
 *    /v1/metrics/models（页面挂载即发，驱动模型下拉）。
 *  - 再做结构断言：6 张图表卡渲染、工具栏模型选择器出现、未弹登录、不触发错误边界。
 *  - 不断言具体数据值——真实账户的指标会随时间变化；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke LLM Metrics（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /v1/metrics/models 2xx 且渲染指标主体", async ({ page }) => {
    const modelsResp = page.waitForResponse(
      (r) => r.url().includes("/v1/metrics/models") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/models-console/llm-metrics", {
      waitUntil: "domcontentloaded",
    });

    await modelsResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // 指标主体结构：6 张图表卡（CharWrapper 的 .console-card）+ 工具栏模型选择器
    await expect(page.locator(".console-card")).toHaveCount(6, {
      timeout: 30_000,
    });
    await expect(
      page.locator("[class*='operate']").getByRole("combobox").first(),
    ).toBeVisible();

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
