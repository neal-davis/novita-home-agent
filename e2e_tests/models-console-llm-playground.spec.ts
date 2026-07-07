import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models-console/llm-playground（纯客户端 LLM Playground）。
 *
 * page.tsx 仅渲染 <PlaygroundClient/>（"use client"）。模型列表由 useFetchModelList →
 * getFullLLMModelsWithCache(["chat"]) 客户端 fetch 本仓库同源 route handler
 * /api/llm-models?filter=chat（XHR，可被 page.route 拦截）。因此这是
 * mockBackend({ endpoints }) 注入 fixture 的主场，可断言**确定性数据**（下拉选项数/选中模型/tab 分支）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 已覆盖），而是断言确定性行为/结构：
 *  - mocked 模型列表回填后，Playground 三段式布局（Sidebar 配置 + Header 模型选择器/操作 +
 *    MainContent tab/操作）全部渲染；
 *  - 模型下拉按 fixture 行数出选项（3 条）、首个模型自动选中（currentModel=filteredModels[0]）；
 *  - 首个模型 endpoints 含 "completions" → ChatTab 渲染 chat + completion 两个 mode（分支）；
 *  - 空列表（data:[]）→ currentModel=null → 选择器回退占位、布局仍渲染、不崩（空态分支）；
 *  - 未被弹去登录（页面级不强制登录，仅 action 守卫）、不触发错误边界。
 *
 * 渲染前提（读 src 确认）：
 *  - useFetchModelList 只保留 features 含 "serverless" 的模型；fixture 3 条均带该 feature。
 *  - currentModel = filteredModels[0]；fixture 首条为 Deepseek V3.2（endpoints 含 "completions",
 *    isCompletion:true）→ supportsCompletion=true → ChatTab availableModes=[chat, completion]。
 *  - getFullLLMModelsWithCache 对非数组 data 回退 []（src/api/model.ts:442）——故兜底
 *    {code:0,data:{}} 只会让页面进空态而非崩；有数据断言（下拉 3 选项 / 选中 Deepseek V3.2 /
 *    completion tab）即注入 fixture「有牙」的证明：把 fixture 退回 {} 这些断言会 FAIL。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点全部 locale 无关：
 *  - data-driven：模型 displayName（fixture 值，非 i18n）、模型 id chip（fixture 值）、
 *    下拉 role="option" 计数。
 *  - 结构：ChatTab 的 mode 按钮 name 来自 ChatMode 枚举字面量 "chat"/"completion"（源码常量，
 *    非 i18n 目录）；"View Code"/"Model Detail"/"Model Configuration" 为源码硬编码英文字面量。
 * 已在交付报告里建议给 ModelSelector/MainContent 关键节点补 data-testid（见报告）。
 */

const ENDPOINTS = {
  "/api/llm-models": loadFixture("models-console-llm-playground-models.json"),
  // 营销/导航栏的促销端点（capture：valid:false 空促销）——注入避免兜底壳影响导航栏渲染。
  "/v3/stripe/promotion": loadFixture(
    "models-console-llm-playground-promotion.json",
  ),
};

/** fixture 注入的确定性模型（顺序即下拉顺序；首个为选中模型）。 */
const FIRST_MODEL_NAME = "Deepseek V3.2";
const FIRST_MODEL_ID = "deepseek/deepseek-v3.2";
const MODEL_NAMES = ["Deepseek V3.2", "GLM 5.2", "Kimi K2.7 Code"];

/** Playground 加载完成（loading→loaded）的稳定锚点：Header 的 "View Code" 操作按钮。 */
const waitPlaygroundReady = (page: Page) =>
  expect(page.getByRole("button", { name: /View Code/ })).toBeVisible({
    timeout: 30_000,
  });

/** 模型选择器触发器：combobox 且文案为当前选中模型 displayName（fixture 值，非 i18n）。 */
const modelSelectorTrigger = (page: Page) =>
  page.getByRole("combobox").filter({ hasText: FIRST_MODEL_NAME });

test.describe("Models Console · LLM Playground（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("从 mocked 模型列表渲染 Playground 三段布局 + 选中首个模型，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/models-console/llm-playground");

    // 等模型回填、布局渲染完成（自带重试，避免在 loading→loaded 前抢跑）。
    await waitPlaygroundReady(page);

    // --- 页面级不强制登录（仅 action 守卫）：未被弹去 /login ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- Header：模型选择器触发器显示首个模型 displayName（currentModel=filteredModels[0]） ---
    await expect(modelSelectorTrigger(page)).toBeVisible();
    // --- Header：模型 id chip（currentModel.id，fixture 值） + 操作按钮（源码硬编码字面量） ---
    await expect(
      page.getByText(FIRST_MODEL_ID, { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Model Detail/ }),
    ).toBeVisible();

    // --- Sidebar：模型配置面板渲染（"Model Configuration" 为源码硬编码字面量，非 i18n） ---
    await expect(
      page.getByText("Model Configuration", { exact: true }),
    ).toBeVisible();

    // --- MainContent：折叠侧栏 + 清空历史按钮（aria-label 源码硬编码，locale 无关） ---
    await expect(
      page.getByRole("button", { name: "Collapse sidebar" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Clear history" }),
    ).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("模型下拉按 fixture 出 3 个选项；首个模型支持 completion → ChatTab 出 chat+completion 两 tab", async ({
    page,
  }) => {
    await page.goto("/models-console/llm-playground");
    await waitPlaygroundReady(page);

    // --- 分支：首个模型 endpoints 含 "completions" → ChatTab availableModes=[chat, completion]。
    //     mode 按钮 name 来自 ChatMode 枚举字面量（源码常量，非 i18n 目录）。 ---
    await expect(
      page.getByRole("button", { name: "chat", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "completion", exact: true }),
    ).toBeVisible();

    // --- 数据：打开模型选择器下拉 → role="option" 行数 == fixture 模型数（3），按 fixture 顺序出名 ---
    await modelSelectorTrigger(page).first().click();
    const options = page.getByRole("option");
    await expect(options).toHaveCount(3);
    for (const name of MODEL_NAMES) {
      await expect(options.filter({ hasText: name })).toHaveCount(1);
    }

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空模型列表（data:[]）→ 选择器回退占位、布局仍渲染、不崩（空态分支）", async ({
    page,
  }) => {
    // 覆盖兜底/空响应分支：getFullLLMModelsWithCache 对空数组 → modelList=[] → currentModel=null。
    await mockBackend(page, {
      endpoints: {
        "/api/llm-models": loadFixture(
          "models-console-llm-playground-models-empty.json",
        ),
        "/v3/stripe/promotion": loadFixture(
          "models-console-llm-playground-promotion.json",
        ),
      },
    });

    await page.goto("/models-console/llm-playground");

    // 空列表也应离开 loading 并渲染布局（"Model Configuration" 锚点）——不应卡在 "Loading models..."。
    await expect(
      page.getByText("Model Configuration", { exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    // currentModel=null → 选择器回退占位（placeholder="Please select a model"，源码硬编码字面量）。
    await expect(
      page.getByText("Please select a model", { exact: false }).first(),
    ).toBeVisible();

    // Chat mode 始终可用 → "chat" tab 仍渲染（completion 仅在模型支持时出现，此处可有可无）。
    await expect(
      page.getByRole("button", { name: "chat", exact: true }),
    ).toBeVisible();

    // 空数组不应触错误边界（非数组兜底也会回退 [] → 同样不崩）。
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
