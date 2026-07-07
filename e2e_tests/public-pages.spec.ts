import { test, expect, type Page } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：一批公开页（营销/落地/OAuth 结果页）+ 公开重定向。无需登录。
 * 断言「牙」全部非 i18n：营销页用 doc <title> 或硬编码英文内容 H1；重定向页用 waitForURL；
 * 全部断不进错误边界。这些页自身不取数或取数失败可降级，mockBackend 默认壳即可。
 */

const noError = (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("公开营销/落地页（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await mockBackend(page, {});
  });

  test("/ 首页渲染 hero + Footer", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("footer").first()).toBeVisible();
    await noError(page);
  });

  test("/llama3 渲染 Llama 3 营销页", async ({ page }) => {
    await page.goto("/llama3", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Llama 3 API/i);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
    await noError(page);
  });

  test("/models 渲染 Model Library", async ({ page }) => {
    await page.goto("/models", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Model Library/i);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
    await noError(page);
  });

  test("/referral 渲染 Refer & Earn 营销页", async ({ page }) => {
    await page.goto("/referral", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Earn \$10/i);
    await expect(page.locator("footer").first()).toBeVisible();
    await noError(page);
  });

  test("/team-permission-details 渲染权限表", async ({ page }) => {
    await page.goto("/team-permission-details", {
      waitUntil: "domcontentloaded",
    });
    // 硬编码英文内容 H1（非 i18n）
    await expect(
      page.getByRole("heading", { name: "Team Permission Details" }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("footer").first()).toBeVisible();
    await noError(page);
  });
});

test.describe("OAuth 结果页（hermetic，无参默认态）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await mockBackend(page, {});
  });

  test("/oauth/authorize/refuse 渲染拒绝态", async ({ page }) => {
    await page.goto("/oauth/authorize/refuse", {
      waitUntil: "domcontentloaded",
    });
    // 无参默认 client_name="Novita Sandbox CLI"；H1 含「refused … authorization」（硬编码英文）
    await expect(
      page.getByRole("heading", { name: /refused .* authorization/i }),
    ).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/oauth/authorize/success 无参渲染 Invalid Redirect Link", async ({
    page,
  }) => {
    await page.goto("/oauth/authorize/success", {
      waitUntil: "domcontentloaded",
    });
    // 无 redirect/e2b 参数走 Invalid 分支（硬编码英文 H1）
    await expect(
      page.getByRole("heading", { name: "Invalid Redirect Link" }),
    ).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });
});

test.describe("公开重定向（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await mockBackend(page, {});
  });

  // 跳转断言一律用 toHaveURL（自带轮询重试），避免 server 跳转早于监听注册时 waitForURL racy。
  test("/serverless → /gpus", async ({ page }) => {
    await page.goto("/serverless", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(
      (url) => url.pathname.replace(/\/$/, "") === "/gpus",
      { timeout: 30_000 },
    );
    await noError(page);
  });

  test("/templates → /gpus-console/templates-library", async ({ page }) => {
    await page.goto("/templates", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/gpus-console\/templates-library/, {
      timeout: 30_000,
    });
    await noError(page);
  });

  test("/build-month → 首页", async ({ page }) => {
    await page.goto("/build-month", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(
      (url) => /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/?)?$/.test(url.pathname),
      { timeout: 30_000 },
    );
    await noError(page);
  });
});
