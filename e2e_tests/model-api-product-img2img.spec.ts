import { test, expect } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/model-api/product/img2img（公开 demo/营销页，无需登录）。
 *
 * 页面类型（读 src 实测确认）：
 *  - app/model-api/product/img2img/page.tsx 是 server component，自身不取数；渲染
 *    Layout_new（Header + MainPage 首屏 + <Case/> + ProductRecommendations + Footer）。
 *  - <Case/>（"use client"）→ CaseWrapper(apiVer="v2") → Img2ImgCase
 *    （components/img2img/Case.tsx），是纯客户端「Try image to image」demo：示例数据全部来自
 *    静态 `defaultCases[FUNC_NAME.IMG2IMG]`（src/app/components/demos/defaultCases.ts，恰 3 条），
 *    挂载时**不发任何数据 XHR**（实测：networkidle 期间拦截到的后端调用 = 0）。
 *    图片生成（Generate）才会发 v2/v3 异步任务请求，且**需登录**（CaseWrapper：userState===logout
 *    直接跳登录），故未登录态的渲染契约里不触发生成、无后端数据依赖 —— mockBackend 默认壳即可，
 *    没有列表端点需要注入（与 gpus.spec.ts 那种客户端取数页不同；此页是「静态 + 交互」demo）。
 *  - 该路由不在 LOGIN_REQUIRED_URL，未登录不会被弹去登录，故不 seedAuth、不 mock /v1/user/info。
 *
 * 断言「牙」从哪来（无 i18n 文案断言）：
 *  - 结构锚点：埋点 id `#btn-product-generate`（CLICK_BTN_IDs.PRODUCT_GEN_BTN_ID，稳定非 i18n）
 *    + 其 `data-gtm-product-name="img2img"`（FUNC_NAME.IMG2IMG，路由身份）；
 *    Start-Creating 链接 href `/models/image#img2img`（首屏 playgroundUrl）、demo 内 Playground 链接
 *    `/models/image#txt2img`、API-Reference 链接 href `…/model-apis-image-to-image`
 *    （均来自 NOVITA_URL/DOCS_URL 常量，非 UI 文案）。
 *  - 确定性数据：`defaultCases[IMG2IMG]` 恰 3 条 → 3 张示例图
 *    `/case/img2img/{ori_1.jpeg, ori_2.png, ori_3.jpeg}` 渲染为 3 个 `.case_item`
 *    （CSS-module 稳定类片段）。这是对源数据有牙的计数断言（变异测试：断 4 即 FAIL，已验证）。
 *  - Dragger（图片上传）的 `input[type=file]` 恰 1 个（img2img demo 比 txt2img 多的上传入口）。
 *
 * 交互覆盖（门禁交互选择 + 为什么不点示例）：
 *  - 门禁交互 = 受控文本框 fill 往返（PromptInput 受控 <textarea value={props.value}>，值原样回显，
 *    且二次改写仍回显）——证明 demo 输入区在 hydration 后可交互、受控状态随输入更新。实测稳定。
 *  - **不**用「点击示例 .case_item → setPrompt(case.prompt) 回显」作门禁交互：示例缩略图的点击在本
 *    widget 上不稳定——真实鼠标点击被 sticky Header（Header_nav_wrapper）的 pointer-events 命中拦截；
 *    改用 dispatchEvent 绕开几何后，回显仍非确定（gated 重试 3/3 仍空，仅偶发成功），根因疑似该区域
 *    onClick 接线随折叠下方 IntersectionObserver 滞后 + ::after 遮罩。属本仓库 demo 控件已知不稳定类
 *    （参 console 「What's New 弹窗拦点击」同源问题）。建议给 .case_item 加 data-testid 并修首点行为后，
 *    再以「示例→表单回显」补强交互（见交付报告 dataTestidSuggestions）。
 *
 * 变异测试说明（assertions have teeth，已实测）：
 *  - 把 case_item 计数断言改成 4（真实 3）→ FAIL；
 *  - 把 data-gtm-product-name 断言改成 "txt2img"（真实 img2img）→ FAIL；
 *  - 把 API-Reference href 改断 text-to-image（真实 image-to-image，count 0）→ FAIL。
 *  此页不消费任何后端列表端点（无数组壳 fixture 可改），故无「把 fixture 改回 {} 看是否 FAIL」的标的；
 *  断言的牙由「与 src 静态数据/常量耦合」的负向控制承担（源数据/常量一改即 FAIL）。
 */

const CASE_IMAGES = [
  "/case/img2img/ori_1.jpeg",
  "/case/img2img/ori_2.png",
  "/case/img2img/ori_3.jpeg",
];

test.describe("Image-to-Image demo page（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 此页无后端数据依赖；默认壳即可（无需注入列表端点）。
    await mockBackend(page, {});
  });

  test("公开 demo 渲染首屏 + 3 张示例 + 上传/生成控件，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/model-api/product/img2img", {
      waitUntil: "domcontentloaded",
    });

    // --- demo 的 Generate 控件挂载（埋点 id，强稳定信号，等客户端 hydration 完成） ---
    const genBtn = page.locator("#btn-product-generate");
    await expect(genBtn).toBeVisible({ timeout: 30_000 });
    // 路由身份：data-gtm-product-name 必须是 img2img（FUNC_NAME.IMG2IMG）
    await expect(genBtn).toHaveAttribute("data-gtm-product-name", "img2img");

    // --- 未被弹去登录（公开页，且未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 首屏 Hero 结构（h1，结构角色不断言文案；此页有多个 h1，断 first 可见） ---
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    // --- 文档/Playground 链接（href 锚点，源自常量、非 i18n 文案） ---
    // 首屏 Start-Creating 链接 → /models/image#img2img（playgroundUrl）
    await expect(
      page.locator('a[href="/models/image#img2img"]').first(),
    ).toBeVisible();
    // demo 文案内 Playground 链接 → /models/image#txt2img（Case.tsx）
    await expect(
      page.locator('a[href="/models/image#txt2img"]').first(),
    ).toBeVisible();
    // API Reference → DOCS_URL.IMG2IMG（…/model-apis-image-to-image）
    await expect(
      page.locator('a[href*="model-apis-image-to-image"]'),
    ).toHaveCount(1);

    // --- 上传入口：Dragger 的 file input（img2img 特有，恰 1 个） ---
    await expect(page.locator('input[type="file"]')).toHaveCount(1);

    // --- prompt 输入区存在（demo 唯一 textbox） ---
    await expect(page.getByRole("textbox").first()).toBeVisible();

    // --- 确定性：恰 3 张示例图 → 3 个示例项（对 defaultCases[IMG2IMG] 计数有牙） ---
    for (const src of CASE_IMAGES) {
      await expect(page.locator(`img[src="${src}"]`)).toHaveCount(1);
    }
    await expect(page.locator('[class*="case_item"]')).toHaveCount(3);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("受控 prompt 输入往返（核心交互）+ 全程不崩不跳登录", async ({
    page,
  }) => {
    await page.goto("/model-api/product/img2img", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    const promptBox = page.getByRole("textbox").first();
    // 初始空（demo 默认未选任何示例）
    await expect(promptBox).toHaveValue("");

    // 受控输入往返：fill 后值原样回显（PromptInput 是受控 <textarea value={props.value}>）
    await promptBox.fill("a serene mountain lake at sunrise, photorealistic");
    await expect(promptBox).toHaveValue(
      "a serene mountain lake at sunrise, photorealistic",
    );

    // 改写再回显，证明受控状态随输入更新（非一次性）
    await promptBox.fill("a cat riding a bicycle in neon city");
    await expect(promptBox).toHaveValue("a cat riding a bicycle in neon city");

    // 交互全程未触发错误边界、未跳登录
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("后端 promotion 取数失败（500）：demo 结构不崩、未弹登录、错误边界不触发", async ({
    page,
  }) => {
    // demo 页结构不依赖任何后端取数；让 /v3/stripe/promotion 返回 500，
    // 验证 hero / 3 张示例 / 上传&输入控件仍渲染，且不触发错误边界。
    // 后注册的 route 在 Playwright 中优先匹配，覆盖 beforeEach 的默认壳。
    await mockBackend(page, {
      failEndpoints: { "/v3/stripe/promotion": 500 },
    });
    await page.goto("/model-api/product/img2img", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('[class*="case_item"]')).toHaveCount(3);
    await expect(page.getByRole("textbox").first()).toBeVisible();
    await expect(page.locator('input[type="file"]')).toHaveCount(1);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
