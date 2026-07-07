import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/model-api/product/inpainting（公开「Try inpainting API demo」营销页）。
 *
 * 页面类型（读 src 确认 —— page.tsx / Case.tsx / CaseWrapper_new / Inpainting.tsx）：
 *  - page.tsx 是 server component，渲染 <Layout_new><Case/>；Case.tsx 是 "use client"，
 *    内含 <CaseWrapper funcInfo={FUNCS.INPAINTING} renderCase={Inpainting}>。
 *    CaseWrapper 不要求登录（useSelectKeys 无 token → apiKey=""，仅生成时才弹登录）→
 *    **公开页，不 seedAuth**。
 *  - rootPage="product" → DemoWrapper withTabs={false} → 表单是单栏 essentialForm，
 *    **没有 playground 的 Essential/Advanced tab**（probe 实测 [id$="-trigger-essential"]=0）。
 *  - 客户端取数：Inpainting 挂载即 getModelDetail(DEFAULT_MODLE_ID) → getModels() →
 *    GET /v3/model（raw fetch，page.route 可拦）。返回 models[0] 后 setCurModel，
 *    ModelSelector 的 [class*="model_name"] 显示该模型 sd_name。这是本 spec 注入 fixture +
 *    断确定性数据值的主场。CaseWrapper 另发 /v3/stripe/promotion（LowBalanceModal 相关）。
 *
 * 断言纪律：**绝不断言 i18n 文案**。锚点全部 locale 无关：
 *  - 结构：埋点 id #btn-product-generate（getGenBtnId("product") 硬编码常量）；
 *    playground 链接 a[href*="#inpainting"]（href = FUNCS.INPAINTING.name，非文案）；
 *    CSS-module 稳定类片段 [class*="model_selector_trigger"] / [class*="demo_form_wrapper"]
 *    / [class*="demo_result_wrapper"] / [class*="image_placeholder"] / [class*="price_info"]。
 *  - 数据：/v3/model fixture 注入的合成 sd_name "e2e-inpainting-fixture-A.safetensors"
 *    （模型文件名占位符，非 i18n 目录键，且刻意区别于两个 DEFAULT_MODEL_NAME，使断言可证伪）。
 *
 * 变异测试（交付前已验证，见报告）：把 /v3/model fixture 改成 {} → getModels 返回 models:[]
 * → getModelDetail 返回 null → ModelSelector 回退到 DEFAULT_MODEL_NAME
 * （"Deliberate_inpainting.safetensors"），合成 sd_name 文本消失、模型弹窗行数归 0
 * → 证明第 4/5 条数据断言有牙；还原后绿。
 */

const ENDPOINTS = {
  "/v3/model": loadFixture("model-api-product-inpainting-v3-model.json"),
  "/v3/stripe/promotion": loadFixture(
    "model-api-product-inpainting-stripe-promotion.json",
  ),
};

/** fixture 注入的模型 sd_name（getModelDetail 映射 model_name = sd_name）。 */
const FIXTURE_MODEL_NAME = "e2e-inpainting-fixture-A.safetensors";
const FIXTURE_MODEL_NAME_B = "e2e-inpainting-fixture-B.safetensors";

const genBtn = (page: Page) => page.locator("#btn-product-generate");
const modelTrigger = (page: Page) =>
  page.locator('[class*="model_selector_trigger"]').first();

test.describe("Inpainting API demo /model-api/product/inpainting（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 公开页：不 seedAuth。客户端 XHR（/v3/model、/v3/stripe/promotion）经 mockBackend 确定性化。
    await mockBackend(page, { endpoints: ENDPOINTS });
  });

  test("公开 demo 页渲染主体结构（标题/playground 链接/上传区/模型选择器/结果占位/生成按钮），未弹登录、不触发错误边界", async ({
    page,
  }) => {
    await page.goto("/model-api/product/inpainting");

    // 挂载信号：产品页 Generate 按钮（埋点 id 稳定），自带重试等待，避免抢跑。
    await expect(genBtn(page)).toBeVisible({ timeout: 30_000 });

    // --- 公开页：未被弹去登录（CaseWrapper 不要求登录，无 token 也能访问 demo） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 结构：标题区的 keywords <h2>（Stable Diffusion API），CSS-module 类锚点（非文案值） ---
    await expect(page.locator('[class*="keywords_h2"]')).toHaveCount(1);

    // --- 结构：跳 playground 的链接（href 锚点 = 功能名常量 #inpainting，locale 无关） ---
    await expect(page.locator('a[href*="#inpainting"]').first()).toBeVisible();

    // --- 结构：DemoWrapper 左表单 / 右结果两栏布局 ---
    await expect(page.locator('[class*="demo_form_wrapper"]')).toHaveCount(1);
    await expect(page.locator('[class*="demo_result_wrapper"]')).toHaveCount(1);

    // --- 结构：上传控件（Dragger 的 file input） ---
    await expect(page.locator('input[type="file"]')).toHaveCount(1);

    // --- 结构：模型选择器触发器可见 ---
    await expect(modelTrigger(page)).toBeVisible();

    // --- 结构：未上传图片时结果区显示大号图片占位（ImagePlaceholder large） ---
    await expect(page.locator('[class*="preview_img_large"]')).toHaveCount(1);

    // --- 结构：估价信息块（price_info 容器，不断其内 i18n/金额文案） ---
    await expect(page.locator('[class*="price_info"]')).toHaveCount(1);

    // --- 分支确认：产品页**不是** playground，不应渲染 Essential/Advanced tab 触发器 ---
    await expect(page.locator('[id$="-trigger-essential"]')).toHaveCount(0);
    await expect(page.locator('[id$="-trigger-advanced"]')).toHaveCount(0);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("挂载即从 /v3/model 取默认模型详情 → 模型选择器显示 fixture 的 sd_name（数据断言，有牙）", async ({
    page,
  }) => {
    const v3ModelReq = page.waitForRequest((req) =>
      req.url().includes("/v3/model"),
    );

    await page.goto("/model-api/product/inpainting");
    await expect(genBtn(page)).toBeVisible({ timeout: 30_000 });

    // 挂载即请求 /v3/model（getModelDetail(DEFAULT_MODLE_ID)）。
    await v3ModelReq;

    // ModelSelector 的 model_name 由 fixture 的 sd_name 决定（getModelDetail
    // 把 model_name 映射为 modelInfo.sd_name）→ 断确定性值（区别于 DEFAULT，可证伪）。
    await expect(page.locator('[class*="model_name"]').first()).toHaveText(
      FIXTURE_MODEL_NAME,
      { timeout: 15_000 },
    );

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("初始无图无 prompt → 产品页 Generate 按钮禁用（表单校验分支）", async ({
    page,
  }) => {
    await page.goto("/model-api/product/inpainting");

    // disabled={!imgSrc || !canGenerate || !prompt} → 初始三者皆假 → 禁用。
    await expect(genBtn(page)).toBeDisabled({ timeout: 30_000 });

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("点模型选择器 → 模型弹窗从 /v3/model 渲染确定性 2 条模型（交互 + 数据断言，有牙）", async ({
    page,
  }) => {
    await page.goto("/model-api/product/inpainting");
    await expect(genBtn(page)).toBeVisible({ timeout: 30_000 });

    // 打开模型列表弹窗（ModelListModal 挂载触发其内部 getModels）。
    await modelTrigger(page).click();

    // 弹窗内 ModelItem（[class*="img_wrap_div"]）= fixture 中 status:1 的 2 条。
    const items = page.locator('[class*="img_wrap_div"]');
    await expect(items).toHaveCount(2, { timeout: 15_000 });

    // 数据：两个模型的 sd_name 文件名按 fixture 渲染（合成占位符，非 i18n）。
    // 作用域限定 ModelItem 内（避免与触发器 model_name span 的 strict-mode 冲突）。
    for (const name of [FIXTURE_MODEL_NAME, FIXTURE_MODEL_NAME_B]) {
      await expect(items.filter({ hasText: name })).toHaveCount(1);
    }

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("后端 /v3/model 返回 500 时页面降级不白屏、不触发错误边界（错误分支）", async ({
    page,
  }) => {
    // 覆盖 beforeEach 的注入：/v3/model 失败，/v3/stripe/promotion 仍正常。
    await mockBackend(page, {
      endpoints: {
        "/v3/stripe/promotion": loadFixture(
          "model-api-product-inpainting-stripe-promotion.json",
        ),
      },
      failEndpoints: { "/v3/model": 500 },
    });

    await page.goto("/model-api/product/inpainting");

    // demo 主体仍挂载（取数失败只是模型详情拿不到，组件有兜底，不应白屏/崩溃）。
    await expect(genBtn(page)).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('[class*="demo_form_wrapper"]')).toHaveCount(1);

    // /v3/model 失败 → getModelDetail 返回 null → 模型选择器回退默认名（非空占位）。
    await expect(page.locator('[class*="model_name"]').first()).not.toBeEmpty({
      timeout: 15_000,
    });

    // 未被弹去登录、不触发错误边界。
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
