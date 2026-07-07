import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/billing/budgets（客户端取数页，"use client" + 挂载后发 XHR）。
 *
 * 不只断言「不白屏」（那由全站 sweep 覆盖），而是断言**确定性行为**：team 账号下渲染
 * 成员预算表、按 fixture 出 4 行、状态/预算类型/金额从 mocked 数据算出、搜索过滤命中、
 * 行展开拉取 API-key 预算、Team Info 抽屉从 mocked 数据出统计；未被弹去登录、不触发错误边界。
 *
 * ── 渲染前提（读 src 实测确认，三态分支见 index.tsx / PermissionWrapper / checkPermission）──
 *  1) seedAuth 注入 token cookie → 客户端挂载 dispatch fetchUserInfo()（XHR，page.route 可拦）
 *     → 注入 billing-budgets-user-info.json。该 fixture teams[] 非空 + teamId 匹配
 *     → userSlice 派生 currentTeam(role=owner)。
 *  2) index.tsx：currentTeam 为 null 时直接渲染「Team Account Required」兜底页（表永不出现）；
 *     非 null 才进入 PermissionWrapper。故必须用「带 teams 的 user-info」才能到达预算表。
 *  3) PermissionWrapper → usePermission → checkPermission(permissionsConfig, ..., currentTeam)：
 *     currentTeam 非 null 时查 state.config.permissionsConfig[role]。
 *     ⚠ RSC 边界：permissionsConfig 只在根 layout 的 SSR 预载态里设置
 *     （getRolePermissionsInServerEnv，服务端 fetch，page.route 拦不到，且无客户端再取）。
 *     实测 :3101 测试后端对 owner 角色返回了完整 billing 权限 → 网关放行、预算表渲染。
 *     这是这层 hermetic 唯一不可 mock 的外部依赖；若测试后端改了默认角色权限，
 *     该网关可能翻成「no permission」块——届时本 spec 会在「表头不可见」处响亮失败（非静默误过）。
 *
 * ── 数据契约（读 src 确认）──
 *  - request() 直接返回 body，故 /v1/user/team/budget-list 的 member_count/budget_count/budgets
 *    为顶层键；4 条 budgets → 表 tbody 4 行。
 *  - 金额：formatAmountWithPrecision = amount/10000 → Intl USD。fixture used="12505000" → $1,250.50；
 *    bob used="6507500" → $650.75（断言含子串，证明金额管线在 mocked 数据上跑通）。
 *  - status / budget_type 原样渲染自 fixture 数据值（非 i18n 目录）：Active / Invite Pending /
 *    Left Team / Unlimited 都是 fixture 数据，可断言。
 *  - 行展开 → getKeyBudgetList 读 body.key_budgets → 注入 billing-budgets-key-budget-list.json。
 *  - Team Info 抽屉 → TeamMemberInfo 用同一 budget-list 的 member_count/budget_count 出统计。
 *
 * ── 选择器纪律（无 i18n 文案断言）──
 *  预算表用「<th>"Budget Type" → xpath ancestor::table」唯一定位（实测命中 1 张，区别于
 *  overview 的余额/账单表）；表头列名是源码硬编码 <TableHead> 字面量（非 i18n 目录）。
 *  其余深度断言锚在 **fixture 数据值**（成员邮箱 / 金额 / status）——最稳。
 *  全页无任何 data-testid（实测），已在交付报告里建议给 src 补（见报告 dataTestidSuggestions）。
 */

const ENDPOINTS = {
  "/v1/user/info": loadFixture("billing-budgets-user-info.json"),
  "/v1/user/team/budget-list": loadFixture("billing-budgets-list.json"),
  "/v1/user/team/key-budget-list": loadFixture(
    "billing-budgets-key-budget-list.json",
  ),
};

/** 预算表唯一定位：<th>"Budget Type" 锚点 → 其祖先 <table>（shadcn th 无 columnheader role）。 */
const budgetsTable = (page: Page) =>
  page
    .locator("th", { hasText: "Budget Type" })
    .first()
    .locator("xpath=ancestor::table[1]");

test.describe("Billing Budgets（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("team 账号渲染预算表：4 行 + 状态/预算类型/金额从 mocked 数据出，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/billing/budgets");

    // 稳定锚点：预算表「Budget Type」表头出现（客户端 fetchUserInfo + 渲染完成），再做断言。
    const table = budgetsTable(page);
    await expect(
      page.locator("th", { hasText: "Budget Type" }).first(),
    ).toBeVisible({ timeout: 30_000 });

    // 未被弹去登录（seedAuth + mocked /v1/user/info 成功 → currentTeam 派生）。
    await expect(page).not.toHaveURL(/\/login/);
    // 没掉进「Team Account Required」兜底页（证明 currentTeam 非 null、走到了真实 UI）。
    await expect(table).toHaveCount(1);

    // 预算表按 fixture 出 4 行（4 条 budgets）。
    await expect(table.locator("tbody tr")).toHaveCount(4);

    // 列结构（硬编码 <TableHead> 字面量，非 i18n）：6 列。
    await expect(table.locator("thead th")).toHaveCount(6);

    // fixture 数据值出现在表里（成员邮箱——非 i18n，最稳的深度锚点）。
    await expect(
      table.getByText("alice.owner@example.com", { exact: true }),
    ).toBeVisible();
    await expect(
      table.getByText("bob.dev@example.com", { exact: true }),
    ).toBeVisible();
    await expect(
      table.getByText("carol.billing@example.com", { exact: true }),
    ).toBeVisible();

    // status 值原样渲染自 fixture（数据值，非 i18n）。
    await expect(
      table.getByText("Active", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      table.getByText("Invite Pending", { exact: true }),
    ).toBeVisible();
    await expect(table.getByText("Left Team", { exact: true })).toBeVisible();

    // 金额管线在 mocked 数据上跑通：used 12505000 → $1,250.50；bob 6507500 → $650.75。
    await expect(table.getByText(/1,250\.50/)).toBeVisible();
    await expect(table.getByText(/650\.75/)).toBeVisible();

    // 关键交互结构：Refresh / Team Info 按钮可见（owner 角色，硬编码字面量作锚点）。
    await expect(page.getByRole("button", { name: "Refresh" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Team Info" })).toBeVisible();

    // 不触发错误边界（src/app/error.tsx → <h1>Error</h1>）。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("搜索框按成员过滤行（客户端 filter，确定性）", async ({ page }) => {
    await page.goto("/billing/budgets");
    const table = budgetsTable(page);
    await expect(table.locator("tbody tr")).toHaveCount(4, { timeout: 30_000 });

    const search = page.getByPlaceholder("Search Member");
    await search.fill("bob");
    // 仅 bob 一条命中（debounce 300ms，toHaveCount 自带重试覆盖）。
    await expect(table.locator("tbody tr")).toHaveCount(1);
    await expect(
      table.getByText("bob.dev@example.com", { exact: true }),
    ).toBeVisible();

    // 清空 → 恢复 4 行。
    await search.fill("");
    await expect(table.locator("tbody tr")).toHaveCount(4);

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("点击成员行展开 → 拉取并渲染该成员的 API-key 预算", async ({ page }) => {
    await page.goto("/billing/budgets");
    const table = budgetsTable(page);
    await expect(table.locator("tbody tr")).toHaveCount(4, { timeout: 30_000 });

    // 展开前：无 key 子表（key 名不在 DOM）。
    await expect(
      page.getByText("E2E Production Key", { exact: true }),
    ).toHaveCount(0);

    // 点 alice 行 → handleRowClick → getKeyBudgetList → 渲染 key 子表。
    await table
      .locator("tbody tr", { hasText: "alice.owner@example.com" })
      .first()
      .click();

    // 子表从 mocked /v1/user/team/key-budget-list 出 key 名（fixture 数据值）。
    await expect(
      page.getByText("E2E Production Key", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("E2E Dev Key", { exact: true })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("Team Info 抽屉从 mocked budget-list 出团队统计", async ({ page }) => {
    await page.goto("/billing/budgets");
    await expect(
      page.locator("th", { hasText: "Budget Type" }).first(),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: "Team Info" }).click();

    // 抽屉打开（Radix dialog role）。
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    // 团队名来自 mocked user-info → currentTeam.name（fixture 数据值）。
    await expect(
      drawer.getByText("E2E Test Team", { exact: true }),
    ).toBeVisible();
    // 团队 ID（fixture 数据值，TeamMemberInfo 渲染 currentTeam.id）。
    await expect(
      drawer.getByText("team-e2e-0001", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
