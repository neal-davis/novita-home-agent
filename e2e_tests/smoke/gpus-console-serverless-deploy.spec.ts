import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/serverless-deploy。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时
 * 整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点「serverless GPU 规格」真实 2xx（后端契约的真相源）。
 *    登录态走 /serverless/auth/market/specs，未登录走 /serverless/market/specs——用
 *    /serverless/ + market/specs 子串兼容两者。
 *  - 再做结构断言：未弹登录、不触发错误边界、GPU 规格卡容器可见（真实后端有规格即出卡）。
 *  - 不断言具体卡数 / 数据值——真实后端规格目录会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke GPU Console Serverless Deploy（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 serverless market/specs 2xx 且渲染 GPU 规格卡", async ({
    page,
  }) => {
    const specsResp = page.waitForResponse(
      (r) =>
        /\/serverless\/(auth\/)?market\/specs/.test(r.url()) &&
        r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/serverless-deploy", {
      waitUntil: "domcontentloaded",
    });

    await specsResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // GPU 规格卡容器渲染（真实后端有规格 → 出卡；自带重试等待）。
    await expect(page.locator("[class*='productContainer']")).toBeVisible({
      timeout: 30_000,
    });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
