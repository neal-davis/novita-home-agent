import { test, expect, type Page } from "@playwright/test";
import { authConsole } from "./helpers/authConsole";

/**
 * hermetic 行为门禁：/gpus-console（GPU console 首页/总览）+ /gpus-console/savingsPlans。
 * 鉴权 console，匿名弹登录 → 本层测已登录态渲染。
 *
 * 断言「牙」（非 i18n）：gpus-console 侧栏导航链接 a[href="/gpus-console/application"]
 * （证明 gpu console 外壳渲染）；savingsPlans 另有路由专属 doc <title>。
 */

const gpusSidebar = (page: Page) =>
  page.locator('a[href="/gpus-console/application"]').first();
const noError = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("GPUs Console 扩展覆盖（hermetic, authed）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await authConsole(page);
  });

  test("/gpus-console 渲染 console 外壳", async ({ page }) => {
    await page.goto("/gpus-console", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(gpusSidebar(page)).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/gpus-console/savingsPlans 渲染 + 专属 title", async ({ page }) => {
    await page.goto("/gpus-console/savingsPlans", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(gpusSidebar(page)).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveTitle(/savingsPlans/i);
    await noError(page);
  });
});
