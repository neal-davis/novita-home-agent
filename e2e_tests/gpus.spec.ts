import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus（营销/公开页，无需登录）。
 *
 * 页面类型（读 src 实测确认）：
 *  - app/gpus/page.tsx 是 server component，但本身不取数，渲染 GpusHero（静态 "use client"）
 *    + GpusPageContent（GpusSpecsSection / GpusCodeShowcaseSection / GpusCapabilitiesSection）。
 *  - 价格主数据由 GpusSpecsSection（"use client"）挂载后发 XHR reqMarketProducts({})
 *    = GET {service_base_url}/api/v1/market/products → 客户端取数，page.route 可拦，注入 fixture 断确定性值。
 *  - /gpus 不在 LOGIN_REQUIRED_URL，未登录不会被弹去登录，故不 seedAuth、不 mock /v1/user/info。
 *
 * 渲染契约（GpusSpecsSection 实测）：
 *  - res.products 取前 4 条 → 每条一行：sampleConfiguration=productName；
 *    usageExample=`${gpuMemory} GB VRAM`；onDemand=dealGPUMoney(instancePrice.discount).toFixed(2)+'/hr/GPU'；
 *    spot=instanceSpotPrice.discount>0 时同上，否则 '—'。
 *  - dealGPUMoney(p)=round((p/100000)*100)/100。fixture 4 行算出的展示值（确定性、非 i18n）：
 *      4090   on-demand 0.67/hr/GPU  spot 0.34/hr/GPU
 *      5090   on-demand 0.60/hr/GPU  spot —
 *      H100   on-demand 2.59/hr/GPU  spot 1.30/hr/GPU
 *      L40S   on-demand 0.55/hr/GPU  spot —
 *    ⇒ '/hr/GPU' 文案出现 6 次（4 on-demand + 2 spot），'—' 出现 2 次。这些数字源于 fixture 计算，
 *    断言它们既不是 i18n 文案、又对 fixture 有牙（改 fixture 会 FAIL，已做变异测试验证）。
 *
 * 选择器纪律：无 i18n 文案断言。结构锚点用稳定 class 片段（.min-w-[980px] 表容器、
 * h1/h2 结构角色）；数据锚点用「源自 fixture 计算的价格字符串/产品名」（非 UI 文案）。
 * 页面无 data-testid（见交付报告「建议补 data-testid」）。
 */

const MARKET_PRODUCTS = "gpus-market-products.json";

test.describe("GPUs marketing page（hermetic）", () => {
  test("客户端价格数据按 fixture 渲染 4 行 + 结构完整，未弹登录、不崩", async ({
    page,
  }) => {
    const fixture = loadFixture<{ products: unknown[] }>(MARKET_PRODUCTS);
    expect(fixture.products).toHaveLength(4); // 守卫：fixture 形状即测试前提

    await mockBackend(page, {
      endpoints: { "/api/v1/market/products": fixture },
    });
    await page.goto("/gpus", { waitUntil: "domcontentloaded" });

    // --- 首屏 Hero（静态结构锚点：h1，不断言文案） ---
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });

    // --- 未被弹去登录（公开页，且未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 价格表结构容器（单一稳定 class 片段锚点） ---
    // GpusPageContent 在 RSC 内容流式后才挂载；共享 dev server 高负载下渲染较慢，
    // 给与 h1 同量级超时（不用 waitForTimeout 硬等，toHaveCount 自带重试）。
    await expect(page.locator(".min-w-\\[980px\\]")).toHaveCount(1, {
      timeout: 30_000,
    });

    // --- 客户端 XHR 完成 → 价格按 fixture 出行 ---
    // 先等首个价格 cell 出现（客户端 XHR 已 resolve 的信号），避免在 loading 期抢跑计数。
    await expect(page.getByText("/hr/GPU").first()).toBeVisible({
      timeout: 30_000,
    });
    // '/hr/GPU' 出现次数 == 4 on-demand + 2 spot（5090/L40S 无 spot 出 '—'） == 6，确定性源自 fixture。
    await expect(page.getByText("/hr/GPU")).toHaveCount(6);
    // 无 spot 的两行渲染 '—'
    await expect(page.getByText("—", { exact: true })).toHaveCount(2);

    // --- 代表性确定性数值（dealGPUMoney 计算结果，非 i18n 文案） ---
    await expect(page.getByText("0.67/hr/GPU", { exact: true })).toBeVisible(); // 4090 on-demand
    await expect(page.getByText("0.34/hr/GPU", { exact: true })).toBeVisible(); // 4090 spot
    await expect(page.getByText("2.59/hr/GPU", { exact: true })).toBeVisible(); // H100 on-demand
    await expect(page.getByText("1.30/hr/GPU", { exact: true })).toBeVisible(); // H100 spot

    // --- 产品名（公开 SKU，来自 fixture）逐行渲染 ---
    for (const name of [
      "RTX 4090 24GB",
      "NVIDIA GeForce RTX 5090 32GB",
      "H100 SXM 80GB",
      "NVIDIA L40S 48GB",
    ]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    // usageExample 派生值（`${gpuMemory} GB VRAM`）
    await expect(page.getByText("24 GB VRAM", { exact: true })).toBeVisible();
    await expect(page.getByText("80 GB VRAM", { exact: true })).toBeVisible();

    // --- 三大内容区块都渲染（结构角色 h2 计数，不断言具体文案） ---
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(3);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("后端取数失败（500）：价格表降级为空行，页面结构不崩、未弹登录", async ({
    page,
  }) => {
    // GpusSpecsSection 的 .catch → setRows([])：无价格行但表头/区块/Hero 仍在，错误边界不触发。
    await mockBackend(page, {
      failEndpoints: { "/api/v1/market/products": 500 },
    });
    await page.goto("/gpus", { waitUntil: "domcontentloaded" });

    // Hero 仍渲染
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).not.toHaveURL(/\/login/);

    // 三大区块仍渲染（结构角色，等到位再做空行负向断言，避免 loading 期抢跑）
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(3, {
      timeout: 30_000,
    });

    // 表容器仍在（表头是静态的），但无价格行 → '/hr/GPU' 0 次
    // （skeleton 与 catch 后的空 rows 都不含 '/hr/GPU'，故 0 次对失败分支稳定成立）
    await expect(page.locator(".min-w-\\[980px\\]")).toHaveCount(1);
    await expect(page.getByText("/hr/GPU")).toHaveCount(0);

    // 失败分支不应触发错误边界（catch 吞掉了）
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
