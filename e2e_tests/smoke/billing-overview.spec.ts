import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/billing/overview。
 *
 * console/账单类路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无
 * E2E_NOVITA_TOKEN 时整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts
 * 落成 storageState、smoke 项目自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点真实 2xx（后端契约的真相源）；
 *  - 再做结构断言（账单表出现、未弹登录、不触发错误边界）。
 *  - 不断言具体数据值——真实账户数据会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke Billing Overview（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端关键端点 2xx 且渲染账单主体", async ({ page }) => {
    const balanceResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/billing/balance/detail") && r.status() === 200,
      { timeout: 30_000 },
    );
    const voucherResp = page.waitForResponse(
      (r) => r.url().includes("/v1/billing/voucher/list") && r.status() === 200,
      { timeout: 30_000 },
    );
    const billResp = page.waitForResponse(
      (r) => r.url().includes("/v1/billing/monthly/bill") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/billing/overview", { waitUntil: "domcontentloaded" });

    await balanceResp;
    await voucherResp;
    await billResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/user\/login/);

    // 账单主体结构出现（Monthly Bill 表头列名是源码字面量，非 i18n）。
    // shadcn <th> 不暴露 columnheader role，故用 <th> 文案定位。
    await expect(
      page.locator("th", { hasText: "Billing Period" }).first(),
    ).toBeVisible({ timeout: 30_000 });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
