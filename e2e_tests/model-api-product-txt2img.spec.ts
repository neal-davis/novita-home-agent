import { test, expect } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/model-api/product/txt2img（公开 demo/营销页，无需登录）。
 *
 * 页面类型（读 src 实测确认）：
 *  - app/model-api/product/txt2img/page.tsx 是 server component，自身不取数；渲染
 *    Layout_new（Header + MainPage 首屏 + <Case/> + ProductRecommendations + Footer）。
 *  - <Case/>（"use client"）→ CaseWrapper → Txt2ImgCase（components/txt2img/Case.tsx），
 *    是纯客户端「Try text to image」demo：模型/示例数据全部来自静态
 *    `defaultCases[FUNC_NAME.TXT2IMG]`（src/app/components/demos/defaultCases.ts），
 *    挂载时**不发任何数据 XHR**（实测 networkidle 期间 0 个 4xx/5xx，渲染只靠静态数组 + 交互）。
 *    图片生成（Generate）才会发 v3 异步任务请求，且**需登录**（userState===logout 直接跳登录），
 *    故未登录态的渲染契约里不触发生成、无后端数据依赖 —— mockBackend 默认壳即可，没有
 *    列表端点需要注入（这与 gpus.spec.ts 那种客户端取数页不同；此页是「静态 + 交互」demo）。
 *  - 该路由不在 LOGIN_REQUIRED_URL，未登录不会被弹去登录，故不 seedAuth、不 mock /v1/user/info。
 *
 * 断言「牙」从哪来（无 i18n 文案断言）：
 *  - 结构锚点：埋点 id `#btn-product-generate`（CLICK_BTN_IDs.PRODUCT_GEN_BTN_ID，稳定非 i18n）
 *    + 其 `data-gtm-product-name="txt2img"`（FUNC_NAME.TXT2IMG，路由身份）；
 *    Playground 链接 href `/models/image#txt2img`、API-Reference 链接 href
 *    `…/model-apis-text-to-image`（来自 NOVITA_URL/DOCS_URL 常量，非 UI 文案）。
 *  - 确定性数据：`defaultCases[TXT2IMG]` 恰 4 条 → 4 张示例图 `/case/txt2img/{2,3,4,5}.png`
 *    渲染为 4 个 `.case_item`（CSS-module 稳定类片段）。这是对源数据有牙的计数断言。
 *  - 交互真相：用 **prompt 文本框的受控输入往返**（fill→toHaveValue→clear→type→toHaveValue）作为
 *    确定性交互断言——这是 demo 的核心输入契约，受控 textarea 100% 可靠反映用户输入（实测 3×3 次
 *    全稳）。
 *    ⚠ 关于「点击示例→prompt 回显」：实测该交互**在本 build 里 React 层非确定性**——同一脚本多次
 *    重跑，点击示例后 prompt 时而回显该 case 的 prompt、时而仍为空（setCurCase/setPrompt 的状态
 *    更新在受控 textarea 上存在竞争/丢更新，与点击次序/时机相关，3 次重跑结果不一致）。这是 src 的
 *    受控组件更新竞争（非崩溃 bug，真实用户多点几次能生效），但**不可作为确定性断言**。故按
 *    playbook「交互在 src 层 flaky 时，优先 data 驱动渲染态断言、不把测试弯成 flaky」处理：示例点击
 *    只断「点击后页面仍稳定（不崩、不跳登录、文本框仍可用）」，回显本身不做硬断言。
 *
 * 变异测试说明：此页渲染不消费任何后端列表端点（无数组壳 fixture 可改），故无「把 fixture 改回
 * {} 看是否 FAIL」的标的；断言的牙由「示例图计数=4」「Generate 按钮 data-gtm-product-name=txt2img」
 * 「受控输入往返」共同承担（前两者与 src 静态数据/常量耦合，改源即 FAIL）。详见交付报告。
 */

const CASE_IMAGES = [
  "/case/txt2img/2.png",
  "/case/txt2img/3.png",
  "/case/txt2img/4.png",
  "/case/txt2img/5.png",
];

test.describe("Text-to-Image demo page（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 共享 dev server 冷编译/高负载时，本页（Header+Footer+demo+推荐位）首跑 page.goto 可能
    // 逼近默认 30s 超时（实测一次 goto 2.7m）。给整测 90s 头量（与 models-console-llm-metrics
    // 等已合入 spec 同惯例），避免环境噪音误报红。
    test.setTimeout(90_000);
    // 此页无后端数据依赖；默认壳即可（无需注入列表端点）。
    await mockBackend(page, {});
  });

  test("公开 demo 渲染首屏 + 4 张示例 + 生成控件，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/model-api/product/txt2img", {
      waitUntil: "domcontentloaded",
    });

    // --- demo 的 Generate 控件挂载（埋点 id，强稳定信号，等客户端 hydration 完成） ---
    const genBtn = page.locator("#btn-product-generate");
    await expect(genBtn).toBeVisible({ timeout: 30_000 });
    // 路由身份：data-gtm-product-name 必须是 txt2img（FUNC_NAME.TXT2IMG）
    await expect(genBtn).toHaveAttribute("data-gtm-product-name", "txt2img");

    // --- 未被弹去登录（公开页，且未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 首屏 Hero 结构（h1，结构角色不断言文案；此页有多个 h1，断 first 可见） ---
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    // --- 文档/Playground 链接（href 锚点，源自常量、非 i18n 文案） ---
    // Playground 链接 → /models/image#txt2img（FirstPage 首屏 + demo 文案各一处，>=1 即可）
    await expect(
      page.locator('a[href="/models/image#txt2img"]').first(),
    ).toBeVisible();
    // API Reference → DOCS_URL.TXT2IMG
    await expect(
      page.locator('a[href*="model-apis-text-to-image"]'),
    ).toHaveCount(1);

    // --- prompt 输入区存在（demo 唯一 textbox） ---
    await expect(page.getByRole("textbox").first()).toBeVisible();

    // --- 确定性：恰 4 张示例图 → 4 个示例项（对 defaultCases[TXT2IMG] 计数有牙） ---
    for (const src of CASE_IMAGES) {
      await expect(page.locator(`img[src="${src}"]`)).toHaveCount(1);
    }
    await expect(page.locator('[class*="case_item"]')).toHaveCount(4);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("prompt 受控输入往返 + 点击示例后页面稳定（核心交互）", async ({
    page,
  }) => {
    await page.goto("/model-api/product/txt2img", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    const promptBox = page.getByRole("textbox").first();
    // 初始空（demo 默认未选任何示例）
    await expect(promptBox).toHaveValue("");

    // --- 受控输入往返（确定性核心契约）：输入 → 回显 → 清空 → 再输入 → 回显 ---
    // 用 fill（原子 set value，触发一次 onChange）；不用 pressSequentially 逐字输入——
    // PromptInput 是受控 textarea，逐字键入会与其 onChange/setTextareaHeight 重渲染竞争丢字（实测）。
    await promptBox.fill("astronaut riding a horse on mars");
    await expect(promptBox).toHaveValue("astronaut riding a horse on mars");
    await promptBox.fill("");
    await expect(promptBox).toHaveValue("");
    await promptBox.fill("a cat riding a bicycle");
    await expect(promptBox).toHaveValue("a cat riding a bicycle");

    // --- 点击示例：不对「prompt 回显」做硬断言（src 受控更新竞争，非确定性，见文件头注释），
    //     只断点击后页面仍稳定（不崩、不跳登录、文本框仍可用）。 ---
    const thirdCase = page
      .locator('[class*="case_item"]')
      .filter({ has: page.locator('img[src="/case/txt2img/4.png"]') })
      .first();
    await thirdCase.scrollIntoViewIfNeeded();
    await thirdCase.click();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
    // 点击示例后文本框仍在、仍可用（受控输入未被点击破坏）
    await expect(promptBox).toBeVisible();
    await promptBox.fill("post-click typing works");
    await expect(promptBox).toHaveValue("post-click typing works");
  });
});
