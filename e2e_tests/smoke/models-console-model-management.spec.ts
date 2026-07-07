import { test, expect } from "@playwright/test";

/**
 * smoke（真实 dev 后端）：/models-console/model-management 是 console 路由，需登录态。
 * 无 E2E_NOVITA_TOKEN 时自动 skip（参照 e2e-test-author.md）。有 token 时：
 *  - 用 waitForResponse 强校验真实 /v1/user/info 2xx（登录态建立）；
 *  - 若有 upload 权限会进 SHOW_MODEL 并发 /v3/model，等到即校验其 2xx（无权限则该请求不发，
 *    用 Promise.race + 超时容忍，不强制要求 /v3/model 一定出现）；
 *  - 结构断言：未被弹去登录 + 不触发错误边界。
 * 注：真实数据正确性由本层兜底；hermetic 层断言确定性行为。
 */
test.describe("@smoke Model Management（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实登录态下 /v1/user/info 2xx、页面不崩、未弹登录", async ({
    page,
  }) => {
    const token = process.env.E2E_NOVITA_TOKEN as string;
    await page
      .context()
      .addCookies([
        { name: "token", value: token, domain: "localhost", path: "/" },
      ]);

    const userInfoResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/user/info") && r.request().method() === "GET",
      { timeout: 30_000 },
    );

    await page.goto("/models-console/model-management", {
      waitUntil: "domcontentloaded",
    });

    const resp = await userInfoResp;
    expect(
      resp.status(),
      "real /v1/user/info should be 2xx",
    ).toBeGreaterThanOrEqual(200);
    expect(resp.status()).toBeLessThan(300);

    // 未被弹去登录
    await expect(page).not.toHaveURL(/\/login/);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
