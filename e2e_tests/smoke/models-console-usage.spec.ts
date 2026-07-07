import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/models-console/usage。
 *
 * console 类路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN
 * 时整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、
 * smoke 项目自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点 /v1/user/queryApiUsageByTime 真实 2xx
 *    （客户端取数页，挂载后发 XHR；这是后端契约的真相源）；
 *  - 再做结构断言（playground CTA 链接出现、3 张图 canvas 渲染、未弹登录、不触发错误边界）。
 *  - 不断言具体数据值——真实账户用量会变；确定性数据断言留在 hermetic 层。
 */
test.describe("@smoke Models Console · Usage（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 queryApiUsageByTime 2xx 且渲染 3 张用量图", async ({
    page,
  }) => {
    const usageResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/user/queryApiUsageByTime") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/models-console/usage", {
      waitUntil: "domcontentloaded",
    });

    await usageResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/user\/login/);

    // 关键结构：playground CTA 链接（href 非 i18n，APIUsageChart 渲染成功的稳定锚点）
    await expect(page.locator('a[href="/model-api/playground"]')).toHaveCount(
      1,
      { timeout: 30_000 },
    );

    // 3 张 echarts 图均挂载成 <canvas>
    await expect(page.locator("canvas")).toHaveCount(3, { timeout: 30_000 });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
