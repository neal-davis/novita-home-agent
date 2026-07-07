import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/coding-plan。
 *
 * /coding-plan 是营销定价页（无需登录即可浏览），其方案数据来自**公开**产品端点
 * /v1/product/resource-pack-specs/list（非 console 账单端点），故 smoke 不强制 token——
 * 营销页随时可跑（见两层模型「营销页（无需登录）随时可跑」）。有 storageState 也能跑，
 * 无登录态同样能验公开端点。
 *
 * 断言策略：
 *  - waitForResponse 强校验公开产品端点真实 2xx（后端契约的真相源）；
 *  - 再做结构断言：未被重定向回首页（CodingPlanGuard 活动期内放行）、方案卡出现、不崩。
 *  - 不断言具体价格/方案数——真实目录会随运营调整；确定性数值断言在 hermetic 层。
 *
 * 注：CodingPlanGuard 依赖活动期（服务端注入 redux 的 CODING-PLAN 活动）。若真实环境该活动
 * 已下线，页面会 router.replace("/")，方案卡不出现——此时本用例会失败，是真实信号（说明
 * 活动配置变更），而非 flaky；hermetic 层不受此影响（其活动态由 dev server 服务端种入）。
 */
test.describe("@smoke Coding Plan（真实后端）", () => {
  test("公开产品端点 2xx 且渲染方案卡、未被重定向回首页", async ({ page }) => {
    const specsResp = page.waitForResponse(
      (r) =>
        r.url().includes("/v1/product/resource-pack-specs/list") &&
        r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/coding-plan", { waitUntil: "domcontentloaded" });

    await specsResp;

    // CodingPlanGuard 放行：未被弹回首页（pathname 仍是 /coding-plan）
    await expect(page).toHaveURL(/\/coding-plan/);

    // 方案区块结构出现（#plans 容器 + 至少 1 张方案卡）。
    // tier_text_content 是 CSS module 结构 class；至少 1 条说明客户端取数渲染成功。
    await expect(page.locator("#plans")).toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator('[class*="tier_text_content"]').first(),
    ).toBeVisible({ timeout: 30_000 });

    // Model Access 触发器（每张卡都有，方案卡渲染成功的结构锚点，源码字面量）
    await expect(
      page.getByText("Model Access", { exact: true }).first(),
    ).toBeVisible();

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
