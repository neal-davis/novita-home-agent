import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/coding-plan（营销定价页，混合取数）。
 *
 * 取数边界（读 src 确认）：
 *  - 页面是 async server component（src/app/coding-plan/page.tsx），服务端 fetch
 *    /v1/product/resource-pack-specs/list + /v1/product/model/list（page.route 拦不到）。
 *    服务端数据喂给 WhyUs(baseModeList)，但 PlanList 的展示数据来自客户端二次取数。
 *  - PlanList("use client") 挂载后客户端 fetch /v1/product/resource-pack-specs/list（XHR，
 *    可被 mockBackend 拦截）→ 这才是确定性数据断言的主场。判分见下方。
 *
 * 渲染前提：
 *  - CodingPlanGuard 客户端读 redux config.codingPlanCampaign 判活动期，过期则 router.replace("/")。
 *    本 dev 环境（:3101）该活动处于活跃期（layout 服务端把 CODING-PLAN 注入 redux 初始态），
 *    故 guard 放行、页面正常渲染——hermetic 不依赖任何 mock 来通过 guard（它是服务端种入的）。
 *  - seedAuth + mocked /v1/user/info（uuid 存在、teams:[]）→ usePermission 返回 true →
 *    PlanList 视作已登录态，Subscribe 点击走 ConfirmSubscriptionModal 而非弹登录。
 *
 * fixture 形状陷阱（实测 + mockBackend 注释印证）：PlanList 消费的列表端点若用兜底
 * { code:0, data:{} }（data 是对象不是数组）会让 allValidInstances.findLast / 通知 forEach
 * 抛错并触发错误边界。故 user/list、subscription/list、notices 全部以「数组壳」显式注入。
 *
 * 数据契约（fixture coding-plan-resource-pack-specs.json）：
 *  - 1 个 spec(Novita Coding) × tierList 3 条(Lite/Pro/Max) → PlanList 渲染 3 张 Item 卡。
 *  - 单价 = discountPrice / 10000：199000→$19.9 / 499000→$49.9 / 1999000→$199.9。
 *  - 折扣标签 src 映射：Pro→"17% discount"、Max→"33% discount"（源码字面量，非 i18n）。
 *  - deductRules[].displayName 喂 Model Access 弹层：含 zai-org/glm-5、moonshotai/kimi-k2.5。
 *
 * 选择器纪律：无 i18n 文案断言。所用文字均为「源码内联字面量」（Subscribe / Model Access /
 * Novita Coding / Terms，均非 t() 目录文案）或「fixture 派生值」（tier 名 / 价格 / 模型名）。
 * 卡片计数锚定结构化 CSS module class [class*="tier_text_content"]，容器锚定 #plans。
 */

const ENDPOINTS = {
  // 客户端 PlanList 消费（也是服务端 RSC 同端点；服务端那次拦不到，断言只针对客户端态）
  "/v1/product/resource-pack-specs/list": loadFixture(
    "coding-plan-resource-pack-specs.json",
  ),
  "/v3/stripe/promotion": loadFixture("coding-plan-stripe-promotion.json"),
  "/v1/user/info": loadFixture("coding-plan-user-info.json"),
  // 数组壳：不注入会因 data:{} 触发错误边界（见上方陷阱说明）
  "/v1/asset/resource-pack/user/list": loadFixture(
    "coding-plan-resource-pack-user-list.json",
  ),
  "/v3/stripe/subscription/list": loadFixture(
    "coding-plan-stripe-subscription-list.json",
  ),
  "/notices": loadFixture("coding-plan-notices.json"),
};

/** 等到客户端 PlanList 完成取数 + 渲染（3 张卡片的稳定结构锚点）。 */
async function waitForPlans(page: Page) {
  await expect(page.locator("#plans")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('[class*="tier_text_content"]')).toHaveCount(3, {
    timeout: 30_000,
  });
}

test.describe("Coding Plan（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("从 mocked 定价数据渲染 3 张方案卡（tier/价格/折扣），未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/coding-plan");
    await waitForPlans(page);

    // --- 未被弹去登录（CodingPlanGuard 放行 + mocked 已登录态） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>）。
    //     注意：列表端点形状错时这里会变 1，是该 spec 的核心回归点。 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);

    // --- FirstPage 标题（服务端 RSC 渲染的源码字面量）---
    await expect(
      page.getByRole("heading", { name: "Novita Coding" }).first(),
    ).toBeVisible();

    // --- 方案卡数量 = fixture tierList 行数（3）。三处结构都应为 3：
    //     tier 名 span / Subscribe 按钮 / Model Access 触发器 ---
    const tierNames = page.locator('[class*="tier_text_content"]');
    await expect(tierNames).toHaveCount(3);
    await expect(tierNames.nth(0)).toHaveText("Lite");
    await expect(tierNames.nth(1)).toHaveText("Pro");
    await expect(tierNames.nth(2)).toHaveText("Max");

    const plans = page.locator("#plans");
    await expect(plans.getByText("Subscribe", { exact: true })).toHaveCount(3);
    await expect(plans.getByText("Model Access", { exact: true })).toHaveCount(
      3,
    );

    // --- 确定性单价（discountPrice/10000），逐张匹配 ---
    await expect(plans.getByText(/^\$19\.9$/)).toHaveCount(1);
    await expect(plans.getByText(/^\$49\.9$/)).toHaveCount(1);
    await expect(plans.getByText(/^\$199\.9$/)).toHaveCount(1);

    // --- 折扣标签（src 映射：Pro 17% / Max 33%）---
    await expect(
      plans.getByText("17% discount", { exact: true }),
    ).toBeVisible();
    await expect(
      plans.getByText("33% discount", { exact: true }),
    ).toBeVisible();
  });

  test("Model Access 弹层从 mocked deductRules 渲染模型名", async ({
    page,
  }) => {
    await page.goto("/coding-plan");
    await waitForPlans(page);

    // 关层时模型名不在 DOM（弹层未挂载）
    await expect(page.getByText("zai-org/glm-5")).toHaveCount(0);

    // hover 第一张卡的 Model Access 触发器 → radix popover 打开 → 渲染 displayName 列表
    await page.getByText("Model Access", { exact: true }).first().hover();

    const popover = page.getByRole("dialog");
    await expect(popover).toBeVisible({ timeout: 10_000 });
    await expect(
      popover.getByText("zai-org/glm-5", { exact: true }),
    ).toBeVisible();
    await expect(
      popover.getByText("moonshotai/kimi-k2.5", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("已登录用户点 Subscribe 打开确认弹窗、不被弹去登录", async ({
    page,
  }) => {
    await page.goto("/coding-plan");
    await waitForPlans(page);

    // 点首张卡 Subscribe（mocked 已登录态 + 有权限 + 首购 → 打开 ConfirmSubscriptionModal）
    await page
      .locator("#plans")
      .getByText("Subscribe", { exact: true })
      .first()
      .click();

    // 确认弹窗（radix dialog）出现，且 URL 未跳登录
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
    await expect(page).not.toHaveURL(/\/login/);

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
