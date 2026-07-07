import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";
import {
  demoChecklist,
  demoPass,
  demoStep,
  demoTitle,
  installDemoHud,
} from "./helpers/demo";

/**
 * hermetic 行为门禁：/pricing（官网定价页）。
 *
 * 页面类型（读 page.tsx 确认）：server component，把 RSC 服务端 fetch 的
 * `getFullLLMModels(undefined, token)` 结果作为 initialFullLLMModels 传给 "use client" 的
 * DetailContent（与 /console/pricing-console 共用同一组件），外套 WebsiteNavbar + FirstPage hero
 * + FooterSection。**公开页**——不鉴权，未登录/无 token 都不会被弹去 /login，故不 seedAuth。
 *
 * 两类数据，mock 策略不同（RSC 边界，与 console-pricing-console.spec.ts 一致）：
 *  - 默认「Serverless Endpoints」(value="model") tab：内容来自 RSC 的 initialFullLLMModels，
 *    在服务端 fetch（dev-api.novita.ai，无 token），page.route() **拦不到**。但 getPriceContent()
 *    即使 llmList/embeddingList 为空也渲染静态 IMG/VIDEO/AUDIO 价表 → table 始终可见。故对该 tab
 *    只断言「内容容器可见 + 渲染出表格（结构/不白屏）」，不断言具体数据值——数据正确性交给 smoke 层。
 *  - GPU / Agent Sandbox tab：DetailContent 挂载后客户端 fetch（reqMarketProducts →
 *    /api/v1/market/products；reqSandboxPrice → /v1/product/agent-sandbox/price；
 *    reqSandboxStoragePrice → /v1/product/batch-price；reqHomeProductsStorage →
 *    /api/v1/home/products/storage）。这是 mockBackend 注入 fixture 的主场，可断言**确定性数据**
 *    （GPU 卡数 == fixture 产品数、卡内出现产品名/显存）。
 *
 * fixture 复用：/pricing 与 /console/pricing-console 共用同一 DetailContent + 同一后端端点，
 * 数据形状一致，直接复用 console-pricing-console-*.json（已过 check:fixtures 脱敏门禁）。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点全部 locale 无关 / 源码硬编码：
 *  - tab 触发器：CLICK_BTN_IDs.PRICING_BTNS.FIRST_PAGE_*_TAB 落到 <button id>（源码硬编码 track id）。
 *  - Radix tab 内容容器：id 后缀 -content-model / -content-gpu / -content-sandbox（Radix Tabs 生成，稳定）。
 *  - GPU 卡：每卡一张含 <th>Specification 的表（GpuPrice 源码硬编码列名），命中数 == 产品数，是干净的「卡数」锚点；
 *    卡名 <p> 渲染 "1x{productName}"（用 /RTX 4090/ 这类产品名正则，非 i18n）。
 *  - Sandbox 表头 vCPUs / Memory / Storage 是 SandboxPrice 源码内联 JSX 字面量（非 i18n 目录键）。
 *  - 官网外壳区分：断言 `.console-side-navigation` 计数 0（官网用 WebsiteNavbar，非控制台壳）。
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
  // 顶部促销 banner（FirstPage 的 PricingCampaignBanner）
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

test.describe("Pricing（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // installDemoHud 在 mockBackend 之前；DEMO 未置位时 no-op，不影响回归。
    await installDemoHud(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("官网外壳 + 4 个定价 tab 结构渲染，默认 Serverless 选中、未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/pricing");

    // 稳定锚点：默认 model tab 内容容器（RSC initialFullLLMModels 渲染完成的信号），自带重试等待。
    const modelContent = tabContent(page, "model");
    await expect(modelContent).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（/pricing 公开内容，不鉴权） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 官网外壳（非控制台壳）：无 console 侧边导航 ---
    await expect(page.locator(".console-side-navigation")).toHaveCount(0);

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

    // --- 默认 model tab：渲染出表格（结构 / 不白屏；不断言具体值，交给 smoke） ---
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

    await page.goto("/pricing");
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
    // GpuPrice 规格单元格硬编码 "<gpuMemory> GB VRAM"；fixture 4090 显存 24 → "24 GB VRAM"
    // 该文案同时出现在 <md 的 PricingMobileCard（md:hidden）与 ≥md 的桌面表内；
    // 默认 Desktop Chrome 视口下前者隐藏，故锚定桌面 <table>（移动卡无 table），避免命中隐藏节点。
    await expect(
      gpuContent.locator("table").getByText("24 GB VRAM", { exact: false }).first(),
    ).toBeVisible();

    await NO_ERROR_BOUNDARY(page);
  });

  test("切到 Agent Sandbox tab：渲染 sandbox 价格表（vCPUs / Memory / Storage 列），不崩", async ({
    page,
  }) => {
    await page.goto("/pricing");
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

  test("深链 ?gpu=1 直接激活 GPUs tab（useSearchParams 命中分支）", async ({
    page,
  }) => {
    await page.goto("/pricing?gpu=1");

    const gpuContent = tabContent(page, "gpu");
    // 客户端 fetch + GpuPrice 渲染完成信号：第一张卡的 Specification 表头。
    await expect(
      gpuContent.locator("th", { hasText: "Specification" }).first(),
    ).toBeVisible({ timeout: 30_000 });

    // --- 深链命中：GPU tab 选中 + GPU 内容可见（model 不应选中） ---
    await expect(byId(page, TAB_ID.gpu)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(byId(page, TAB_ID.serverless)).toHaveAttribute(
      "aria-selected",
      "false",
    );

    await NO_ERROR_BOUNDARY(page);
  });

  // @demo：带断言 + HUD 的验收录屏（DEMO 未置位 → HUD no-op，即普通 hermetic 回归用例）。
  // 一个叙事走 AC1-AC3（同一页面，无二次导航，checklist 状态不丢）；AC4 由专设深链用例覆盖。
  test("@demo /pricing 定价页验收（结构 + GPU 卡 + Sandbox 表）", async ({
    page,
  }) => {
    await page.goto("/pricing");
    await demoTitle(page, {
      title: "验收：/pricing 定价页 e2e 补全",
      lines: [
        "改动：补全 hermetic e2e（4 tab + 切换 + fixture 数据）",
        "环境：hermetic mock · en · real code",
        "判据：见左下验收清单（AC1-AC3）",
      ],
    });
    await demoChecklist(page, [
      { id: "AC1", label: "4 tab 结构 + 默认 Serverless + 官网壳 + 不崩" },
      { id: "AC2", label: "GPUs tab：4 张卡 + RTX 4090/5090 + 24 GB VRAM" },
      { id: "AC3", label: "Agent Sandbox tab：vCPUs/Memory/Storage 列" },
    ]);

    await test.step("AC1 结构：4 tab + 默认 Serverless + 官网壳 + 不崩", async () => {
      await demoStep(page, {
        n: 1,
        total: 3,
        label: "打开 /pricing",
        expected: "4 tab + 默认 Serverless(model) + 无 console 壳",
      });
      const modelContent = tabContent(page, "model");
      await expect(modelContent).toBeVisible({ timeout: 30_000 });
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.locator(".console-side-navigation")).toHaveCount(0);
      await expect(page.getByRole("tab")).toHaveCount(4);
      await expect(byId(page, TAB_ID.serverless)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(modelContent.locator("table").first()).toBeVisible();
      await demoPass(page, "AC1 结构 OK", "AC1");
    });

    await test.step("AC2 切 GPUs tab：4 张 GPU 卡 + 产品名/显存", async () => {
      await demoStep(page, {
        n: 2,
        total: 3,
        label: "点 GPUs tab",
        expected:
          "4 张 GPU 卡（Specification 表计数==4）+ RTX 4090/5090 + 24 GB VRAM",
      });
      await byId(page, TAB_ID.gpu).click();
      const gpuContent = tabContent(page, "gpu");
      await expect(
        gpuContent.locator("th", { hasText: "Specification" }).first(),
      ).toBeVisible({ timeout: 30_000 });
      await expect(
        gpuContent.locator("th", { hasText: "Specification" }),
      ).toHaveCount(4);
      await expect(gpuContent.getByText(/RTX 4090/).first()).toBeVisible();
      await expect(
        gpuContent.locator("table").getByText("24 GB VRAM", { exact: false }).first(),
      ).toBeVisible();
      await demoPass(page, "AC2 GPU 卡 OK", "AC2");
    });

    await test.step("AC3 切 Agent Sandbox tab：价格表列头", async () => {
      await demoStep(page, {
        n: 3,
        total: 3,
        label: "点 Agent Sandbox tab",
        expected: "vCPUs / Memory / Storage 列头出现",
      });
      await byId(page, TAB_ID.sandbox).click();
      const sbContent = tabContent(page, "sandbox");
      await expect(sbContent).toBeVisible({ timeout: 30_000 });
      await expect(
        sbContent.locator("th", { hasText: "vCPUs" }).first(),
      ).toBeVisible();
      await expect(
        sbContent.locator("th", { hasText: "Memory" }).first(),
      ).toBeVisible();
      await expect(
        sbContent.locator("th", { hasText: "Storage" }).first(),
      ).toBeVisible();
      await demoPass(page, "AC3 Sandbox 表 OK", "AC3");
    });

    await NO_ERROR_BOUNDARY(page);
  });

  test("移动端四个价格 tab 不产生页面级横向滚动 + tab 栏不出现纵向滚动", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pricing");

    await expect(page.locator('[id$="sandbox-tab"]').first()).toBeVisible({
      timeout: 30_000,
    });

    for (const tabSuffix of [
      "serverless-endpoints-tab",
      "dedicated-endpoints-tab",
      "sandbox-tab",
      "gpus-tab",
    ]) {
      await page.locator(`[id$="${tabSuffix}"]`).first().click();
      const hasPageOverflow = await page.evaluate(() => {
        const root = document.scrollingElement;
        if (!root) return false;
        return root.scrollWidth > root.clientWidth + 1;
      });
      expect(hasPageOverflow).toBe(false);

      // tab 栏可横向滚动，但绝不能出现纵向滚动区域：overflow-x:auto 会把 overflow-y 隐式提升为
      // auto，下划线 ::after 溢出 1px 就冒出竖向滚动条。断言计算后的 overflow-y 不是 auto/scroll
      // （用 overflow-y:hidden 兜住）——这正是用户反馈的「上下滚动区域」的可观测属性。
      const tabBarOverflowY = await page.evaluate(() => {
        const list = document.querySelector('[role="tablist"]');
        return list ? getComputedStyle(list).overflowY : "";
      });
      expect(["auto", "scroll"]).not.toContain(tabBarOverflowY);
    }

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
