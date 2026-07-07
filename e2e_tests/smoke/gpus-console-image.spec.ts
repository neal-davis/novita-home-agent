import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端 dev-api.novita.ai）：/gpus-console/image（Image Prewarm）。
 *
 * console 路由需登录 → 用例开头 token skip 守卫；当前 .env.e2e 无 E2E_NOVITA_TOKEN 时整组
 * 自动 skip（属预期）。有 token 时登录态由 auth.setup.ts 落成 storageState、smoke 项目自动
 * 加载（见 playwright.smoke.config.ts），无需手动种 cookie。
 *
 * 断言策略：
 *  - waitForResponse 强校验该页关键端点 GET /api/v1/image/prewarm（reqGpuImagePrewarm）真实 2xx
 *    ——image-prewarm 列表后端契约的真相源。
 *  - 再做结构断言：未弹登录、不触发错误边界、工具栏配额 help 图标可见（结构锚点，非数据值）。
 *  - 不断言具体任务数 / 数据值——真实账户的 prewarm 任务会变；确定性数据值断言在 hermetic 层。
 */
test.describe("@smoke GPU Console Image Prewarm（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("真实后端 /image/prewarm 2xx 且渲染任务列表或空态、不崩", async ({
    page,
  }) => {
    const listResp = page.waitForResponse(
      (r) =>
        r.url().includes("/image/prewarm") &&
        !r.url().includes("/image/prewarm/quota") &&
        r.request().method() === "GET",
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/image", { waitUntil: "domcontentloaded" });

    const res = await listResp;
    expect(res.status(), "image/prewarm should be 2xx").toBeLessThan(300);

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/login/);

    // 工具栏配额 help 图标渲染（结构锚点，有任务/无任务都在）
    await expect(page.locator("img[src*='help.svg']")).toBeVisible({
      timeout: 30_000,
    });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
