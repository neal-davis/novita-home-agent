import { test, expect } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：剩余动态参数路由（用 catalog sampleUrl 取样）+ 公开用户流程页。
 *
 * 断言「牙」（非 i18n）：
 *  - /gpus/gpu/rtx-4090：page.tsx 读**静态** content.gpuData[gpu_model]（非后端），命中即渲染、
 *    未命中 redirect("/not-found")。rtx-4090 命中 → 内容标题「RTX 4090」（GPU 型号名，确定）。
 *  - /models/llm/[model]：动态 LLM 详情页，hermetic 空数据下路由可解析、渲染外壳不崩（可达性契约）。
 *  - /models/[series]/[name]：hermetic 空数据下查不到模型 → 服务端 307 跳首页（curl 实测 307）。
 *  - /user/email-validate：硬编码英文标题「Email verification」（Form.tsx:63）。
 *  - /user/reset：邮箱重置表单（唯一 email input）。
 */

test.describe("动态参数 & 用户流程路由（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await mockBackend(page, {});
  });

  test("/gpus/gpu/rtx-4090 渲染 RTX 4090 详情（静态 gpuData）", async ({
    page,
  }) => {
    await page.goto("/gpus/gpu/rtx-4090", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/not-found/);
    await expect(
      page.getByRole("heading", { name: "RTX 4090", exact: true }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("footer").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/models/llm/[model] 动态 LLM 详情页可解析、渲染不崩", async ({
    page,
  }) => {
    await page.goto("/models/llm/deepseek-deepseek-r1-turbo", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).not.toHaveURL(/\/login/);
    // 路由解析成功并停留（未 404 / 未跳走）
    await expect(page).toHaveURL(/\/models\/llm\/deepseek-deepseek-r1-turbo/);
    // 页面外壳渲染（header 稳定埋点 id）
    await expect(
      page.locator('[id="main__header__main__model-library"]').first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/models/[series]/[name] 空数据下 307 跳首页", async ({ page }) => {
    await page.goto("/models/deepseek/deepseek-r1-turbo", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveURL(
      (url) => /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/?)?$/.test(url.pathname),
      { timeout: 30_000 },
    );
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/user/email-validate 渲染 Email verification", async ({ page }) => {
    await page.goto("/user/email-validate", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Email verification/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/user/reset 渲染邮箱重置表单", async ({ page }) => {
    await page.goto("/user/reset", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/user\/reset/);
    await expect(
      page.locator('input[placeholder="Email address"]'),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("/user/reset/[token] 渲染重置表单（token 仅在提交时校验，load 静态）", async ({
    page,
  }) => {
    // 取样路径 = route-samples.json 的 /user/reset/[token] 示例（供 e2e-coverage 计入该动态路由）
    await page.goto("/user/reset/e2e-sample-token", {
      waitUntil: "domcontentloaded",
    });
    await expect(page).toHaveURL(/\/user\/reset\/e2e-sample-token/);
    // [token] 页是独立的新密码表单（src/app/user/reset/[token]/components/resetForm.tsx）：
    // 硬编码英文标题 + 两个密码输入（Password / Password Confirmation），token 仅在提交时校验。
    await expect(page.getByText("Reset Password", { exact: true })).toBeVisible(
      {
        timeout: 30_000,
      },
    );
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();
    await expect(
      page.locator('input[placeholder="Password Confirmation"]'),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
