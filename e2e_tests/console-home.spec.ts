import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/console（主控制台首页，"use client" 页，挂载后发 XHR）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 已覆盖），而是断言**确定性行为/结构**：
 * 从 mocked 后端把每个数据块渲染出来——AccountSummary 的余额/voucher/key 计数、
 * Explore 的 4 张 LLM 模型卡 + 4 张 GPU 卡（均按 fixture 数据值断言）、消费图 canvas、
 * 三个产品入口 + featured 入口的稳定 <a id>、未弹登录、不触发错误边界，
 * 且 isQuestionnaire 守卫生效（ACCOUNT SETUP 调研弹窗保持关闭）。
 *
 * 渲染前提（读 src 确认）：
 *  - seedAuth 注入 token cookie → 应用视作已登录会话。
 *  - /v1/user/info fixture：uid+uuid 存在 → 不被弹去 /login；teams:[] → currentTeam=null
 *    →（a）checkPermission(uuid 存在, currentTeam null) 返回 true → useVoucherModal 拉
 *    /v1/billing/voucher/num；（b）非 basic role → ConsumeMonthlyChart 走真实
 *    /v1/user/queryConsumeMonthly 路径（非 blur 的 mock-data 路径）。
 *  - isQuestionnaire:true → CustomerInfo 的 ACCOUNT SETUP 调研 Dialog 保持关闭
 *    （它仅在 isQuestionnaire===false 时打开），页面可交互、内容不被遮挡。
 *
 * 数据契约（读 src + 实测确认）：
 *  - 余额：billingSlice.fetchBalanceDetail 做 Big(availableBalance).div(10000).toFixed(4)。
 *    fixture availableBalance="12345600" → availableCredit "1234.5600" → AccountSummary
 *    渲染 "$1234.5600"。
 *  - voucher 计数：useVoucherModal 把 /v1/billing/voucher/num 的 num 给 AccountSummary，
 *    fixture num=5 → "5"。
 *  - API key 计数：getUserKey() → /v2/user/key 的 keys.length，fixture 3 条 → "3"。
 *  - Explore：getFullLLMModelsWithCache() → /api/llm-models 的 data.slice(0,4) → 4 张
 *    LLMModelCard（卡名为 fixture displayName：GLM 5.2 / Kimi K2.7 Code / MiniMax M3 /
 *    Deepseek V4 Pro，均为公开产品名、非 i18n）；reqMarketProducts() →
 *    /api/v1/market/auth/products 的 products(canBuy).slice(0,4) → 4 张 GPUCard
 *    （RTX 4090 / RTX 5090 / A100 SXM 80GB / H100 SXM 80GB）。
 *  - 消费图：ConsumeMonthlyChart 把 consume_list 喂给 echarts → 渲染 <canvas>。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点全部是 locale 无关的稳定信号——
 *  - 结构：产品/featured 入口的稳定 <a id>（main__console__with__*，源码硬编码 track id，
 *    经 id={config.id} 落到 <a>）；echarts <canvas>；模型卡名 span 的稳定 class 片段
 *    [class*="modelName"]。
 *  - 数据：fixture 注入的纯数据值（余额/计数/模型名/GPU 名），与文案管线无关。
 * AccountSummary 的 .text-[var(--brand-0)] 数值 span 顺序（实测）：
 *   [0]=banner 促销文案, [1]=Credit "$1234.5600", [2]=voucher "5", [3]=key "3"。
 * 已在交付报告里建议给 src 关键块补 data-testid（见报告）。
 */

const ENDPOINTS = {
  "/v1/user/info": loadFixture("console-home-user-info.json"),
  "/v1/billing/balance/detail": loadFixture("console-home-balance-detail.json"),
  "/v2/user/key": loadFixture("console-home-user-key.json"),
  "/v1/billing/voucher/num": loadFixture("console-home-voucher-num.json"),
  "/v1/user/queryConsumeMonthly": loadFixture(
    "console-home-consume-monthly.json",
  ),
  "/api/llm-models": loadFixture("console-home-llm-models.json"),
  "/api/v1/market/auth/products": loadFixture(
    "console-home-market-products.json",
  ),
};

/** 控制台首页里嵌入分析 track id 的稳定结构锚点（源码硬编码，非 i18n）。 */
const ANCHOR = {
  productModelApi: "main__console__with__model-api",
  productSandbox: "main__console__with__sandbox",
  productGpu: "main__console__with__gpu-instance",
  featuredLlmDe: "main__console__featured__llm-dedicated-endpoint",
};

/** fixture 注入的确定性数据值（locale 无关）。 */
const MODEL_NAMES = [
  "GLM 5.2",
  "Kimi K2.7 Code",
  "MiniMax M3",
  "Deepseek V4 Pro",
];
const GPU_NAMES = ["RTX 4090", "RTX 5090", "A100 SXM 80GB", "H100 SXM 80GB"];

const byId = (page: Page, id: string) => page.locator(`[id="${id}"]`);

test.describe("Console Home（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("从 mocked 数据渲染产品入口 + 账户摘要 + Explore 模型/GPU 卡，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/console");

    // 稳定锚点：模型卡名 span（Explore 客户端 fetch + 渲染完成的信号），
    // 自带重试等待，避免在挂载/数据回填前抢跑。
    const modelNameSpans = page.locator('[class*="modelName"]');
    await expect(modelNameSpans).toHaveCount(4, { timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 结构：3 个产品入口 + featured 入口的稳定 <a id> 可见 ---
    await expect(byId(page, ANCHOR.productModelApi)).toBeVisible();
    await expect(byId(page, ANCHOR.productSandbox)).toBeVisible();
    await expect(byId(page, ANCHOR.productGpu)).toBeVisible();
    await expect(byId(page, ANCHOR.featuredLlmDe)).toBeVisible();

    // --- 数据：4 张 LLM 模型卡按 fixture displayName 出名 ---
    for (const name of MODEL_NAMES) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }

    // --- 数据：4 张 GPU 卡按 fixture productName 出名 ---
    for (const name of GPU_NAMES) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }

    // --- 消费图 echarts canvas 渲染（ConsumeMonthlyChart 拿到 consume_list） ---
    await expect(page.locator("canvas").first()).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("AccountSummary 从 mocked 数据算出余额 / voucher / API key 计数", async ({
    page,
  }) => {
    await page.goto("/console");

    // AccountSummary 的数值 span（.text-[var(--brand-0)]）实测顺序：
    // [0]=banner 促销文案, [1]=Credit, [2]=voucher 计数, [3]=key 计数。
    // 等到第 4 个数值出现（key 计数依赖 /v2/user/key 回填）再断言，自带重试。
    const brandValues = page.locator(".text-\\[var\\(--brand-0\\)\\]");
    await expect(brandValues.nth(3)).toBeVisible({ timeout: 30_000 });

    // 余额：availableBalance 12345600 / 10000 → "1234.5600"，渲染 "$1234.5600"
    await expect(brandValues.nth(1)).toHaveText("$1234.5600");
    // voucher 计数：/v1/billing/voucher/num num=5
    await expect(brandValues.nth(2)).toHaveText("5");
    // API key 计数：/v2/user/key keys.length=3
    await expect(brandValues.nth(3)).toHaveText("3");

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("isQuestionnaire:true 时 ACCOUNT SETUP 调研弹窗保持关闭，页面可交互", async ({
    page,
  }) => {
    await page.goto("/console");

    // 等页面主体渲染完成（模型卡名出现）作为稳定锚点
    await expect(page.locator('[class*="modelName"]')).toHaveCount(4, {
      timeout: 30_000,
    });

    // CustomerInfo 的 ACCOUNT SETUP 调研 Dialog 仅在 isQuestionnaire===false 时打开；
    // fixture isQuestionnaire:true → 它必须保持关闭，不遮挡页面。
    // 注：ACCOUNT SETUP 是源码硬编码字面量（非 i18n 目录键），仅用于断言「该弹窗不可见」。
    await expect(page.getByText("ACCOUNT SETUP", { exact: true })).toHaveCount(
      0,
    );

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
