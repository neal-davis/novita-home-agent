import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/instances。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时
 * 整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点 /gpu/instances 真实 2xx（后端契约的真相源）；
 *  - 再做结构断言：未弹登录、不触发错误边界、页面主体二选一可见
 *    （有实例 → Section 工具栏；无实例 → DefaultGuide）。
 *  - 不断言具体实例数 / 数据值——真实账户实例会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke GPU Console Instances（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /gpu/instances 2xx 且渲染实例列表或空态", async ({ page }) => {
    const instancesResp = page.waitForResponse(
      (r) => r.url().includes("/gpu/instances") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/instances", {
      waitUntil: "domcontentloaded",
    });

    await instancesResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // 主体二选一可见：有实例 → Section 工具栏「+ GPU Instance」按钮（稳定 id）；
    // 无实例 → DefaultGuide 的动作按钮（角色，不带 i18n name）。真实账户两种都正常。
    const sectionToolbar = page.locator(
      "#main__gpus-console__instance__to-create",
    );
    await expect
      .poll(
        async () =>
          (await sectionToolbar.count()) > 0 ||
          (await page.getByRole("button").count()) >= 2,
        { timeout: 30_000 },
      )
      .toBe(true);

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
