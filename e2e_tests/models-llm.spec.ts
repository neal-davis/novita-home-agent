import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models/llm（营销/公开页 — LLM 模型库，无需登录）。
 *
 * 页面类型（读 src 实测确认 —— 决定 mock 策略）：
 *  - app/models/llm/page.tsx 是 **async server component**：模型列表主数据由
 *    `getFullLLMModels(["chat"], token)` 在**服务端** fetch（→ getModelList → *.novita.ai）。
 *    page.route() **拦不到服务端请求** → hermetic 对模型卡片只断言「结构 + 渲染出卡片 + 不崩」，
 *    **不断言具体卡片数量/价格值**（那是 backend 数据，会随后端漂移；数据正确性的真相源是 smoke 层）。
 *  - 页面唯一的 **客户端 XHR** 是全局 Header 的 GET /v3/stripe/promotion（促销横幅，非本页核心数据）。
 *    实测（无 mock 抓包）客户端只发这一条；故注入其 fixture 让 hermetic 确定性化、不触真实后端。
 *  - /models/llm 不在 LOGIN_REQUIRED_URL，未登录不弹去登录，故**不 seedAuth**。
 *
 * 渲染契约（FeaturedModels + BaseModelCard 实测）：
 *  - FeaturedModels：<h1>Large Language Models</h1> + "Create a New Endpoint" 链接
 *    （href = NOVITA_URL.MODEL_API_CONSOLE_LLM_DE = "/models-console/llm-dedicated-endpoints"，
 *     来自常量、非 i18n）+ `grid …lg:grid-cols-3` 卡片网格，对 modelList.map 渲染 LLMModelCard。
 *  - 每张卡片 = BaseModelCard（default variant）→ <div class="BaseModelCard_container__*">（CSS-module 哈希类）。
 *    网格直接子节点**全部**是卡片 ⇒ 结构不变式：卡片数 === 网格直接子节点数（>0）。
 *  - 页面有 2 个 h1（本页标题 + DeBanner "Dedicated Endpoint"）⇒ 不断言 h1 计数。
 *
 * 选择器纪律：无 i18n 文案断言。结构锚点 = 稳定 class 片段（grid-cols-3 网格容器、
 * BaseModelCard_container 哈希类、create-endpoint 链接的常量 href）；错误边界用 role+exact 字面量。
 * 页面无 data-testid（见交付报告「建议补 data-testid」）。
 */

const PROMOTION = "models-llm-promotion.json";
const ROUTE = "/models/llm";

/** LLM 卡片网格（FeaturedModels：唯一的 lg:grid-cols-3 容器）。 */
const grid = (page: import("@playwright/test").Page) =>
  page.locator(".lg\\:grid-cols-3");
/** 单张 LLM 模型卡片（BaseModelCard default variant 的哈希 container 类）。 */
const cards = (page: import("@playwright/test").Page) =>
  page.locator('[class*="BaseModelCard_container"]');

test.describe("Models LLM marketing page（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackend(page, {
      endpoints: { "/v3/stripe/promotion": loadFixture(PROMOTION) },
    });
  });

  test("RSC 服务端取数渲染 LLM 模型卡片网格 + create-endpoint 入口，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });

    // --- 首屏标题（结构锚点：h1 存在；本页有 2 个 h1，不断言计数/文案）---
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });

    // --- 公开页未被弹去登录（未 seedAuth）---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 卡片网格容器唯一（单一稳定 class 片段锚点）---
    await expect(grid(page)).toHaveCount(1);

    // --- RSC 服务端取数 → 网格出卡片（证明服务端 fetch + modelList.map 渲染链路打通，
    //     而非「页面没崩但网格空着」）。卡片数随后端漂移，故断 >0 不断固定值 ---
    const cardCount = await cards(page).count();
    expect(cardCount).toBeGreaterThan(0);
    await expect(cards(page).first()).toBeVisible();

    // --- 结构不变式（有牙）：网格直接子节点全部是卡片 ⇒ 卡片数 === 网格直接子节点数。
    //     回归若让卡片停渲染 / 非卡片元素漏进网格，此断言 FAIL ---
    const gridChildren = await grid(page).locator("> div").count();
    expect(cardCount).toBe(gridChildren);

    // --- create-endpoint 入口：链接按常量 href 渲染（href 来自 NOVITA_URL，非 i18n 文案）---
    await expect(
      page.locator('a[href*="llm-dedicated-endpoints"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('a[href*="llm-dedicated-endpoints"]'),
    ).toBeVisible();

    // --- 非白屏：主体有实际内容 ---
    expect(
      (await page.locator("body").innerText()).trim().length,
    ).toBeGreaterThan(100);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>）---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("create-endpoint CTA 指向正确常量路由 + 卡片是有内容的真实卡片（非空壳）", async ({
    page,
  }) => {
    // 不做跨路由导航断言（共享 dev server 上跳重型 console/detail 路由编译极慢、不确定，
    // 是环境约束非产品问题，硬等会 flaky）；改断「CTA 的目标 href 精确正确」+「卡片有内容」——
    // 两者都对回归有牙、且零后端数据耦合 / 零慢导航。
    await page.goto(ROUTE, { waitUntil: "domcontentloaded" });

    // --- CTA 是 <a> 且 href 精确等于常量目标（NOVITA_URL.MODEL_API_CONSOLE_LLM_DE）。
    //     若有人改路由常量 / 把 CTA 换成非 <a>，此断言 FAIL ---
    const cta = page.locator('a[href*="llm-dedicated-endpoints"]');
    await expect(cta).toBeVisible({ timeout: 30_000 });
    await expect(cta).toHaveAttribute(
      "href",
      "/models-console/llm-dedicated-endpoints",
    );

    // --- 卡片是「有内容的真实卡片」而非空 div：首张卡片文本非空（模型名 + 价格/参数文本）。
    //     回归若让卡片渲染成空壳，此断言 FAIL ---
    const firstCard = cards(page).first();
    await expect(firstCard).toBeVisible();
    expect((await firstCard.innerText()).trim().length).toBeGreaterThan(0);

    // --- 卡片携带 tag（BaseModelCard 的 <span data-tag>）：data-tag 数 >= 卡片数
    //     （每卡至少一个 tag，如 "LLM"）。证明卡片渲染了 tags footer，非半渲染 ---
    const cardCount = await cards(page).count();
    const tagCount = await page.locator("[data-tag]").count();
    expect(tagCount).toBeGreaterThanOrEqual(cardCount);

    // --- 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
