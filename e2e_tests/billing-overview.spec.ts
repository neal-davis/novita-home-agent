import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/billing/overview（客户端取数页，"use client" + 挂载后发 XHR）。
 *
 * 这一层不只断言「不白屏」（那由全站 sweep 覆盖），而是断言**确定性行为**：
 * mocked 余额值渲染出来、voucher / monthly-bill 列表按 fixture 行数出行、
 * voucher 摘要算出 valid 计数、未被弹去登录、不触发错误边界。
 *
 * 渲染前提（见 PermissionWrapper / userSlice / usePermission / checkPermission）：
 *  - seedAuth 注入 token cookie → useHeaderAuth 挂载时 dispatch fetchUserInfo()
 *    + fetchBalanceDetail()（客户端 XHR，可被 page.route 拦截）。
 *  - /v1/user/info fixture 带 uuid 但 teams:[] → currentTeam=null → checkPermission()
 *    返回 true（uuid 存在故非 false），PermissionWrapper 渲染账单 UI，
 *    不依赖单独的 permissions-config 端点。
 *
 * 数据契约（读 src + 实测确认）：
 *  - 余额：billingSlice 把 availableBalance / 10000 再 toFixed(4)。
 *    fixture availableBalance="12345600" → 渲染 "$ 1234.5600"（断言含 1234.56）；
 *    cashBalance="11110000" → account balance "$1111.0000"。
 *  - voucher 表默认 slice(0,5)；fixture 给 4 条 → 全部出行（tbody 4 行）。
 *  - voucher 摘要：过滤 status==="valid"（fixture 1 条）→ 渲染 "1 valid" + "$250.0000 available"
 *    （valid 余额合计 2500000/10000）。
 *  - monthly-bill 表默认 "All"；fixture 给 3 条 → tbody 3 行；paid 条带 invoiceUrl → 1 个 Download 链接。
 *
 * 选择器纪律：无 i18n 文案断言。两张表都没有 data-testid；shadcn <th> 不暴露
 * columnheader role（实测 getByRole("columnheader") 命中 0），故用「<th> 文案 + xpath
 * ancestor::table」定位整表再数 tbody 行——表头列名是源码硬编码字面量（非 i18n 目录）。
 * 已在交付报告里建议给 src 补 data-testid（见报告）。
 */

const ENDPOINTS = {
  "/v1/user/info": loadFixture("billing-overview-user-info.json"),
  "/v1/billing/balance/detail": loadFixture(
    "billing-overview-balance-detail.json",
  ),
  "/v1/billing/voucher/list": loadFixture("billing-overview-voucher-list.json"),
  "/v1/billing/monthly/bill": loadFixture("billing-overview-monthly-bill.json"),
  "/v3/stripe/autoRecharge": loadFixture("billing-overview-auto-recharge.json"),
  "/v3/stripe/paymentMethods": loadFixture(
    "billing-overview-payment-methods.json",
  ),
};

/** 整表定位：<th> 文案锚点 → 其祖先 <table>（shadcn th 无 columnheader role，用 xpath）。 */
const tableByHeader = (page: Page, header: string) =>
  page
    .locator("th", { hasText: header })
    .first()
    .locator("xpath=ancestor::table[1]");

test.describe("Billing Overview（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("从 mocked 数据渲染余额 / voucher 表 / 账单表，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/billing/overview");

    // 先等账单表头出现（客户端 fetch + 渲染完成的稳定锚点），再做后续断言，
    // 避免在挂载期 router 二次结算/数据回填前抢跑。
    const billTable = tableByHeader(page, "Billing Period");
    const billHeader = page
      .locator("th", { hasText: "Billing Period" })
      .first();
    await expect(billHeader).toBeVisible({ timeout: 30_000 });

    // --- testFocus 3：未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- testFocus 1：余额区块从 mocked /v1/billing/balance/detail 渲染数值 ---
    await expect(page.getByText(/1234\.56/).first()).toBeVisible();
    await expect(page.getByText(/1111\.00/).first()).toBeVisible();

    // --- testFocus 2a：voucher 表按 fixture 出行（4 条 < slice 上限 5 → 4 行） ---
    const voucherTable = tableByHeader(page, "Effect Date");
    await expect(voucherTable.locator("tbody tr")).toHaveCount(4);
    // 代表性内容：第一条 voucher 名（fixture 合成名，非 i18n）
    await expect(
      voucherTable.getByText("E2E Valid Voucher", { exact: true }),
    ).toBeVisible();

    // --- testFocus 2b：monthly-bill 表按 fixture 出行（3 条 → 3 行） ---
    await expect(billTable.locator("tbody tr")).toHaveCount(3);
    // 仅 paid 条带 invoiceUrl → 恰好 1 个 Download 链接（aria-label 来自 period 拼接）
    await expect(
      billTable.getByRole("link", { name: /Download invoice/ }),
    ).toHaveCount(1);

    // --- testFocus 4：不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("voucher 摘要从 mocked 数据算出 valid 计数与可用余额", async ({
    page,
  }) => {
    await page.goto("/billing/overview");

    // VoucherSummary 过滤 status==="valid"（fixture 1 条）：渲染 "1 valid"（DOM 实为 "1valid"，
    // 故用 /1\s*valid/ 容错空白）+ "$250.0000 available"（valid 余额合计 2500000/10000）。
    await expect(page.getByText(/1\s*valid/).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/250\.00/).first()).toBeVisible();
    // Redeem 按钮（VoucherSummary 渲染成功的稳定结构锚点）
    await expect(
      page.getByRole("button", { name: "Redeem" }).first(),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
