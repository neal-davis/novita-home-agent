import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/billing/budgets。
 *
 * console/账单类路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无
 * E2E_NOVITA_TOKEN 时整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts
 * 落成 storageState、smoke 项目自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点 /v1/user/team/budget-list 真实 2xx
 *    （后端契约的真相源；hermetic 层 mock 的就是它）。
 *  - 再做结构断言：未弹登录、不触发错误边界、页面有内容（预算表 or
 *    「Team Account Required」兜底——取决于 token 账号是否为 team 账号，两者皆合法）。
 *  - 不断言具体数据值/行数——真实账户数据会变；确定性断言在 hermetic 层。
 */
test.describe("@smoke Billing Budgets（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 budget-list 2xx 且渲染预算页主体", async ({ page }) => {
    const budgetListResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/user/team/budget-list") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/billing/budgets", { waitUntil: "domcontentloaded" });

    await budgetListResp;

    // 未被弹去登录（真实 token 生效）。
    await expect(page).not.toHaveURL(/\/user\/login/);

    // 不触发错误边界。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);

    // 页面渲染出主体：team 账号 → 预算表「Budget Type」表头；
    // 非 team 账号 → 「Team Account Required」兜底页。二选一可见即合格。
    const budgetTypeHeader = page
      .locator("th", { hasText: "Budget Type" })
      .first();
    const teamRequired = page.getByText("Team Account Required", {
      exact: false,
    });
    await expect(budgetTypeHeader.or(teamRequired).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
