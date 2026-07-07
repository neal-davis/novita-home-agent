import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/settings。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时
 * 整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点 /user/sshkey 真实 2xx（settings 后端契约的真相源；
 *    Section 挂载时还并行拉 /gpu/image/repository/auths 与 /user/settings，但 sshkey 最贴页面语义）；
 *  - 再做结构断言：未弹登录、不触发错误边界、Section 设置面板主体可见
 *    （SSH「Update Public Key」按钮的稳定 id，locale 无关）。
 *  - 不断言具体 registry 行数 / SSH key 内容 / 复选框值——真实账户会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke GPU Console Settings（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /user/sshkey 2xx 且渲染设置面板", async ({ page }) => {
    const sshkeyResp = page.waitForResponse(
      (r) => r.url().includes("/user/sshkey") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/settings", {
      waitUntil: "domcontentloaded",
    });

    await sshkeyResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // Section 设置面板渲染完成：SSH「Update Public Key」按钮的稳定 track id（locale 无关）。
    await expect(
      page.locator('[id="main__gpus-console__settings__update-public-key"]'),
    ).toBeVisible({ timeout: 30_000 });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
