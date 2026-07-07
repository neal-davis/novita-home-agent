import { test, expect, type Page } from "@playwright/test";
import { authConsole } from "./helpers/authConsole";

/**
 * hermetic 行为门禁：/sandbox-console 及其子页（鉴权 console，匿名弹登录 → 本层测已登录态渲染）。
 *
 * 断言「牙」（非 i18n）：sandbox-console 侧栏导航链接 a[href="/sandbox-console/view"]
 * （证明正确的 sandbox console 外壳渲染）；/usage 另有稳定埋点 id
 * main__sandbox-console__usage__export-cost。全部断未弹登录 + 不进错误边界。
 */

const sandboxSidebar = (page: Page) =>
  page.locator('a[href="/sandbox-console/view"]').first();
const noError = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("Sandbox Console（hermetic, authed）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await authConsole(page);
  });

  test("/sandbox-console 渲染 console 外壳", async ({ page }) => {
    await page.goto("/sandbox-console", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(sandboxSidebar(page)).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/sandbox-console/view 渲染", async ({ page }) => {
    await page.goto("/sandbox-console/view", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(sandboxSidebar(page)).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/sandbox-console/template 渲染", async ({ page }) => {
    await page.goto("/sandbox-console/template", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(sandboxSidebar(page)).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/sandbox-console/usage 渲染（export 埋点）", async ({ page }) => {
    await page.goto("/sandbox-console/usage", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.locator('[id="main__sandbox-console__usage__export-cost"]'),
    ).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/sandbox-console/quota-limits 渲染", async ({ page }) => {
    await page.goto("/sandbox-console/quota-limits", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(sandboxSidebar(page)).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });
});
