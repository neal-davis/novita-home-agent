import { test, expect, type Page } from "@playwright/test";
import { authConsole } from "./helpers/authConsole";

/**
 * hermetic 行为门禁：剩余 6 个 /models-console/* 页（在 llm-metrics / llm-playground / settings /
 * usage / metrics-usage / model-management / multimodal-playground 之外）。鉴权 console，匿名弹登录
 * → 本层测已登录态渲染。
 *
 * 断言「牙」（非 i18n）：models-console 侧栏导航链接 a[href="/models-console/library"]
 * （证明 models console 外壳渲染）；image-dedicated-endpoints 另有路由专属 doc <title>。
 */

const modelsSidebar = (page: Page) =>
  page.locator('a[href="/models-console/library"]').first();
const noError = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

async function assertConsoleShell(page: Page) {
  await expect(page).not.toHaveURL(/\/login/);
  await expect(modelsSidebar(page)).toBeVisible({ timeout: 30_000 });
  await noError(page);
}

test.describe("Models Console 扩展覆盖（hermetic, authed）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await authConsole(page);
  });

  test("/models-console 渲染 console 外壳", async ({ page }) => {
    await page.goto("/models-console", { waitUntil: "domcontentloaded" });
    await assertConsoleShell(page);
  });

  test("/models-console/library 渲染", async ({ page }) => {
    await page.goto("/models-console/library", {
      waitUntil: "domcontentloaded",
    });
    await assertConsoleShell(page);
  });

  test("/models-console/logs 渲染", async ({ page }) => {
    await page.goto("/models-console/logs", { waitUntil: "domcontentloaded" });
    await assertConsoleShell(page);
  });

  test("/models-console/image-playground 渲染", async ({ page }) => {
    await page.goto("/models-console/image-playground", {
      waitUntil: "domcontentloaded",
    });
    await assertConsoleShell(page);
  });

  test("/models-console/llm-dedicated-endpoints 渲染", async ({ page }) => {
    await page.goto("/models-console/llm-dedicated-endpoints", {
      waitUntil: "domcontentloaded",
    });
    await assertConsoleShell(page);
  });

  test("/models-console/image-dedicated-endpoints 渲染 + 专属 title", async ({
    page,
  }) => {
    await page.goto("/models-console/image-dedicated-endpoints", {
      waitUntil: "domcontentloaded",
    });
    await assertConsoleShell(page);
    await expect(page).toHaveTitle(/Image Dedicated Endpoints/i);
  });
});
