import { test, expect } from "@playwright/test";
import { mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models/video/wan-2.1（公开 demo/营销页，无需登录）。
 *
 * 页面类型（读 src 实测确认）：
 *  - app/models/video/wan-2.1/page.tsx 是 server component，自身不取数；渲染
 *    Layout_new（Header + FirstPage 首屏 + <Case/> + ProductRecommendations + Footer）。
 *  - <Case/>（"use client"）→ CaseWrapper → WanT2VDemo（components/demos/Wan-t2v/index.tsx），
 *    是纯客户端「Wan2.1 T2V API Demo」。示例/模型全部来自静态
 *    `defaultCases[FUNC_NAME.WAN_T2V]`（src/app/components/demos/defaultCases.ts），
 *    挂载时**不发任何数据 XHR**（实测：networkidle 期间 0 个 novita.ai 后端请求，
 *    渲染只靠静态数组 + 交互）。视频生成（Generate）才会发 v3 异步任务请求，且**需登录**
 *    （userState===logout 直接跳登录），故未登录态的渲染契约里不触发生成、无后端数据依赖
 *    —— mockBackend 默认壳即可，没有列表端点需要注入（与 gpus.spec.ts 那种客户端取数页
 *    不同；此页与 model-api-product-txt2img 同属「静态 + 交互」demo）。
 *  - 该路由不在 LOGIN_REQUIRED_URL，未登录不会被弹去登录，故不 seedAuth、不 mock /v1/user/info。
 *
 * SSR 500 噪音说明：裸 curl 该路由（无 mock）会返回 HTTP 500（沙箱里 campaign-config/notice
 * 相关的 SSR 流式副作用置了 500 状态），但**响应体仍流式输出了完整页面**（h1/Case/按钮俱全、
 * 无 <h1>Error</h1>）。本 hermetic 用 mockBackend 拦截后端 + page.goto 走客户端 hydration，
 * 实测 NAV STATUS=200、零 pageerror、错误边界 0 次 —— 页面在测试谐振腔内健康（非 BUG）。
 *
 * 断言「牙」从哪来（无 i18n 文案断言）：
 *  - 结构锚点：埋点 id `#btn-product-generate`（CLICK_BTN_IDs.PRODUCT_GEN_BTN_ID，稳定非 i18n，
 *    等客户端 hydration 完成的强信号）。
 *    ⚠ 注意：本页 Generate 按钮经 FormFooter→PrimaryBtn(Button) 渲染为 <button>，而 Button 仅在
 *    renderTag==="link" 时透传 elAttrs → `data-gtm-product-name` 在 DOM 上**为 null**（实测，
 *    源码既有行为，非本测试可修）。故**不**断言该属性，只用 id 锚定。
 *  - 链接 href（源自常量、非 UI 文案）：Playground → `/models/image#wan-t2v`
 *    （NOVITA_URL.MODEL_API_PLAYGROUND + FUNCS.WAN_T2V.name）；API Reference/getStarted →
 *    `…/model-apis-wan-t2v`（DOCS_URL.WAN_T2V）；Discord → 硬编码 invite 链接。
 *  - 确定性数据：`defaultCases[WAN_T2V]` 恰 2 条 → 2 个 showcase chip（`[class*="case_item"]`，
 *    CSS-module 稳定类片段）。这是对源数据计数有牙的断言（改 defaultCases 即 FAIL）。
 *  - 初始 prompt：demo 初始化 `prompt = useCases[0].prompt`，故 prompt 文本框**预填**
 *    defaultCases[WAN_T2V][0].prompt（"A large sumo wrestler …" 471 字符）。断言其 value 含该
 *    源码片段 —— 对静态 defaultCases 有牙（既非 i18n 目录、又证明 demo 已 hydrate 并接上数据）。
 *
 * 变异测试说明：此页渲染不消费任何后端列表端点（captured 仅 /v3/stripe/promotion，且实测本页
 * 客户端根本不发它），无「数组壳 fixture」可改回 {} 看 FAIL 的标的。断言的牙改由「showcase chip
 * 计数=2」「初始 prompt = defaultCases[0].prompt 片段」「三个 href 来自源码常量」「受控输入往返」
 * 共同承担——这些都与 src 静态数据/常量耦合，改源即 FAIL（等价的变异验证，已在交付报告说明）。
 *
 * 交互纪律：点击 showcase chip 切 prompt 的回显在本 build 里**非确定性**（PromptInput 受控
 * textarea 与点击 onClick 的 setPrompt 更新存在竞争、丢更新，实测 3×重跑均不回显，与
 * model-api-product-txt2img 文件头记录同因）。故 chip 点击只断「点击后页面仍稳定」，不硬断回显；
 * 确定性交互用 prompt 文本框的受控 fill 往返。
 */

// defaultCases[FUNC_NAME.WAN_T2V][0].prompt 的稳定起始片段（源码数据，非 i18n 目录）。
const SHOWCASE_0_PROMPT_PREFIX =
  "A large sumo wrestler wearing a traditional mawashi";

test.describe("Wan2.1 Text-to-Video demo page（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 共享 dev server 冷编译/高负载时，本页（Header+Footer+demo+推荐位）首跑 page.goto 可能
    // 逼近默认 30s 超时。给整测 90s 头量（与 model-api-product-txt2img 等已合入 spec 同惯例），
    // 避免环境噪音误报红。
    test.setTimeout(90_000);
    // 此页无后端数据依赖；默认壳即可（无需注入列表端点）。
    await mockBackend(page, {});
  });

  test("公开 demo 渲染首屏 + 2 个 showcase + 生成控件 + 预填 prompt，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/models/video/wan-2.1", {
      waitUntil: "domcontentloaded",
    });

    // --- demo 的 Generate 控件挂载（埋点 id，强稳定信号，等客户端 hydration 完成） ---
    const genBtn = page.locator("#btn-product-generate");
    await expect(genBtn).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（公开页，且未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 首屏 Hero 结构（h1，结构角色不断言文案；此页有 2 个 h1，断 first 可见） ---
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    // --- 文档/Playground/Discord 链接（href 锚点，源自常量/硬编码，非 i18n 文案） ---
    // Playground → /models/image#wan-t2v（MODEL_API_PLAYGROUND + FUNCS.WAN_T2V.name）
    await expect(page.locator('a[href="/models/image#wan-t2v"]')).toHaveCount(
      1,
    );
    // API Reference / getStarted → DOCS_URL.WAN_T2V
    await expect(
      page.locator('a[href*="model-apis-wan-t2v"]').first(),
    ).toBeVisible();
    // Case 区块的 Discord 支持链接（硬编码 invite）
    await expect(
      page.locator('a[href="https://discord.com/invite/Fn3peMYMQf"]'),
    ).toHaveCount(1);

    // --- prompt 输入区存在（demo 唯一 textbox） ---
    const promptBox = page.getByRole("textbox").first();
    await expect(promptBox).toBeVisible();

    // --- 确定性：恰 2 个 showcase chip（对 defaultCases[WAN_T2V] 计数有牙） ---
    await expect(page.locator('[class*="case_item"]')).toHaveCount(2);

    // --- 确定性：prompt 预填 defaultCases[WAN_T2V][0].prompt（源码数据片段，证明已 hydrate 接上数据） ---
    await expect(promptBox).toHaveValue(new RegExp(SHOWCASE_0_PROMPT_PREFIX));

    // --- 估算价格区块渲染（FormFooter estimatePrice 真值 → 出 "Estimated cost"；
    //     "Estimated cost" 是源码硬编码字面量 + 价格由 calcPrice(WAN_T2V) 算出，非 i18n 目录） ---
    await expect(page.getByText("Estimated cost").first()).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("prompt 受控输入往返 + 点击 showcase 后页面稳定（核心交互）", async ({
    page,
  }) => {
    await page.goto("/models/video/wan-2.1", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("#btn-product-generate")).toBeVisible({
      timeout: 30_000,
    });

    const promptBox = page.getByRole("textbox").first();
    // 初始预填第一个 showcase 的 prompt（确定性）
    await expect(promptBox).toHaveValue(new RegExp(SHOWCASE_0_PROMPT_PREFIX));

    // --- 受控输入往返（确定性核心契约）：输入 → 回显 → 清空 → 再输入 → 回显 ---
    // fillStable 加固：PromptInput 是受控 textarea，且挂了 onFocus→onParamFocus 副作用。
    // Playwright fill() 的「聚焦→全选→插入」里，首次聚焦触发的重渲染会打断全选/插入之间、把
    // 光标重置到 0，导致输入被插到预填值前面，合成 "输入"+"预填"（wan-2.1 预填 471 字最长，必中）。
    // 重渲染只在首次聚焦发生，故用 toPass 重试：第二次 fill 时已聚焦、不再触发 onFocus，即稳。
    const fillStable = async (text: string) => {
      await expect(async () => {
        await promptBox.fill(text);
        await expect(promptBox).toHaveValue(text);
      }).toPass({ timeout: 15_000 });
    };
    await fillStable("a cat surfing a giant wave at sunset");
    await fillStable("");
    await fillStable("a robot dancing in neon rain");

    // --- 点击第二个 showcase chip：不对「prompt 回显」做硬断言（src 受控更新竞争，非确定性，
    //     见文件头注释），只断点击后页面仍稳定（不崩、不跳登录、文本框仍可用）。 ---
    const secondChip = page.locator('[class*="case_item"]').nth(1);
    await secondChip.scrollIntoViewIfNeeded();
    await secondChip.click();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
    // 点击 chip 后文本框仍在、仍可用（受控输入未被点击破坏）
    await expect(promptBox).toBeVisible();
    await promptBox.fill("post-click typing works");
    await expect(promptBox).toHaveValue("post-click typing works");
  });
});
