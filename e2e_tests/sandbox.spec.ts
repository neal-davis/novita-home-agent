import { test, expect } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/sandbox（AI Agent Sandbox 营销落地页，公开）+ /sandbox1（同模板变体）
 * + /sandbox/success（操作成功结果页）。
 *
 * 断言「牙」（非 i18n）：/sandbox(1) 用路由专属 doc <title>「AI Agent Sandbox」+ hero h1 + Footer；
 * /sandbox/success 用硬编码英文内容标题「Operation Success」。营销页不取数，默认壳即可。
 */

test.describe("Sandbox 落地/结果页（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await mockBackend(page, {});
  });

  test("/sandbox 渲染 AI Agent Sandbox 落地页", async ({ page }) => {
    await page.goto("/sandbox", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/AI Agent Sandbox/i);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("footer").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/sandbox1 渲染 AI Agent Sandbox 变体", async ({ page }) => {
    await page.goto("/sandbox1", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveTitle(/AI Agent Sandbox/i);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/sandbox/success 渲染 Operation Success", async ({ page }) => {
    await page.goto("/sandbox/success", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Operation Success/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
