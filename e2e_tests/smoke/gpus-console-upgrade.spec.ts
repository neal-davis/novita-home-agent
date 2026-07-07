import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/upgrade。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时
 * 整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 路由性质：本路由是 gpus-console SPA 外壳下的占位/桩路由——upgrade/page.tsx 是空 fragment，
 * Main.tsx 无 'upgrade' func 匹配，SPA body 渲染为空（详见 hermetic spec 注释）。它没有自有
 * 数据端点，故 smoke 没有「该页专属列表接口」可强校验。
 *
 * 断言策略：
 *  - waitForResponse 强校验 console 登录态的关键端点 /v1/user/info 真实 2xx——这是
 *    "真实 token 有效、会话能加载" 的后端真相源（本路由能渲染外壳的前提）；
 *  - 再做结构断言：未弹登录、console 外壳（侧边导航）可见、SPA body 内容区为空（桩路由特征）、
 *    不触发错误边界。
 *  - 不断任何数据值——本路由无确定性数据；确定性断言（弹窗分支/空 body）在 hermetic 层。
 */
test.describe("@smoke GPU Console Upgrade（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /v1/user/info 2xx 且 console 外壳渲染、SPA body 为空、未弹登录", async ({
    page,
  }) => {
    const userInfoResp = page.waitForResponse(
      (r) => r.url().includes("/v1/user/info") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/upgrade", {
      waitUntil: "domcontentloaded",
    });

    await userInfoResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // console 外壳可见（侧边导航）
    await expect(page.locator(".console-side-navigation")).toBeVisible({
      timeout: 30_000,
    });

    // 桩路由特征：SPA body 内容区存在但为空（无 func 匹配 → 无 playground 内容）
    await expect(page.locator(".gpu-container-content")).toHaveCount(1);
    await expect(page.locator(".gpu-container-content > *")).toHaveCount(0);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
