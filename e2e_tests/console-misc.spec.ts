import { test, expect } from "@playwright/test";
import { authConsole } from "./helpers/authConsole";

/**
 * hermetic 行为门禁：杂项鉴权路由（匿名弹登录 → 本层测已登录态行为）。
 *  - /billing（裸路由）：billing/page.tsx 无 section 时 return <OverviewPage/>；已登录可达不崩。
 *  - /oauth/authorize：server 组件，缺 client_id/redirect_uri → 渲染硬编码英文 <h1>Request
 *    parameter error</h1>（src/app/oauth/authorize/page.tsx:74-86，非 i18n、确定）。
 *  - /model-api/model/upload：308 服务端跳 /models-console/model-management（curl 实测 308）。
 */

const noError = (page: import("@playwright/test").Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("杂项鉴权路由（hermetic, authed）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await authConsole(page);
  });

  test("/billing 裸路由已登录可达（渲染 Overview，不崩）", async ({ page }) => {
    await page.goto("/billing", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/login/);
    // 停留在 /billing（未被二次弹走），且页面挂载（body 有实质内容）
    await expect(page).toHaveURL(/\/billing(\/?|\?.*)?$/);
    await expect(page.locator("body")).not.toBeEmpty();
    await noError(page);
  });

  test("/oauth/authorize 无参渲染 Request parameter error", async ({
    page,
  }) => {
    await page.goto("/oauth/authorize", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Request parameter error/i }),
    ).toBeVisible({ timeout: 30_000 });
    await noError(page);
  });

  test("/model-api/model/upload → /models-console/model-management（308）", async ({
    page,
  }) => {
    await page.goto("/model-api/model/upload", {
      waitUntil: "domcontentloaded",
    });
    // 本路由的契约 = 这条 308 跳转本身。toHaveURL 自带轮询重试（308 常在 goto 期间就 settle，
    // waitForURL 监听易 racy）。**不**断目标页 model-management 的健康——那是另一路由的契约，
    // 且它在空 mock 下会走「数组壳陷阱」错误边界（需自己的列表 fixture，由其专属 spec 负责）。
    await expect(page).toHaveURL(/\/models-console\/model-management/, {
      timeout: 30_000,
    });
  });
});
