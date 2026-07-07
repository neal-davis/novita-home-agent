import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/serverless。
 *
 * console 路由需登录 → 整组 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时
 * 自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页核心端点 /api/v1/endpoints 真实 2xx（后端契约真相源）；
 *  - 再做结构断言：未弹登录、不触发错误边界、且「端点列表 或 引导空态」二选一可见
 *    （真实账户是否有端点会变 → 不锁定具体某一分支，更不锁定数据值）。
 */
test.describe("@smoke GPUs Console · Serverless（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /api/v1/endpoints 2xx 且渲染端点列表或引导空态", async ({
    page,
  }) => {
    const endpointsResp = page.waitForResponse(
      (r) =>
        r.url().includes("/api/v1/endpoints") &&
        r.request().method() === "GET" &&
        r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/serverless", {
      waitUntil: "domcontentloaded",
    });

    await endpointsResp;

    // 未被弹去登录（真实 token 生效）。
    await expect(page).not.toHaveURL(/\/login/);

    // 端点列表（有数据）或 DefaultGuide 引导（无数据）二选一可见。
    const hasEndpoints = page.locator("text=ENDPOINT ID").first();
    const guideHeading = page.locator("h1", { hasText: "Need to deploy" });
    await expect(hasEndpoints.or(guideHeading).first()).toBeVisible({
      timeout: 30_000,
    });

    // 不触发错误边界。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
