import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/explore。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时
 * 整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点 /market/products（GPU 产品列表，登录后走
 *    /market/auth/products）真实 2xx——这是创建表单产品区的后端契约真相源；
 *  - 再做结构断言：未弹登录、不触发错误边界、创建表单外壳可见
 *    （section_subContainer + StepOne 过滤区）。
 *  - 不断言具体产品数 / 价格——真实库存会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke GPU Console Explore（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /market/products 2xx 且渲染 GPU 创建表单", async ({
    page,
  }) => {
    const productsResp = page.waitForResponse(
      (r) => r.url().includes("/market/products") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/explore", { waitUntil: "domcontentloaded" });

    await productsResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // 创建表单外壳可见：section 容器 + StepOne 过滤区（客户端 ssr:false 挂载完成的信号）
    await expect(page.locator("[class*='section_subContainer']")).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator("[class*='stepOne_filterArea']").first(),
    ).toBeVisible({ timeout: 30_000 });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
