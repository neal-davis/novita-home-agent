import { test, expect } from "@playwright/test";

/**
 * smoke（真相源 · 真实 dev 后端）：/console/pricing-console（控制台版定价页）。
 *
 * 该路由**无需登录**——pricing 是公开内容，只是套在 console 外壳里渲染（见 page.tsx：
 * RSC getFullLLMModels 取公开模型目录；GPU/Sandbox tab 客户端取公开定价）。实测未登录可达、
 * 不弹 /login。故照 pricing.spec.ts 公开范式，**不加 token skip**，随时可跑。
 *
 * 断言策略（truth-source = 真实后端契约仍活着 + 页面不崩）：
 *  - waitForResponse 强校验 GPU tab 客户端拉取的公开定价端点真实 2xx
 *    （reqMarketProducts → <service_base_url>/api/v1/market/products，真实 dev 后端），
 *    这是后端契约的真相源。
 *  - 结构断言：4 个定价 tab 稳定 id + 默认 Serverless tab 内容容器渲染、tab 可切换、
 *    未弹登录、不触发错误边界。
 *  - **不**断言 GPU 卡片具体出行——真实 dev 目录数据稀疏（实测 usableNode=false 等导致 GPU
 *    价格表未必出卡），且具体数据值断言已在 hermetic 层（注入 prod 形状 fixture）覆盖；
 *    smoke 只保证「端点活着 + 页面结构 + 不崩」。
 */
test.describe("@smoke Console Pricing（真实后端）", () => {
  test("真实后端公开定价端点 2xx 且控制台定价页结构渲染、不崩", async ({
    page,
  }) => {
    // GPU tab 客户端拉取的公开定价端点（DetailContent 挂载后即发），强校验真实 2xx
    const marketResp = page.waitForResponse(
      (r) => r.url().includes("/api/v1/market/products") && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.goto("/console/pricing-console", {
      waitUntil: "domcontentloaded",
    });

    // 后端契约真相源：GPU 定价端点真实 2xx
    await marketResp;

    // 未被弹去登录（公开路由）
    await expect(page).not.toHaveURL(/\/login/);

    // 结构：4 个定价 tab 触发器（源码硬编码 track id）渲染
    const gpuTab = page.locator('[id="main__pricing__first-page__gpus-tab"]');
    await expect(gpuTab).toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator(
        '[id="main__pricing__first-page__serverless-endpoints-tab"]',
      ),
    ).toBeVisible();
    await expect(
      page.locator('[id="main__pricing__first-page__sandbox-tab"]'),
    ).toBeVisible();

    // 默认 Serverless(model) tab 内容容器从真实 RSC 数据渲染（不白屏）
    await expect(page.locator('[id$="-content-model"]')).toBeVisible({
      timeout: 30_000,
    });

    // tab 可切换：点 GPUs → 其 tab 被选中（交互真相源；不依赖稀疏的 GPU 目录数据出卡）
    await gpuTab.click();
    await expect(gpuTab).toHaveAttribute("aria-selected", "true");

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
