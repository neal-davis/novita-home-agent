import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/jobs。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时
 * 整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 页面现状（读 src 确认）：/gpus-console/jobs 是「壳页」——page.tsx 里 jobs 表格 <Section />
 * 被注释掉，路由当前**不发任何 jobs 列表 XHR**（故无 /gpu/job 端点可强校验）。本路由真正
 * 会打的真实后端信号是 console 会话端点 /v1/user/info（顶部 Header 鉴权）。因此 smoke：
 *  - waitForResponse 强校验 /v1/user/info 真实 2xx（登录态契约的真相源）；
 *  - 再做结构断言：未弹登录、console 侧边导航渲染、Jobs 导航项 active、不触发错误边界。
 *  - 不断言任何 jobs 数据行——当前页面不渲染表格；若日后接回 <Section /> 再补数据断言。
 */
test.describe("@smoke GPU Console Jobs（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /v1/user/info 2xx 且渲染 console 框架 + Jobs 导航 active", async ({
    page,
  }) => {
    const userInfoResp = page.waitForResponse(
      (r) => r.url().includes("/v1/user/info") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/jobs", { waitUntil: "domcontentloaded" });

    await userInfoResp;

    // 未被弹去登录（真实 token 生效）：仍停在 jobs 路由。
    await expect(page).not.toHaveURL(/\/user\/login/);
    await expect(page).toHaveURL(/\/gpus-console\/jobs/);

    // console 侧边导航渲染（稳定 class，locale 无关）。
    await expect(page.locator(".console-side-navigation")).toHaveCount(1, {
      timeout: 30_000,
    });

    // 路由被识别：侧栏唯一 active 项指向 jobs（href 确定性，非 i18n 文案）。
    const activeLinks = page.locator(
      '.console-side-navigation a[class*="active"]',
    );
    await expect(activeLinks).toHaveCount(1);
    await expect(activeLinks).toHaveAttribute("href", /\/gpus-console\/jobs$/);

    // 不触发错误边界。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
