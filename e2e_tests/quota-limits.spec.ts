import { test, expect, type Page } from "@playwright/test";
import { authConsole } from "./helpers/authConsole";

/**
 * hermetic 行为门禁：/quota-limits 及其子页（鉴权 console 页，匿名会被弹登录 → 本层测已登录态渲染）。
 *
 * 断言「牙」（非 i18n）：
 *  - /quota-limits → 服务端 308 跳 /quota-limits/llm（src/app/quota-limits/page.tsx 重定向，curl 实测 308）；
 *  - /quota-limits/llm → 稳定埋点 id main__quota-limits__llm__topup（源码 track id）；
 *  - image / sandbox → 同一 QuotaLimits 模板，断 console 侧栏 quota 链接 + 未弹登录 + 不崩（已登录可达）。
 */

const sidebarQuota = (page: Page) =>
  page.locator('a[href="/quota-limits"]').first();
const noError = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("Quota Limits（hermetic, authed）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await authConsole(page);
  });

  test("/quota-limits → /quota-limits/llm（308）", async ({ page }) => {
    await page.goto("/quota-limits", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/quota-limits\/llm/, { timeout: 30_000 });
    await noError(page);
  });

  test("/quota-limits/llm 渲染（topup 埋点）", async ({ page }) => {
    await page.goto("/quota-limits/llm", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.locator('[id="main__quota-limits__llm__topup"]'),
    ).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/quota-limits/image 已登录可达", async ({ page }) => {
    await page.goto("/quota-limits/image", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(sidebarQuota(page)).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/quota-limits/sandbox 已登录可达", async ({ page }) => {
    await page.goto("/quota-limits/sandbox", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(sidebarQuota(page)).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });
});
