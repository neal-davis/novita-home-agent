import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/billing。
 *
 * 这条路由是**已废弃**的 GPU-console 账单页：src/app/gpus-console/billing/page.tsx
 * 把 <Section />（旧 BillingTable）注释掉了，只剩 Header+Footer 壳子，而且这个壳子
 * 永远到不了——middleware 的 urlMap（src/urlRedirect.ts:89 "/gpus-console/billing"
 * → NOVITA_URL.BILLING_DETAILS）在 GET 时就发 **308 重定向**到 /billing/details
 * （regexMap 应用，见 src/middleware.ts:381+；EN 默认无 locale 前缀，query 透传）。
 *
 * 所以本路由真正可断言的「行为」= 重定向到 /billing/details + 落地页干净渲染。
 * 深度断言（不只是「不白屏」）：
 *  ① 服务端 308 把 /gpus-console/billing 落到 /billing/details（确定性，与登录态无关）。
 *  ② 未被弹去登录（seedAuth + mocked /v1/user/info 成功）。
 *  ③ 不触发错误边界（src/app/error.tsx → <h1>Error</h1>）。
 *  ④ 落地页 = billing-details 的 DetailContent 结构：CategoryTabs 卡片、role="status"
 *     说明条、shadcn Tabs 的 tablist（8 个产品 tab）+ tabpanel。默认 "summary" tab 的
 *     SummaryTable 在 bill/list 为空时出 NoData 空态。
 *
 * 关键 mock-shape 教训（非 src bug，是 fixture 形状）：落地页 Header 子树 + SummaryTable
 * 对几个端点有「数组/特定形状」预期，mockBackend 兜底 {code:0,data:{}} 撑不起：
 *  - /v1/billing/bill/list 必须 {bills:[]}（request() 不解包 .data；res.bills undefined
 *    → billList.length 崩错误边界，实测 SummaryTable.tsx:332）。
 *  - /api/v1/notices 必须 {data:[]}（VoucherNotification 做 (res?.data||[]).forEach）。
 * 这些是登录态落地页能干净渲染的前提，故显式注入，不靠兜底。
 *
 * 选择器纪律：无 i18n 文案断言。用 role="tablist"/"tabpanel"/"status"（shadcn Tabs /
 * 源码硬编码 role 属性，非 i18n 目录）。tab 文案是源码字面量但仍不断言其文字。
 */

const ENDPOINTS = {
  // 本路由抓取到的唯一端点（console Header 的 fetchUserDiscount）
  "/v3/stripe/promotion": loadFixture("gpus-console-billing-promotion.json"),
  // 让会话进登录态（teams:[] → checkPermission()=true，PermissionWrapper 放行）
  "/v1/user/info": loadFixture("billing-overview-user-info.json"),
  "/v1/billing/balance/detail": loadFixture(
    "billing-overview-balance-detail.json",
  ),
  // 落地页 billing-details 默认 summary tab 的数据源（空 → NoData 空态）
  "/v1/billing/bill/list": loadFixture("gpus-console-billing-bill-list.json"),
  // 落地页 Header 子树（VoucherNotification）的通知端点，数组形状避免 forEach 崩
  "/v1/notices": loadFixture("gpus-console-billing-notices.json"),
};

test.describe("GPU Console Billing 重定向（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("308 重定向到 /billing/details，落地页干净渲染、未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/gpus-console/billing");

    // --- ① 服务端 308：最终落在 /billing/details（与登录态无关的确定性重定向）---
    await expect(page).toHaveURL(/\/billing\/details$/, { timeout: 30_000 });

    // --- ④ 落地页结构：等 billing-details 的 DetailContent 客户端挂载完成的稳定锚点 ---
    // shadcn TabsList 渲染 role="tablist"；落地干净时恰好 1 个（DetailContent 主 Tabs）。
    const tablist = page.getByRole("tablist");
    await expect(tablist.first()).toBeVisible({ timeout: 30_000 });

    // --- ② 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- ③ 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);

    // --- ④ DetailContent 结构断言（非 i18n 文案）---
    // 产品维度 8 个 tab（summary/llm/llm-de/gen_api/gpu/serverless/cloud_storage/sandbox…）
    await expect(page.getByRole("tab")).toHaveCount(8);
    // 默认选中的 tab 对应 1 个 tabpanel
    await expect(page.getByRole("tabpanel")).toHaveCount(1);
    // 顶部 OnDemand/Monthly 说明条（源码硬编码 role="status"）
    await expect(page.locator('[role="status"]').first()).toBeVisible();
  });

  test("落地页默认 summary tab 在空 bill/list 下不崩、保留结构", async ({
    page,
  }) => {
    await page.goto("/gpus-console/billing");

    // 落地 + 结构就绪
    await expect(page).toHaveURL(/\/billing\/details$/, { timeout: 30_000 });
    const summaryTabpanel = page.getByRole("tabpanel");
    await expect(summaryTabpanel).toBeVisible({ timeout: 30_000 });

    // 默认 summary tab 处于选中态（aria-selected），是稳定的非文案锚点
    await expect(page.getByRole("tab", { selected: true })).toHaveCount(1);

    // 空数据：SummaryTable 渲染 NoData 空态而非崩溃。用 tabpanel 内有「表或空态」
    // 二选一可见来兜稳定性（不依赖 i18n 文案）。
    const tableOrEmpty = summaryTabpanel.locator("table, [class*='table']");
    await expect(tableOrEmpty.first()).toBeVisible();

    // 不触发错误边界
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
