import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models/image（Image Models Playground，公开营销页）。
 *
 * 页面类型（读 src 确认）：
 *  - layout.tsx → page.tsx 是 "use client"，外层 PermissionWrapper loginRequired={false}
 *    → **公开页，无需 seedAuth / 不进登录态**（useSelectKeys 无 token → keys=[]、apiKey=""）。
 *  - 数据取数全部在客户端：ContextWrapper 的 getFuncs() 是**纯静态常量**（同步 resolve，
 *    无 XHR）→ 左侧 Nav 的 21 个功能项、默认选中 txt2img、默认模型名均来自 constants/
 *    defaultCases，**初始加载 0 个后端请求**（实测 probe 确认）。
 *  - 唯一的「确定性数据」交互在**模型选择弹窗**：点 ModelSelector 触发器 → ModelListModal
 *    挂载 → getModels() 打 /v3/model → 渲染 ModelItem 列表。这是本 spec 注入 fixture +
 *    断确定性行数的主场（fixture 2 条 status:1 模型 → 2 个 ModelItem）。
 *
 * 断言纪律：**绝不断言 i18n 文案**。锚点全部 locale 无关：
 *  - 结构：埋点 id #btn-playground-generate（CLICK_BTN_IDs，源码硬编码）；
 *    Radix Tabs 触发器 id 后缀 [id$="-trigger-essential|advanced"]（来自 tab key）；
 *    Nav 的 <a href="#txt2img"> 等（href = 功能名常量，非文案）；CSS-module 稳定类片段
 *    [class*="model_selector_trigger"] / [class*="img_wrap_div"]（modelItem）。
 *  - 数据：/v3/model fixture 注入的 sd_name（"AnythingV5_v5PrtRE.safetensors" /
 *    "dreamshaper_8.safetensors"，模型文件名，非 i18n 目录键）。
 *
 * 变异测试（交付前已验证，见报告）：把 /v3/model fixture 改成 {} → 弹窗内 ModelItem 行数
 * 归 0、sd_name 文本消失（getModels 对无 models 数组返回 []，渲染 Empty）→ 证明第 4 条
 * 数据断言有牙；还原后绿。
 */

const ENDPOINTS = {
  "/v3/model": loadFixture("models-image-v3-model.json"),
  "/v3/stripe/promotion": loadFixture("models-image-stripe-promotion.json"),
};

/** /v3/model fixture 里的 2 个模型（status:1，会被 getModels 的 status===1 过滤保留）。 */
const MODEL_SD_NAMES = [
  "AnythingV5_v5PrtRE.safetensors",
  "dreamshaper_8.safetensors",
];

/** Nav 左栏稳定锚点：href = 功能名常量（locale 无关）。 */
const NAV_HREFS = ["#txt2img", "#img2img", "#SDXL", "#txt2video", "#img2video"];

const genBtn = (page: Page) => page.locator("#btn-playground-generate");
const modelTrigger = (page: Page) =>
  page.locator('[class*="model_selector_trigger"]').first();

test.describe("Image Models Playground /models/image（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 公开页：不 seedAuth。客户端 XHR（/v3/model 等）经 mockBackend 确定性化。
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("公开页渲染 playground 主体结构（Nav/模型选择器/表单 tab/生成按钮），未弹登录、不触发错误边界", async ({
    page,
  }) => {
    await page.goto("/models/image");

    // 挂载信号：Generate 按钮（埋点 id 稳定），自带重试等待，避免抢跑。
    await expect(genBtn(page)).toBeVisible({ timeout: 30_000 });

    // --- 公开页：未被弹去登录（loginRequired=false，无 token 也能访问） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 结构：左侧 Nav 的功能项（href 常量，非文案）。共 21 项，抽样断关键项可见 ---
    const navItems = page.locator('nav a[href^="#"]');
    await expect(navItems).toHaveCount(21);
    for (const href of NAV_HREFS) {
      await expect(page.locator(`nav a[href="${href}"]`)).toBeVisible();
    }
    // 默认选中 txt2img（Nav_selected 类落在该 <a>）
    await expect(page.locator('nav a[class*="Nav_selected"]')).toHaveAttribute(
      "href",
      "#txt2img",
    );

    // --- 结构：模型选择器触发器可见（默认模型名来自 defaultCases，非空占位） ---
    await expect(modelTrigger(page)).toBeVisible();

    // --- 结构：表单 Essential / Advanced 两个 Radix tab 触发器存在 ---
    await expect(page.locator('[id$="-trigger-essential"]')).toHaveCount(1);
    await expect(page.locator('[id$="-trigger-advanced"]')).toHaveCount(1);

    // --- 结构：prompt textarea + 估价信息块（Estimated cost 是源码硬编码字面量，
    //     此处用结果区结构而非该文案断言）：结果区初始 4 张 PreviewImage 占位（batch_size=4） ---
    await expect(page.locator('[class*="preview_img_list"] > *')).toHaveCount(
      4,
    );

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("表单 tab 从 Essential 切到 Advanced：内容面板 data-state 翻转（交互分支）", async ({
    page,
  }) => {
    await page.goto("/models/image");
    await expect(genBtn(page)).toBeVisible({ timeout: 30_000 });

    const essentialContent = page.locator('[id$="-content-essential"]');
    const advancedContent = page.locator('[id$="-content-advanced"]');

    // 初始：essential 激活、advanced 未激活
    await expect(essentialContent).toHaveAttribute("data-state", "active");
    await expect(advancedContent).toHaveAttribute("data-state", "inactive");

    // 点 Advanced 触发器
    await page.locator('[id$="-trigger-advanced"]').click();

    // 切换后：advanced 激活
    await expect(advancedContent).toHaveAttribute("data-state", "active");

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("点模型选择器 → 模型弹窗从 /v3/model 渲染确定性 2 条模型（数据断言，有牙）", async ({
    page,
  }) => {
    const v3ModelReq = page.waitForRequest((req) =>
      req.url().includes("/v3/model"),
    );

    await page.goto("/models/image");
    await expect(genBtn(page)).toBeVisible({ timeout: 30_000 });

    // 打开模型列表弹窗
    await modelTrigger(page).click();

    // /v3/model 确实被请求（弹窗挂载触发 getModels）
    await v3ModelReq;

    // 弹窗内 ModelItem（[class*="img_wrap_div"]）= fixture 中 status:1 的 2 条
    const items = page.locator('[class*="img_wrap_div"]');
    await expect(items).toHaveCount(2, { timeout: 15_000 });

    // 数据：两个模型的 sd_name 文件名按 fixture 渲染（非 i18n）。
    // 作用域限定在 ModelItem 内（避免与触发器 label 同名 span 的 strict-mode 冲突）。
    for (const name of MODEL_SD_NAMES) {
      await expect(items.filter({ hasText: name })).toHaveCount(1);
    }

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("无 prompt 时 Generate 按钮禁用（表单校验分支）", async ({ page }) => {
    await page.goto("/models/image");

    // 初始 params.prompt 为空 → Generate 按钮 disabled（实测 disabled 属性存在）
    await expect(genBtn(page)).toBeDisabled({ timeout: 30_000 });

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
