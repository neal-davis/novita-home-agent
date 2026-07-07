import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/dedicated-endpoint（营销页 · 公开无需登录）。
 *
 * 这一层不只断言「不白屏」（那由全站 sweep 覆盖），而是断言**确定性行为**：
 * 客户端 GPU 预算列表按 mocked /api/v1/llm/dedicated/spec 计算出确定价格行、
 * 静态定价表结构出行、关键区块标题可见、未被弹去登录、不触发错误边界。
 *
 * RSC 边界（写断言前看过 page.tsx）：page.tsx 是同步 server component，但取数全在
 * 客户端：DedicatedEndpointGpuBudgetList（"use client"）挂载后经 useDedicatedGpuPricing
 * → getLLMDedicatedSpec() 发 XHR 到 *-api-server.novita.ai/api/v1/llm/dedicated/spec，
 * 可被 page.route 拦截 → 这是 fixture 注入的主场，可断言**确定性价格行**。
 * 其余区块（Hero/Features/ModelCatalog/Workflow/Pricing/Faq 标题与静态表）是硬编码
 * JSX 字面量（非 i18n 目录、非 XHR），随页面渲染即出。
 *
 * 数据契约（读 useDedicatedGpuPricing.ts + 实测确认）：
 *  - getLLMDedicatedSpec：无 token cookie（本页公开、未 seedAuth）→ 命中
 *    /api/v1/llm/dedicated/spec（即 captured 路径，与 fixture key 对齐）。
 *  - 价格公式 formatDedicatedGpuPricePerHour：Big(discount||price)/10000/pricePrecision*3600，
 *    toFixed(2)，前缀 "$"。fixture（precision 均 100）：
 *      RTX 4090 discount 170 → $0.61   RTX 5090 discount 203 → $0.73
 *      H100     discount 552 → $1.99   H200     discount 830 → $2.99
 *  - buildDedicatedGpuPricingRows：按 DEDICATED_GPU_PRESET_KEYS 顺序
 *    [RTX_4090, RTX_5090, H100, H200] 去重输出 → 预算列表恰 4 行。
 *  - 列表项渲染成 "from <价格>/hr"（DOM 大写化为 "FROM $X/HR"）。其中 $0.73（RTX 5090）
 *    只出现在该数据驱动列表（静态定价表 / 静态 Workflow 列表都没有 5090）→ 用作
 *    「fixture 确实驱动了该列表」的唯一指纹。
 *
 * 选择器纪律：页面零 data-testid（已在交付报告建议补）。锚点用：① 硬编码区块标题
 * （getByRole heading，name 是源码字面量非 i18n）；② 静态定价表用 <th> 文案 + xpath
 * ancestor::table（shadcn/原生 th 不暴露 columnheader role，实测）；③ 预算列表用其
 * 独有的 "FROM …/HR" 文案模式（区别于 Workflow 的 "· …/hr" 格式）。
 */

const ENDPOINTS = {
  // 数据驱动：预算列表的真相源（客户端 XHR）
  "/api/v1/llm/dedicated/spec": loadFixture("dedicated-endpoint-spec.json"),
  // 该页挂载链路上会打的 promotion 端点（navbar/footer 优惠条）：显式注入避免走兜底壳子
  "/v3/stripe/promotion": loadFixture("dedicated-endpoint-promotion.json"),
};

/** 整表定位：<th> 文案锚点 → 其祖先 <table>（th 无 columnheader role，用 xpath）。 */
const tableByHeader = (page: Page, header: string) =>
  page
    .locator("th", { hasText: header })
    .first()
    .locator("xpath=ancestor::table[1]");

/**
 * 预算列表项：每行渲染为单个 <p>「from <price>/hr」（DedicatedEndpointGpuBudgetList，
 * CSS uppercase 仅视觉）。用 <p> + hasText 锚 "from $…/hr"（^from 起头）精确圈出这 4 个
 * 数据驱动段落——区别于 Hero 副标题里 mid-sentence 的 "from"、Workflow 的 "· …/hr" 格式。
 * getByText 大小写按渲染态归一，断言用与渲染一致的大写 "FROM …/HR"。
 */
const budgetRows = (page: Page) =>
  page.locator("p").filter({ hasText: /^from\s+\$[\d.]+\/hr$/i });

test.describe("Dedicated Endpoint（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 公开营销页：不 seedAuth（保持未登录 → spec 走非 auth 路径，与 captured/fixture 对齐）。
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("客户端 GPU 预算列表按 mocked spec 计算出确定价格行；静态结构出行、未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/dedicated-endpoint", { waitUntil: "domcontentloaded" });

    // 先等数据驱动列表的稳定锚点（spec XHR + 计算渲染完成），再做后续断言。
    await expect(budgetRows(page).first()).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（公开页，应停留原路由） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);

    // === 数据驱动断言：预算列表恰 4 行（preset key 顺序去重） ===
    await expect(budgetRows(page)).toHaveCount(4);

    // 四个确定价格逐一可见（证明 fixture → 价格公式链路）。文本节点是小写 "from $X/hr"，
    // 用正则锚定整段，避免 "$1.99" 子串误命中 "$11.99" 之类。
    for (const price of ["0.61", "0.73", "1.99", "2.99"]) {
      await expect(
        budgetRows(page).filter({
          hasText: new RegExp(`^from\\s+\\$${price}/hr$`, "i"),
        }),
      ).toHaveCount(1);
    }

    // RTX 5090（$0.73）是该数据驱动列表的唯一指纹（静态表/Workflow 都无 5090）
    // → 命中即证明这一行确由注入的 spec fixture 生成，而非页面静态文案。
    await expect(
      budgetRows(page).filter({ hasText: /^from\s+\$0\.73\/hr$/i }),
    ).toHaveCount(1);

    // === 静态结构断言：Transparent GPU Pricing 表（硬编码 3 行） ===
    const pricingTable = tableByHeader(page, "Price / GPU-hour");
    await expect(pricingTable).toBeVisible();
    await expect(pricingTable.locator("tbody tr")).toHaveCount(3);

    // === 关键区块标题（均为源码硬编码字面量，非 i18n 目录） ===
    await expect(
      page.getByRole("heading", { name: "Transparent GPU Pricing" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Deploy Popular Open-Source Models" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Built for Production Workloads" }),
    ).toBeVisible();
  });

  test("spec 端点失败时预算列表不崩（catch→空列表），页面其余结构仍渲染", async ({
    page,
  }) => {
    // 覆盖 useDedicatedGpuPricing 的 .catch 分支：spec 500 → setRows([])，
    // DedicatedEndpointGpuBudgetList 在 !loading && rows.length===0 时 return null。
    // 页面不应因此崩或弹错误边界，静态结构照常渲染。
    await mockBackend(page, {
      endpoints: { "/v3/stripe/promotion": ENDPOINTS["/v3/stripe/promotion"] },
      failEndpoints: { "/api/v1/llm/dedicated/spec": 500 },
    });

    await page.goto("/dedicated-endpoint", { waitUntil: "domcontentloaded" });

    // 静态定价表仍在（与 spec 端点无关）
    const pricingTable = tableByHeader(page, "Price / GPU-hour");
    await expect(pricingTable).toBeVisible({ timeout: 30_000 });
    await expect(pricingTable.locator("tbody tr")).toHaveCount(3);

    // 数据驱动预算列表降级为空（无 "FROM …/HR" 行）
    await expect(budgetRows(page)).toHaveCount(0);

    // 不触发错误边界、未弹登录
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/login/);
  });
});
