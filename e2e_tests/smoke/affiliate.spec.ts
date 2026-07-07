import { test, expect } from "@playwright/test";

/**
 * smoke 真相源（真实 dev 后端）：/affiliate。
 *
 * 两段：
 *  1) 跳转 + 营销页骨架（无需登录，随时可跑）：/affiliate → /affiliate-new，hero 渲染、不崩。
 *  2) credentials 真实取数（需登录）：登录态下 hero 发 GET /v1/user/affiliate，强校验真实 2xx。
 *     无 E2E_NOVITA_TOKEN 时整个用例 skip（参照 e2e-test-author.md / billing-overview smoke）。
 *
 * 注意：seedAuth 之类的 cookie 注入在 smoke 层不可靠（真实后端要真 token）；token 注入方式
 * 见 e2e_tests/smoke/auth.setup.ts。本用例无 token 即跳，不在此重复登录流程。
 */
test.describe("@smoke Affiliate（真实后端）", () => {
  test("/affiliate 跳转到 /affiliate-new 并渲染营销页 hero", async ({
    page,
  }) => {
    await page.goto("/affiliate", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/affiliate-new(?:\?|#|$)/);
    await expect(page.locator("main h1").first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("登录态：hero 从真实 /v1/user/affiliate 取到 credentials（2xx）", async ({
    page,
  }) => {
    test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

    const affiliateResp = page.waitForResponse(
      (res) =>
        res.url().includes("/v1/user/affiliate") &&
        res.request().method() === "GET",
      { timeout: 30_000 },
    );

    await page.goto("/affiliate-new", { waitUntil: "domcontentloaded" });

    const res = await affiliateResp;
    expect(res.status(), "GET /v1/user/affiliate should be 2xx").toBeLessThan(
      300,
    );

    // 真实登录态下登录态专属区块应渲染
    await expect(page.locator("#affiliate-credentials")).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
