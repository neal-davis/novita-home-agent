import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/models-console/metrics/usage（Model API Usage 仪表盘）。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN
 * 时整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、
 * smoke 项目自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页核心端点真实 2xx（后端契约的真相源）：
 *    usage/scopes 与 usage/summary（首屏必发）。
 *  - 再做结构断言（汇总卡渲染、scope 控件出现、未弹登录、不触发错误边界）。
 *  - 不断言具体数据值——真实账户用量会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke Model API Usage（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端关键端点 2xx 且渲染用量主体", async ({ page }) => {
    const scopesResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/billing/model-api/usage/scopes") &&
        r.status() === 200,
      { timeout: 30_000 },
    );
    const summaryResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/billing/model-api/usage/summary") &&
        r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/models-console/metrics/usage", {
      waitUntil: "domcontentloaded",
    });

    await scopesResp;
    await summaryResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/user\/login/);

    // 用量主体结构出现：4 张汇总卡 + scope 控件（稳定 class 片段，非 i18n 文案）
    await expect(page.locator('[class*="metricValue"]')).toHaveCount(4, {
      timeout: 30_000,
    });
    await expect(page.locator('[class*="scopeButton"]').first()).toBeVisible();

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
