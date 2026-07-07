import { test, expect, type Page } from "@playwright/test";
import { authConsole } from "./helpers/authConsole";

/**
 * hermetic 行为门禁：/settings 及其子页（鉴权页，匿名 sweep 只会看到登录跳转 → 本层测的是
 * **已登录态的渲染**，是 sweep 测不到的新增深度）。装配见 authConsole。
 *
 * 断言「牙」（非 i18n）：账户设置块的稳定埋点 id `main__settings__account_settings__*`
 * （源码硬编码 track id，落到按钮）；账户页另有路由专属 doc <title>「Account Settings」；
 * audit-logs / key-management 实测被前端按权限重定向回 /settings/account（契约 = 该跳转）。
 */

const accountSaveBtn = (page: Page) =>
  page.locator('[id="main__settings__account_settings__save"]');

test.describe("Settings 设置页（hermetic, authed）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await authConsole(page);
  });

  test("/settings 渲染账户设置（含 save 埋点）", async ({ page }) => {
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(accountSaveBtn(page)).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/settings/account 渲染账户设置 + 专属 title", async ({ page }) => {
    await page.goto("/settings/account", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Account Settings/i);
    await expect(accountSaveBtn(page)).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/settings/audit-logs → 按权限回 /settings/account", async ({
    page,
  }) => {
    await page.goto("/settings/audit-logs", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/settings\/account/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/settings/key-management → 按权限回 /settings/account", async ({
    page,
  }) => {
    await page.goto("/settings/key-management", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveURL(/\/settings\/account/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/settings/team 渲染 Team 设置 + 专属 title", async ({ page }) => {
    await page.goto("/settings/team", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/Team \| Novita AI/i);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
