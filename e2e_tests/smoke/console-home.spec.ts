import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/console（主控制台首页，需登录）。
 *
 * console 类路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN
 * 时整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、
 * smoke 项目自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点真实 2xx（后端契约的真相源）：
 *    /v1/user/info（会话）、/api/llm-models（Explore 模型卡数据，本仓库同源 route handler）。
 *  - 再做结构断言（产品入口稳定 <a id> + 模型卡渲染、未弹登录、不触发错误边界）。
 *  - 不断言具体数据值——真实账户/目录数据会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke Console Home（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端关键端点 2xx 且渲染控制台首页主体", async ({ page }) => {
    const userInfoResp = page.waitForResponse(
      (r) => r.url().includes("/v1/user/info") && r.status() === 200,
      { timeout: 30_000 },
    );
    const llmModelsResp = page.waitForResponse(
      (r) => r.url().includes("/api/llm-models") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/console", { waitUntil: "domcontentloaded" });

    await userInfoResp;
    await llmModelsResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // 结构：产品入口稳定 <a id>（源码硬编码 track id，非 i18n）出现
    await expect(
      page.locator('[id="main__console__with__model-api"]'),
    ).toBeVisible({ timeout: 30_000 });

    // Explore 模型卡从真实数据渲染（卡名 span 稳定 class 片段）——
    // 真实目录至少有若干模型 → 至少 1 张卡。
    await expect(page.locator('[class*="modelName"]').first()).toBeVisible({
      timeout: 30_000,
    });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
