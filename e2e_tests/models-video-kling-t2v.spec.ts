import { test, expect } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models/video/kling-v1.6-t2v（公开 demo/营销页，无需登录）。
 *
 * 页面类型（读 src 实测确认）：
 *  - app/models/video/kling-v1.6-t2v/page.tsx 是同步 server component，自身不取数；渲染
 *    model-api/product/components/Layout_new（Header + MainPage 首屏 + <Case/> +
 *    ProductRecommendations + Footer）。
 *  - <Case/>（"use client"）→ CaseWrapper_new → KlingV16T2v 视频 demo（components/demos/
 *    KlingV16T2v/index.tsx）。这是纯客户端「Try Kling V1.6 T2V」demo：
 *      · 表单初值全部来自静态 `defaultCases[FUNC_NAME.KLING_V1_6_T2V]`（恰 1 条 showcase）。
 *      · prompt / negative_prompt 用 useState(useCases[0].*) **预填**（与 txt2img 起始空不同）。
 *      · 挂载时**不发任何数据 XHR**：useSelectKeys 只读 cookie；未登录 apiKey 为空 →
 *        restoreTask/klingV16T2v 都不触发（实测 networkidle 期间 0 个 4xx/5xx）。
 *      · 视频生成（Generate）才发 v3 异步任务请求，且需登录（userState===logout 直接跳登录）。
 *    ⇒ 未登录态的渲染契约里无后端数据依赖，mockBackend 默认壳即可，无列表端点需注入
 *      （与 gpus.spec.ts 那种客户端取数页不同；此页是「静态 + 交互」demo，同 txt2img 家族）。
 *  - 该路由不在 LOGIN_REQUIRED_URL（src/constants/urls.ts），未登录不会被弹去登录，
 *    故不 seedAuth、不 mock /v1/user/info。
 *
 * 断言「牙」从哪来（无 i18n 文案断言；本仓库 JSX 文案经 i18n 管线，文字断言必碎）：
 *  - 结构锚点：埋点 id `#btn-product-generate`（CLICK_BTN_IDs.PRODUCT_GEN_BTN_ID，稳定非 i18n）；
 *    h1/h2 结构角色计数；prompt/negative 两个 textbox。
 *    注意：FormFooter 的 PrimaryBtn = @/app/components/button/Button，其 `elAttrs`
 *    （data-gtm-product-name）仅在 renderTag==="link" 时透传；此处是默认 button → 该属性
 *    **不渲染**（实测 getAttribute 为 null）。故本页不断言 data-gtm-product-name（这点与
 *    txt2img.spec 不同——那条 demo 走的另一个 Button）。
 *  - 链接 href（源自 DOCS_URL/NOVITA_URL 常量，非 UI 文案）：API Reference →
 *    `…/model-apis-kling-v1.6-t2v`；playground → `/models/image#kling-v1.6-t2v`。
 *  - 确定性数据：`defaultCases[KLING_V1_6_T2V]` 恰 1 条 → 1 个 `.case_item`（CSS-module 稳定类片段）。
 *  - 合成数据值（强锚点，非 i18n、非环境耦合）：prompt textbox 预填
 *    `"A cute dog standing up from a sitting position while wearing sunglasses"`（defaultCases 硬编码值），
 *    negative-prompt textbox 预填 `"low quality"`。改 src 的 defaultCases 即 FAIL（对源数据有牙）。
 *  - 交互真相：用 **prompt 文本框受控输入往返**（fill→toHaveValue→clear→type→toHaveValue）作为
 *    确定性核心交互（受控 textarea 100% 可靠反映输入，已是 txt2img 家族验证过的稳定契约）。
 *    showcase 单条点击只断「点击后页面仍稳定」，不对 prompt 回显做硬断言（src 受控更新在点击路径上
 *    有竞争，见 txt2img.spec 头注；非崩溃 bug，但不可作确定性断言）。
 *
 * 估算价格说明：FormFooter 的「Estimated cost」依赖 calcPrice→modelProductPrice 定价配置；
 * 本 hermetic 环境该值解析为 0/「-」→ `{estimatePrice && ...}` 短路不渲染（实测无 /video 价格行）。
 * 这是环境耦合 + 近似 i18n 文案，故不断言估算价格。
 *
 * 变异测试说明：此页渲染不消费任何后端列表端点（无数组壳 fixture 可改），故无「把 fixture 改回
 * {} 看是否 FAIL」的标的（同 txt2img.spec）；断言的牙改由「case_item 计数=1」「两个 textbox 预填
 * 合成值」「href 常量锚点」承担——这些与 src 静态数据/常量耦合，改源即 FAIL。详见交付报告。
 */

// defaultCases[FUNC_NAME.KLING_V1_6_T2V][0]（src/app/components/demos/defaultCases.ts，硬编码合成值）
const DEFAULT_PROMPT =
  "A cute dog standing up from a sitting position while wearing sunglasses";
const DEFAULT_NEGATIVE_PROMPT = "low quality";

test.describe("Kling V1.6 T2V demo page（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 共享 dev server 冷编译/高负载时，本页（Header+Footer+demo+推荐位）首跑 page.goto 可能
    // 逼近默认 30s 超时。给整测 90s 头量（与 model-api-product-txt2img 等已合入 spec 同惯例）。
    test.setTimeout(90_000);
    // 此页无后端数据依赖；默认壳即可（无需注入列表端点）。
    await mockBackend(page, {});
  });

  test("公开视频 demo 渲染首屏 + showcase + 预填表单 + 生成控件，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/models/video/kling-v1.6-t2v", {
      waitUntil: "domcontentloaded",
    });

    // --- demo 的 Generate 控件挂载（埋点 id，强稳定信号，等客户端 hydration 完成） ---
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    // --- 未被弹去登录（公开页，且未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 首屏 Hero 结构（h1，结构角色不断言文案；此页有 2 个 h1，断 first 可见） ---
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    // --- 文档 / Playground 链接（href 锚点，源自 DOCS_URL/NOVITA_URL 常量，非 i18n 文案） ---
    // API Reference → DOCS_URL.KLING_V1_6_T2V（/docs/api-reference/model-apis-kling-v1.6-t2v）
    await expect(
      page.locator('a[href*="model-apis-kling-v1.6-t2v"]'),
    ).toHaveCount(1);
    // playground 锚链 → /models/image#kling-v1.6-t2v（NOVITA_URL.MODEL_API_PLAYGROUND#funcName）
    await expect(
      page.locator('a[href="/models/image#kling-v1.6-t2v"]'),
    ).toHaveCount(1);

    // --- 确定性：defaultCases[KLING_V1_6_T2V] 恰 1 条 → 1 个 showcase 项（对源数据计数有牙） ---
    await expect(page.locator('[class*="case_item"]')).toHaveCount(1);

    // --- 表单两个文本框存在，且按 defaultCases 预填合成值（强锚点，非 i18n、非环境耦合） ---
    const promptBox = page.getByRole("textbox").first();
    const negativeBox = page.getByRole("textbox").nth(1);
    await expect(promptBox).toBeVisible();
    await expect(promptBox).toHaveValue(DEFAULT_PROMPT);
    await expect(negativeBox).toHaveValue(DEFAULT_NEGATIVE_PROMPT);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("prompt 受控输入往返 + showcase 点击后页面稳定（核心交互）", async ({
    page,
  }) => {
    await page.goto("/models/video/kling-v1.6-t2v", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    const promptBox = page.getByRole("textbox").first();
    // 初始为 defaultCases 预填值
    await expect(promptBox).toHaveValue(DEFAULT_PROMPT);

    // --- 受控输入往返（确定性核心契约）：覆写 → 回显 → 清空 → 再输入 → 回显 ---
    // fillStable 加固：PromptInput 是受控 textarea，且挂了 onFocus→onParamFocus 副作用。
    // Playwright fill() 的「聚焦→全选→插入」里，首次聚焦触发的重渲染会打断全选/插入之间、把
    // 光标重置到 0，导致输入被插到预填值前面，合成 "输入"+"预填"。重渲染只在首次聚焦发生，
    // 故用 toPass 重试：第二次 fill 时已聚焦、不再触发 onFocus，即稳。
    const fillStable = async (text: string) => {
      await expect(async () => {
        await promptBox.fill(text);
        await expect(promptBox).toHaveValue(text);
      }).toPass({ timeout: 15_000 });
    };
    await fillStable("a cyberpunk city at night, neon rain");
    await fillStable("");
    await fillStable("a corgi surfing a wave");

    // --- 点击 showcase 单条：不对 prompt 回显做硬断言（src 受控更新在点击路径竞争，见头注），
    //     只断点击后页面仍稳定（不崩、不跳登录、文本框仍可用）。 ---
    const showcaseItem = page.locator('[class*="case_item"]').first();
    await showcaseItem.scrollIntoViewIfNeeded();
    await showcaseItem.click();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
    // 点击后文本框仍在、仍可用（受控输入未被点击破坏）
    await expect(promptBox).toBeVisible();
    await promptBox.fill("post-click typing works");
    await expect(promptBox).toHaveValue("post-click typing works");
  });
});
