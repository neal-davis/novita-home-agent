import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/models-console/settings。
 *
 * console 鉴权页 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN
 * 时整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、
 * smoke 项目自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点真实 2xx——/v1/user/info（PermissionWrapper
 *    放行所依赖）与 /v1/enterprise-plan/config（PlaygroundSwitch 的开关态来源），
 *    这是后端契约的真相源；
 *  - 再做结构断言（Playground Switch 出现、未弹登录、不触发错误边界）。
 *  - 不断言开关具体值——真实账户的 enterprise 配置会变；确定性开关态断言在 hermetic 层。
 */
const SWITCH_ID = "#main__models-console__settings__playground-switch";

test.describe("@smoke Models Console Settings（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端关键端点 2xx 且渲染 Playground Switch", async ({ page }) => {
    const userInfoResp = page.waitForResponse(
      (r) => r.url().includes("/v1/user/info") && r.status() === 200,
      { timeout: 30_000 },
    );
    const enterpriseResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/enterprise-plan/config") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/models-console/settings", {
      waitUntil: "domcontentloaded",
    });

    await userInfoResp;
    await enterpriseResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/user\/login/);

    // Playground Switch 结构出现（源码硬编码 track id，locale 无关）
    await expect(page.locator(SWITCH_ID)).toBeVisible({ timeout: 30_000 });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
