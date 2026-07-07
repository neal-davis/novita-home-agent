import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/gpus-console/billing。
 *
 * 这条是已废弃路由，middleware 308 重定向到 /billing/details（见 hermetic spec 注释）。
 * 重定向本身不需要登录就会发生（服务端 middleware），但落地的 /billing/details 需要登录
 * 才会渲染账单主体 → 用例开头 token skip 守卫；无 E2E_NOVITA_TOKEN 时整组自动 skip。
 * 有 token 时登录态由 auth.setup.ts 落 storageState、smoke 项目自动加载。
 *
 * 断言策略：
 *  - 校验服务端 308 真的把 /gpus-console/billing 落到 /billing/details；
 *  - waitForResponse 强校验落地页关键端点 /v1/billing/bill/list 真实 2xx（后端契约真相源）；
 *  - 结构断言（DetailContent 的 tablist 出现、未弹登录、不触发错误边界）。
 *  - 不断言具体数据值——真实账户数据会变；确定性结构断言在 hermetic 层。
 */
test.describe("@smoke GPU Console Billing 重定向（真实后端）", () => {
  test.skip(!process.env.E2E_NOVITA_TOKEN, "no e2e token");

  test("308 落到 /billing/details，bill/list 真实 2xx 且渲染账单主体", async ({
    page,
  }) => {
    const billResp = page.waitForResponse(
      (r) => r.url().includes("/v1/billing/bill/list") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/gpus-console/billing", {
      waitUntil: "domcontentloaded",
    });

    // 服务端 308：最终落在 /billing/details
    await expect(page).toHaveURL(/\/billing\/details$/, { timeout: 30_000 });

    await billResp;

    // 未被弹去登录（真实 token 生效）
    await expect(page).not.toHaveURL(/\/user\/login/);

    // billing-details 的 DetailContent 主体结构出现（shadcn Tabs 的 tablist）。
    await expect(page.getByRole("tablist").first()).toBeVisible({
      timeout: 30_000,
    });

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
