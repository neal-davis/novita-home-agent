import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-spot（营销/公开页，无需登录）。
 *
 * 页面类型（读 src 实测确认）：
 *  - app/gpus-spot/page.tsx 是 server component，本身不取数；渲染 FirstPage（静态 server，含 <h1>）
 *    + GPUPricing（"use client"）+ 其余静态营销区块。
 *  - 价格主数据由 GPUPricing（"use client"）挂载后发 XHR reqMarketProducts({ billingMethod: "spot" })
 *    = GET {service_base_url}/api/v1/market/products → 客户端取数，page.route 可拦，注入 fixture 断确定性值。
 *  - /gpus-spot 不在 LOGIN_REQUIRED_URL，未登录不会被弹去登录，故不 seedAuth、不 mock /v1/user/info。
 *
 * 渲染契约（GPUPricing + GPUPricingCard 实测）：
 *  - res.products < 4 时：price1=slice(0,2)、price2=slice(2) → 桌面容器(webContainer)共 N 张卡片。
 *    本 fixture 3 条 → 3 张卡片（5090/4090 在 price1，H100 在 price2）。
 *  - 每张卡片渲染：On-demand:$price/hr/GPU（price=round(discount/1000)/100），
 *    spot 价格在 instanceSpotPrice.discount>0 时出 Spot:$spotPrice/hr/GPU，
 *    Save N%（N=round((price-spot)/price*100)）。fixture 3 条算出的展示值（确定性、非 i18n）：
 *      RTX 5090 32GB  On-demand $0.73  Spot $0.37  Save 49%
 *      RTX 4090 24GB  On-demand $0.67  Spot $0.34  Save 49%
 *      H100 SXM 80GB  On-demand $2.59  Spot $1.30  Save 50%
 *    ⇒ 桌面容器内 '/hr/GPU' 出现 6 次（3 on-demand + 3 spot）。这些数字源于 fixture 计算，
 *    断言它们既不是 i18n 文案、又对 fixture 有牙（改 fixture 会 FAIL，已做变异测试验证）。
 *
 * 选择器纪律：无 i18n 文案断言。
 *  - 结构锚点用稳定 class 片段（CSS-module 前缀子串 [class*="webContainer"] / [class*="GPUPricingCard_box"]）、
 *    h1 结构角色（不带文案 name）。
 *  - 数据锚点用「源自 fixture 计算的价格字符串」（非 UI 文案），且**作用域限定到桌面容器**——
 *    页面移动端用 swiper（loop=true 克隆 slide）会把全局文本计数翻倍/抖动，必须 scope 到
 *    webContainer 才确定性。
 *  - 页面无 data-testid（见交付报告「建议补 data-testid」）。
 */

const MARKET_PRODUCTS = "gpus-spot-market-products.json";

test.describe("GPU Spot marketing page（hermetic）", () => {
  test("客户端 spot 价格按 fixture 渲染 3 张卡片 + 确定性数值，未弹登录、不崩", async ({
    page,
  }) => {
    const fixture = loadFixture<{ products: unknown[] }>(MARKET_PRODUCTS);
    expect(fixture.products).toHaveLength(3); // 守卫：fixture 形状即测试前提

    await mockBackend(page, {
      endpoints: { "/api/v1/market/products": fixture },
    });
    await page.goto("/gpus-spot", { waitUntil: "domcontentloaded" });

    // --- 首屏 FirstPage（静态结构锚点：h1，不断言文案） ---
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });

    // --- 未被弹去登录（公开页，且未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 价格区桌面容器（单一稳定 class 片段锚点；移动端 swiper 容器不计入断言） ---
    const desktop = page.locator('[class*="webContainer"]');
    await expect(desktop).toHaveCount(1, { timeout: 30_000 });

    // --- 客户端 XHR 完成 → 价格卡片按 fixture 出 3 张 ---
    const cards = desktop.locator('[class*="GPUPricingCard_box"]');
    // 先等首张卡片出现（客户端 XHR 已 resolve 的信号），再做计数，避免 loading 期抢跑。
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    await expect(cards).toHaveCount(3);

    // 桌面容器内 '/hr/GPU' == 3 on-demand + 3 spot == 6（全 3 条都有 spot 价），确定性源自 fixture。
    await expect(desktop.getByText("/hr/GPU")).toHaveCount(6);
    // 每张卡片一个 Save 徽标
    await expect(desktop.locator('[class*="GPUPricingCard_save"]')).toHaveCount(
      3,
    );

    // --- 代表性确定性数值（GPUPricingCard 计算结果，非 i18n 文案；scope 到桌面容器去重克隆） ---
    // RTX 5090：on-demand 0.73 / spot 0.37 / save 49%
    await expect(desktop.getByText("$0.73", { exact: false })).toBeVisible();
    await expect(desktop.getByText("$0.37", { exact: false })).toBeVisible();
    // RTX 4090：on-demand 0.67 / spot 0.34
    await expect(desktop.getByText("$0.67", { exact: false })).toBeVisible();
    await expect(desktop.getByText("$0.34", { exact: false })).toBeVisible();
    // H100：on-demand 2.59 / spot 1.30 / save 50%
    await expect(desktop.getByText("$2.59", { exact: false })).toBeVisible();
    await expect(desktop.getByText("$1.30", { exact: false })).toBeVisible();

    // --- 产品名（公开 SKU，来自 fixture）逐张渲染（scope 到桌面容器去重 swiper 克隆） ---
    for (const name of ["RTX 5090 32GB", "RTX 4090 24GB", "H100 SXM 80GB"]) {
      await expect(desktop.getByText(name, { exact: false })).toBeVisible();
    }

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);

    // --- 非白屏：主体有实际内容 ---
    expect(
      (await page.locator("body").innerText()).trim().length,
    ).toBeGreaterThan(100);
  });

  test("后端取数失败（500）：价格区降级为 0 卡片，页面结构不崩、未弹登录", async ({
    page,
  }) => {
    // GPUPricing 的 reqMarketProducts 被拒后 .then 不执行（无 .catch）→ price1/price2 保持 []：
    // 无价格卡片，但 FirstPage(h1)/价格区标题/桌面容器仍在，React 错误边界不触发。
    await mockBackend(page, {
      failEndpoints: { "/api/v1/market/products": 500 },
    });
    await page.goto("/gpus-spot", { waitUntil: "domcontentloaded" });

    // FirstPage 仍渲染（h1）
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).not.toHaveURL(/\/login/);

    // 价格区桌面容器仍渲染（标题/容器是静态的）
    const desktop = page.locator('[class*="webContainer"]');
    await expect(desktop).toHaveCount(1, { timeout: 30_000 });

    // 500 时价格卡片永不出现 → toHaveCount(0) 自带重试即安全，不用 waitForResponse
    //（构建产物上请求可能在 goto 期间就完成、抢在监听注册前，实测 flaky 15s 超时）。
    // 无价格卡片 → 0 张 box、0 个 '/hr/GPU'
    await expect(desktop.locator('[class*="GPUPricingCard_box"]')).toHaveCount(
      0,
    );
    await expect(desktop.getByText("/hr/GPU")).toHaveCount(0);

    // 失败分支不应触发错误边界（页面已挂载、仅价格区为空）
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
