import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models-console/metrics/usage（Model API Usage 仪表盘）。
 *
 * 页面类型：纯客户端取数（UsageDashboard 是 "use client"，挂载后并发 5 个 XHR
 * 到 /v1/billing/model-api/usage/{scopes,summary,cost-trend,model-ranks,key-ranks}）。
 * 故 mockBackend({ endpoints }) 注入 fixture 后可断言**确定性数据**（汇总卡数值、
 * 表格行数与单元格、图表/图例、配额卡数值），并覆盖两条交互分支（排序 refetch、
 * 切换 scope 显隐 Quota 卡）。
 *
 * 鉴权前提：该路由在 LOGIN_REQUIRED_URL 内；seedAuth 注入 token cookie +
 * mock /v1/user/info 成功，避免 ConsoleHeaderWrapper 的用户信息请求 401→logout 重定向。
 * 注：src/api/api.ts 的 request() **不解包 data**，仅在 res.code>=400 时 reject，
 * 故 fixture 必须是后端原始响应形状（{scopes:[...]}/{models:[...]}），无 code 字段即视为成功。
 *
 * 数据契约（读 usageData.ts transform + 实测确认，值均 locale 无关）：
 *  - 汇总（transformSummary + formatUsageNumber，≥1e3→K / ≥1e6→M）：
 *    totalRequests 125000→"125.0K"；Input 显示 input+cache=45M+5M=50M→"50.0M"；
 *    cacheTokens 5M→"5.0M"；outputTokens 12M→"12.0M"。
 *  - 模型排行（transformModelRanks，cost 经 /10000）：3 行；行名（monoTag）为 fixture
 *    modelName（公开模型 slug，非 PII/i18n）：zai-org/glm-4.6、moonshotai/kimi-k2、deepseek/deepseek-v3。
 *  - 密钥排行（transformKeyRanks）：2 行；行名为脱敏占位 e2e-key-alpha / e2e-key-beta。
 *  - 成本趋势：cost-trend 注入（spec 内按当前 UTC 日动态生成时间桶，规避 7d 窗口过滤的
 *    日期脆性）→ <svg> + 3 个图例（glm/kimi/Others）。
 *  - 配额卡（member scope，normalizeBudgetAmount=dealMoneyWithPrecision(v,1,4)=v/10000）：
 *    used 1250000→"$125.0000"、limit 5000000→"$500.0000"、percent 25.0%、Recurring/Monthly 标签。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点全是稳定 class 片段（page.module.scss 的
 * .metricValue/.monoTag/.budgetUsed 等局部 class，编译后带 hash 但保留可读片段）、
 * 源码硬编码的 <th> 字面量（"Model"/"Key Name"——非 i18n 目录），及 fixture 注入的纯数据值。
 * 全站有 5 个 footer SEO 表，故用 <th> 文案 + monoTag 双谓词把 usage 表与之隔离。
 * 已在交付报告建议给 src 关键块补 data-testid（见报告）。
 */

const ENDPOINTS = {
  "/v1/user/info": loadFixture("models-console-metrics-usage-user-info.json"),
  "/v1/billing/model-api/usage/scopes": loadFixture(
    "models-console-metrics-usage-scopes.json",
  ),
  "/v1/billing/model-api/usage/summary": loadFixture(
    "models-console-metrics-usage-summary.json",
  ),
  "/v1/billing/model-api/usage/model-ranks": loadFixture(
    "models-console-metrics-usage-model-ranks.json",
  ),
  "/v1/billing/model-api/usage/key-ranks": loadFixture(
    "models-console-metrics-usage-key-ranks.json",
  ),
  "/v1/user/team/budget-list": loadFixture(
    "models-console-metrics-usage-budget-list.json",
  ),
};

/**
 * cost-trend 按当前 UTC 日动态生成（最近 3 天），让时间桶必落在默认 7d 窗口内，
 * 避免 transformCostTrend 的范围过滤随"今天"漂移导致图表偶发空态。
 */
function buildCostTrend() {
  const dayMs = 86_400_000;
  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  const sec = (offsetDays: number) =>
    String(Math.floor((base.getTime() - offsetDays * dayMs) / 1000));
  return {
    points: [3, 2, 1].map((off) => ({
      bucketStartTime: sec(off),
      models: [
        { modelId: "model-glm", modelName: "zai-org/glm-4.6", cost: "1500000" },
        {
          modelId: "model-kimi",
          modelName: "moonshotai/kimi-k2",
          cost: "800000",
        },
      ],
      othersCost: "100000",
      totalCost: "2400000",
    })),
    meta: { isLive: false, currency: "USD", granularity: "Daily" },
  };
}

/** 模型排行表：<th>"Model" + 含 monoTag 单元格（与 5 个 footer 表区分）。 */
const modelTable = (page: Page) =>
  page
    .locator("table", { has: page.locator("th", { hasText: "Model" }) })
    .filter({ has: page.locator('[class*="monoTag"]') });

/** 密钥排行表：<th>"Key Name" 唯一命中。 */
const keyTable = (page: Page) =>
  page.locator("table", { has: page.locator("th", { hasText: "Key Name" }) });

async function gotoUsage(page: Page) {
  await seedAuth(page);
  await mockBackend(page, {
    endpoints: {
      ...ENDPOINTS,
      "/v1/billing/model-api/usage/cost-trend": buildCostTrend(),
    },
  });
  await page.goto("/models-console/metrics/usage");
}

test.describe("Model API Usage（hermetic）", () => {
  test("从 mocked 数据渲染汇总卡 / 模型表 / 密钥表 / 成本图，未弹登录、不崩", async ({
    page,
  }) => {
    await gotoUsage(page);

    // 稳定锚点：4 张汇总卡的数值（客户端 fetch+渲染完成信号），自带重试。
    const metricValues = page.locator('[class*="metricValue"]');
    await expect(metricValues).toHaveCount(4, { timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 汇总卡确定性数值（formatUsageNumber） ---
    await expect(metricValues.nth(0)).toHaveText("125.0K"); // Total Requests
    await expect(metricValues.nth(1)).toHaveText("50.0M"); // Input incl. cache (45M+5M)
    await expect(metricValues.nth(2)).toHaveText("5.0M"); // Cache Tokens
    await expect(metricValues.nth(3)).toHaveText("12.0M"); // Output Tokens

    // --- 模型排行表：3 行 + 行名（monoTag）为 fixture 模型 slug ---
    await expect(modelTable(page).locator("tbody tr")).toHaveCount(3);
    for (const name of [
      "zai-org/glm-4.6",
      "moonshotai/kimi-k2",
      "deepseek/deepseek-v3",
    ]) {
      await expect(
        modelTable(page).getByText(name, { exact: true }),
      ).toBeVisible();
    }

    // --- 密钥排行表：2 行 + 行名为脱敏占位 ---
    await expect(keyTable(page).locator("tbody tr")).toHaveCount(2);
    await expect(
      keyTable(page).getByText("e2e-key-alpha", { exact: true }),
    ).toBeVisible();
    await expect(
      keyTable(page).getByText("e2e-key-beta", { exact: true }),
    ).toBeVisible();

    // --- 成本趋势图：SVG 渲染 + 图例（glm/kimi/Others，3 个 dataset） ---
    await expect(
      page.locator('[class*="chartArea"] svg').first(),
    ).toBeVisible();
    await expect(page.locator('[class*="legendItem"]')).toHaveCount(3);

    // --- 默认 team scope：scope 按钮显示 fixture team 名（纯数据，非 i18n） ---
    await expect(page.locator('[class*="scopeButton"]').first()).toHaveText(
      "E2E Team",
    );

    // --- team scope 下 Quota 卡不渲染（showQuota = scope.type !== "team"） ---
    await expect(page.locator('[class*="budgetCard"]')).toHaveCount(0);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("点击 Cost 列排序触发 model-ranks 携 sort 参数重新取数", async ({
    page,
  }) => {
    await gotoUsage(page);

    // 等模型表出现（首屏取数完成）
    await expect(modelTable(page).locator("tbody tr")).toHaveCount(3, {
      timeout: 30_000,
    });

    // 点击模型表 "Cost (USD)" 排序按钮 → toggleModelSort 首次置 desc(2)+field cost(1)，
    // useModelAPIUsage 因 modelSort 变化重新请求 model-ranks。等待该带 sort 的请求。
    const sortedReq = page.waitForRequest(
      (req) =>
        req.url().includes("/v1/billing/model-api/usage/model-ranks") &&
        req.url().includes("sort.field=1") &&
        req.url().includes("sort.direction=2"),
      { timeout: 15_000 },
    );

    await page
      .locator('[class*="sortButton"]', { hasText: "Cost (USD)" })
      .first()
      .click();

    await sortedReq; // 断言：排序交互确实触发了带 sort 参数的后端取数

    // 重新取数后表格仍渲染 3 行、不崩
    await expect(modelTable(page).locator("tbody tr")).toHaveCount(3);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("切换 scope 到 member 显示 Quota 卡并按 budget-list 算出额度数值", async ({
    page,
  }) => {
    await gotoUsage(page);

    // 等首屏渲染完成（scope 按钮出现），默认 team scope 无 Quota 卡
    await expect(page.locator('[class*="scopeButton"]').first()).toHaveText(
      "E2E Team",
      { timeout: 30_000 },
    );
    await expect(page.locator('[class*="budgetCard"]')).toHaveCount(0);

    // 打开 scope 下拉 → 选第一个 member（fixture: Member One）
    await page.locator('[class*="scopeButton"]').first().click();
    const memberItem = page.locator('[class*="scopeMemberItem"]').first();
    await expect(memberItem).toBeVisible();
    await memberItem.click();

    // 切到 member scope（scope.type !== "team"）→ Quota 卡出现，
    // getBudgetList → budget-list fixture → member-e2e-001 命中 →
    // used 1250000/10000=$125.0000、limit 5000000/10000=$500.0000、25.0%。
    await expect(page.locator('[class*="budgetCard"]')).toHaveCount(1);
    await expect(page.locator('[class*="budgetUsed"]').first()).toHaveText(
      "$125.0000",
    );
    await expect(page.locator('[class*="budgetTotal"]').first()).toHaveText(
      "$500.0000",
    );
    await expect(page.locator('[class*="budgetPercent"]').first()).toHaveText(
      "25.0%",
    );

    // scope 按钮标签切到 member 名（纯数据）
    await expect(page.locator('[class*="scopeButton"]').first()).toHaveText(
      "Member One",
    );

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
