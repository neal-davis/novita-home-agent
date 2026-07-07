import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/templates-library。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时
 * 整组自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目
 * 自动加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点 GET /api/v1/official/templates 真实 2xx
 *    （后端契约的真相源）；
 *  - 再做结构断言：未弹登录、不触发错误边界、页面主体二选一可见
 *    （有模板 → 模板卡 card_container_list；无模板 → DataEmpty 的 NoData）。
 *  - 不断言具体模板数 / 数据值——真实环境模板会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke GPU Console Templates Library（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 GET /api/v1/official/templates 2xx 且渲染模板列表或空态", async ({
    page,
  }) => {
    const officialResp = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname.endsWith("/api/v1/official/templates") &&
        r.request().method() === "GET" &&
        r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/templates-library", {
      waitUntil: "domcontentloaded",
    });

    await officialResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // 主体二选一可见：有模板 → 卡片包裹层（稳定 class）；无模板 → DataEmpty 的 NoData。
    const cardList = page.locator('[class*="card_container_list"]');
    const noData = page.locator('img[alt="no data"]');
    await expect
      .poll(
        async () => (await cardList.count()) > 0 || (await noData.count()) > 0,
        { timeout: 30_000 },
      )
      .toBe(true);

    // 工具栏图标在两态都渲染（页面主体渲染完成的稳定锚点）
    await expect(page.locator("svg.lucide-layout-grid").first()).toBeVisible();

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
