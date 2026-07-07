import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/console/pricing-console（控制台版定价页）。
 *
 * 页面类型（读 page.tsx 确认）：server component，把 RSC 服务端 fetch 的
 * `getFullLLMModels()` 结果作为 initialFullLLMModels 传给 "use client" 的 DetailContent，
 * 再套上 ConsoleHeaderWrapper 控制台外壳。**它不鉴权**——实测未登录/假 token 都不会被弹去
 * /login（pricing 是公开内容，只是在 console 布局里渲染）。仍 seedAuth 是为了走到「已登录
 * 控制台壳 + 客户端取数」的真实路径，并断言「不被意外弹登录」。
 *
 * 两类数据，mock 策略不同（RSC 边界）：
 *  - 默认「Serverless Endpoints」(value="model") tab：内容来自 RSC 的 initialFullLLMModels，
 *    在服务端 fetch（:3101 真实 dev 后端，无 token），page.route() **拦不到**。故对该 tab 只断言
 *    「内容容器可见 + 渲染出表格（结构/不白屏）」，不断言具体数据值——数据正确性交给 smoke 层。
 *  - GPU / Agent Sandbox tab：DetailContent 挂载后客户端 fetch（reqMarketProducts →
 *    /api/v1/market/products；reqSandboxPrice → /v1/product/agent-sandbox/price；
 *    reqSandboxStoragePrice → /v1/product/batch-price；reqHomeProductsStorage →
 *    /api/v1/home/products/storage）。这是 mockBackend 注入 fixture 的主场，可断言**确定性数据**
 *    （GPU 卡数 == fixture 产品数、卡内出现产品名/显存）。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点全部 locale 无关 / 源码硬编码：
 *  - tab 触发器：CLICK_BTN_IDs.PRICING_BTNS.FIRST_PAGE_*_TAB 落到 <button id>（源码硬编码 track id）。
 *  - Radix tab 内容容器：id 后缀 -content-model / -content-gpu / -content-sandbox（Radix Tabs 生成，稳定）。
 *  - GPU 卡：每卡一张含 <th>Specification 的表（GpuPrice 源码硬编码列名），命中数 == 产品数，是干净的「卡数」锚点；
 *    卡名 <p> 渲染 "1x{productName}"（JSX 折叠了 "1x " 后空格，故用 /RTX 4090/ 这类产品名正则，非 i18n）。
 *  - Sandbox 表头 vCPUs / Memory / Storage / Unit Price 是 SandboxPrice 源码内联 JSX 字面量（非 i18n 目录键）。
 * 已在交付报告里建议给 DetailContent 的 tab 内容容器与 GpuPrice 卡补 data-testid。
 */

const ENDPOINTS = {
  // GPU tab（客户端取数）—— 注入数组壳 fixture，撑起卡片列表
  "/api/v1/market/products": loadFixture(
    "console-pricing-console-market-products.json",
  ),
  "/api/v1/home/products/storage": loadFixture(
    "console-pricing-console-storage.json",
  ),
  // Sandbox tab（客户端取数）
  "/v1/product/agent-sandbox/price": loadFixture(
    "console-pricing-console-sandbox-price.json",
  ),
  "/v1/product/batch-price": loadFixture(
    "console-pricing-console-batch-price.json",
  ),
  // 模型 tab 的 dynamic-pricing 客户端补充数据（Redux multimodalSlice）
  "/v1/product/multimodal-model/list": loadFixture(
    "console-pricing-console-multimodal-list.json",
  ),
  // 顶部促销 banner
  "/v3/stripe/promotion": loadFixture("console-pricing-console-promotion.json"),
};

const TAB_ID = {
  serverless: "main__pricing__first-page__serverless-endpoints-tab",
  dedicated: "main__pricing__first-page__dedicated-endpoints-tab",
  sandbox: "main__pricing__first-page__sandbox-tab",
  gpu: "main__pricing__first-page__gpus-tab",
};

const byId = (page: Page, id: string) => page.locator(`[id="${id}"]`);
/** Radix Tabs 生成的内容容器：id 形如 `radix-:Rxxx:-content-<value>`，用后缀定位。 */
const tabContent = (page: Page, value: string) =>
  page.locator(`[id$="-content-${value}"]`);

const NO_ERROR_BOUNDARY = async (page: Page) =>
  expect(page.getByRole("heading", { name: "Error", exact: true })).toHaveCount(
    0,
  );

test.describe("Console Pricing（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("控制台壳 + 4 个定价 tab 结构渲染，默认 Serverless 选中、未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/console/pricing-console");

    // 稳定锚点：默认 model tab 内容容器（RSC initialFullLLMModels 渲染完成的信号），自带重试等待。
    const modelContent = tabContent(page, "model");
    await expect(modelContent).toBeVisible({ timeout: 30_000 });

    // --- 未被意外弹去登录（pricing 公开内容，套 console 壳；seedAuth 后仍应留在原路由） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 控制台外壳渲染（ConsoleHeaderWrapper 的侧边导航） ---
    await expect(page.locator(".console-side-navigation")).toHaveCount(1);

    // --- 结构：4 个 tab 触发器（源码硬编码 track id）均可见 ---
    await expect(byId(page, TAB_ID.serverless)).toBeVisible();
    await expect(byId(page, TAB_ID.dedicated)).toBeVisible();
    await expect(byId(page, TAB_ID.sandbox)).toBeVisible();
    await expect(byId(page, TAB_ID.gpu)).toBeVisible();

    // --- 结构：Radix tablist 恰好 4 个 tab，默认 Serverless(model) 选中 ---
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(4);
    await expect(byId(page, TAB_ID.serverless)).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // --- 默认 model tab：RSC 数据渲染出表格（结构 / 不白屏；不断言具体值，交给 smoke） ---
    await expect(modelContent.locator("table").first()).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await NO_ERROR_BOUNDARY(page);
  });

  test("切到 GPUs tab：按 fixture 渲染 N 张 GPU 卡（卡数==产品数）+ 产品名/显存，不崩", async ({
    page,
  }) => {
    const market = loadFixture<{ products: { productName: string }[] }>(
      "console-pricing-console-market-products.json",
    );
    const expectedCards = market.products.length; // 4

    await page.goto("/console/pricing-console");
    // 等默认 tab 就绪后再切（稳定锚点），避免在挂载期抢跑。
    await expect(tabContent(page, "model")).toBeVisible({ timeout: 30_000 });

    await byId(page, TAB_ID.gpu).click();

    const gpuContent = tabContent(page, "gpu");
    // 客户端 fetch + GpuPrice 渲染完成的信号：第一张卡的 Specification 表头出现。
    await expect(
      gpuContent.locator("th", { hasText: "Specification" }).first(),
    ).toBeVisible({ timeout: 30_000 });

    // --- tab 切换生效：GPU 内容显示、model 内容隐藏（Radix 互斥） ---
    await expect(gpuContent).toBeVisible();
    await expect(tabContent(page, "model")).toBeHidden();
    await expect(byId(page, TAB_ID.gpu)).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // --- 确定性数据：每张 GPU 卡一张含 Specification 列的表 → 命中数 == fixture 产品数 ---
    await expect(
      gpuContent.locator("th", { hasText: "Specification" }),
    ).toHaveCount(expectedCards);

    // --- 代表性数据值：fixture 头两个产品名渲染进卡片（卡名 <p> "1x{productName}"，用产品名正则） ---
    await expect(gpuContent.getByText(/RTX 4090/).first()).toBeVisible();
    await expect(gpuContent.getByText(/RTX 5090/).first()).toBeVisible();
    // GpuPrice 桌面表格规格单元格硬编码 "<gpuMemory> GB VRAM"；
    // 移动端卡片也会渲染同文案但在桌面 viewport 下隐藏，断言需限定到 table cell。
    await expect(
      gpuContent.locator("td", { hasText: "24 GB VRAM" }).first(),
    ).toBeVisible();

    await NO_ERROR_BOUNDARY(page);
  });

  test("切到 Agent Sandbox tab：渲染 sandbox 价格表（vCPUs / Memory / Storage 列），不崩", async ({
    page,
  }) => {
    await page.goto("/console/pricing-console");
    await expect(tabContent(page, "model")).toBeVisible({ timeout: 30_000 });

    await byId(page, TAB_ID.sandbox).click();

    const sbContent = tabContent(page, "sandbox");
    await expect(sbContent).toBeVisible({ timeout: 30_000 });
    await expect(byId(page, TAB_ID.sandbox)).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // --- 结构：SandboxPrice 三张价格表的硬编码列头（源码内联字面量，非 i18n） ---
    // vCPUs / Memory / Storage 各自所在表头出现，证明三块价格表都渲染（受 sandbox-price + batch-price fixture 驱动）。
    await expect(
      sbContent.locator("th", { hasText: "vCPUs" }).first(),
    ).toBeVisible();
    await expect(
      sbContent.locator("th", { hasText: "Memory" }).first(),
    ).toBeVisible();
    await expect(
      sbContent.locator("th", { hasText: "Storage" }).first(),
    ).toBeVisible();

    await NO_ERROR_BOUNDARY(page);
  });
});
