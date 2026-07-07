import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models/voices（公开 demo/营销页 "AI Text to Speech"，无需登录）。
 *
 * 页面类型（读 src + :3101 实测确认）：
 *  - app/models/voices/page.tsx 是 server component，自身不取数；渲染
 *    Header + Playground（TTS demo）+ VoiceLibrary + KeyFeature + UsageExample +
 *    SupportLanguage + QAndA + FooterBanner + Footer。
 *  - Playground / VoiceLibrary / UsageExample 全是 "use client"，数据**全部来自静态
 *    getData()/getLanguageData() 数组**（src 注释明确：必须是函数，i18n loader 把字面量包进 __t()）。
 *    挂载时**不发任何数据 XHR**（实测 networkidle 期间仅静态资源 + 1 个 footer-banner
 *    全局 /v3/stripe/promotion；captured 也只抓到该端点）。视频/语音生成（Playground 的
 *    Generate 按钮）才会发 v3 异步任务请求且**需登录**，故未登录态渲染契约无后端数据依赖
 *    —— 与 models-video/wan-2.1、model-api-product-* 同属「静态 + 交互」demo，无列表端点需注入。
 *  - 该路由不在 LOGIN_REQUIRED_URL，未登录不会被弹去登录，故不 seedAuth、不 mock /v1/user/info。
 *    （注入 models-voices-stripe-promotion.json 只是把全局 footer 促销 XHR 也确定化，与页面主体无关。）
 *
 * 断言「牙」从哪来（**无 i18n 文案断言**——本仓库 JSX 文案经 i18n EN/ZH 构建变体，文字必碎）：
 *  - 结构锚点：CSS-module 稳定类片段（`Playground_*` / `VoiceLibrary_*` / `UsageExample_*` /
 *    `SupportLanguage_*`，hash 后缀随 build 变，用 [class*="前缀__"] 子串匹配）+ 结构角色（h1/h3 计数）。
 *  - 确定性计数（对静态 getData 数组有牙，改源即 FAIL）：4 个 voice item、3 个 language item
 *    （1 个 active）、6 个 VoiceLibrary 卡、3 个 UsageExample 卖点、3 个 SupportLanguage 国旗项、
 *    11 个 <audio>（4 playground 试听 + 6 library + 1 playground 输出）。
 *  - 链接 href（源自常量、非 UI 文案）：API Reference / Explore Documentation →
 *    DOCS_URL.TXT2SPEECH = `/docs/api-reference/model-apis-text-to-speech`；Discord → 硬编码 invite。
 *  - 初始受控值：textarea 预填 getLanguageData()[0].default（英文 "Hey there, how's it going…"，
 *    源码静态数据片段、非 i18n 目录，证明 demo 已 hydrate 并接上数据）。
 *  - 字数上限字面量 `/ 500`（Limit 常量，硬编码，非 i18n）。
 *  - **确定性交互**：textarea 的受控 fill 往返（原子 set value→onChange→回显；清空→回显；再输入→回显）。
 *
 * 交互非确定性说明（实测 + MEMORY 记录，故**不**硬断这些）：
 *  - 点击 language item 切换 → textarea 文本应变为该语言 default、active class 应移动：本 build 里
 *    setText/setVoiceItem 这类 setState 更新与受控 textarea 重渲染 + useEffect([text,voiceItem,language])
 *    存在竞争、丢更新（实测多次：点 Chinese 后 textarea 仍英文、active class 不移动）。
 *  - 点击 voice item → item_active 移动：同因，实测点 Emily 后 active 仍 Sarah（竞争丢更新）。
 *  - 字数计数 `{text.length}` 的**数值**：fill 后 DOM value 正确（toHaveValue 可断），但渲染的
 *    text.length 计数滞后（实测 fill 5 字后计数显示 117）——故只断 `/ 500` 字面量、不断具体数字。
 *  - Generate 点击 → 未登录 router.push 到 /user/login：实测点击落地（元素可点、无遮挡）但既不发
 *    txt2SpeechFetch、也不跳转（router.push 在测试谐振腔/redux user.state=initializing 下不可观测）。
 *    这是「与 models-video/wan-2.1 一致」的 generate/login 路径，未登录态渲染契约里不触发、不断言。
 *    ⇒ 非 BUG（prod 行为可能不同；redux user.state 异步初始化），只是 hermetic 不可靠观测，跳过。
 *
 * 变异测试说明：此页渲染**不消费任何后端列表端点**，无「数组壳 fixture」可改回 {} 看 FAIL 的标的
 *  （与 wan-2.1 同）。断言的牙改由「静态数组计数（voice=4/lang=3/library=6/usage=3/audio=11）」
 *  「初始 prompt = getLanguageData()[0].default 片段」「href 来自源码常量」「受控 fill 往返」共同承担——
 *  都与 src 静态数据/常量耦合，改源即 FAIL（等价变异验证）。注入的 stripe-promotion fixture 仅作
 *  全局 footer 促销的确定化，把它改空对页面主体断言无影响（已实测：删除注入页面仍正常渲染）。
 */

const STRIPE_PROMOTION = "models-voices-stripe-promotion.json";

// getLanguageData()[0].default 的稳定起始片段（源码静态数据，非 i18n 目录）。
const ENGLISH_DEFAULT_PREFIX = "Hey there, how's it going";
// DOCS_URL.TXT2SPEECH（常量，非 UI 文案）。
const TTS_DOC_HREF = "/docs/api-reference/model-apis-text-to-speech";

test.describe("Voices (Text-to-Speech) demo page（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    // 共享 dev server 冷编译/高负载时，本页（Header+Footer+demo+多区块）首跑 page.goto 可能逼近
    // 默认 30s 超时；给整测 90s 头量（与 wan-2.1/model-api-product-* 等已合入 spec 同惯例）。
    test.setTimeout(90_000);
    // 此页无后端数据依赖；只把全局 footer 促销 XHR 确定化，其余走默认壳。
    const promo = loadFixture(STRIPE_PROMOTION);
    await mockBackend(page, {
      endpoints: { "/v3/stripe/promotion": promo },
    });
  });

  test("公开 demo 渲染完整结构（4 voice / 3 lang / 6 library / 卖点 / 预填 prompt / 文档链接），未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/models/voices", { waitUntil: "domcontentloaded" });

    // --- demo 已 hydrate 的强信号：唯一 textarea 可见（Playground 客户端挂载完成） ---
    const promptBox = page.locator("textarea");
    await expect(promptBox).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（公开页，且未 seedAuth） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 首屏 Hero 结构（h1，结构角色不断言文案） ---
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    // 四个区块标题（VoiceLibrary / KeyFeature / UsageExample / SupportLanguage），h3 计数有牙。
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(4);

    // --- 确定性：Playground voice 选择器恰 4 个（对 getData() 计数有牙，改源即 FAIL） ---
    await expect(
      page.locator(
        '[class*="Playground_voice_box_list__"] [class*="Playground_item__"]',
      ),
    ).toHaveCount(4);

    // --- 确定性：语言选择器恰 3 个，其中 1 个初始 active（English） ---
    await expect(
      page.locator('[class*="Playground_language_item__"]'),
    ).toHaveCount(3);
    await expect(
      page.locator('[class*="Playground_language_active__"]'),
    ).toHaveCount(1);

    // --- 确定性：VoiceLibrary 恰 6 张卡（getData() 计数有牙） ---
    await expect(page.locator('[class*="VoiceLibrary_item__"]')).toHaveCount(6);

    // --- 确定性：UsageExample 恰 3 个卖点 / SupportLanguage 恰 3 个国旗项 ---
    await expect(page.locator('[class*="UsageExample_item__"]')).toHaveCount(3);
    await expect(
      page.locator('[class*="SupportLanguage_lang_item__"]'),
    ).toHaveCount(3);

    // --- 确定性：恰 11 个 <audio>（4 playground 试听 + 6 library + 1 playground 输出） ---
    await expect(page.locator("audio")).toHaveCount(11);

    // --- textarea 预填 getLanguageData()[0].default（源码静态数据片段，证明已 hydrate 接上数据） ---
    await expect(promptBox).toHaveValue(new RegExp(ENGLISH_DEFAULT_PREFIX));

    // --- 字数上限字面量 `/ 500`（Limit 常量，非 i18n；textarea footer 内） ---
    await expect(
      page.locator('[class*="Playground_textarea_footer__"]'),
    ).toContainText("/ 500");

    // --- 文档/Discord 链接（href 锚点，源自常量/硬编码，非 i18n 文案） ---
    // API Reference + Explore Documentation 都指向 DOCS_URL.TXT2SPEECH（出现 >=2 次）。
    await expect(
      page.locator(`a[href="${TTS_DOC_HREF}"]`).first(),
    ).toBeVisible();
    await expect(page.locator(`a[href="${TTS_DOC_HREF}"]`)).not.toHaveCount(0);
    // Playground 的 Join Discord（硬编码 invite）
    await expect(
      page.locator('a[href="https://discord.gg/YyPRAzwp7P"]').first(),
    ).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("核心交互：textarea 受控 fill 往返（输入→回显→清空→再输入），页面保持稳定", async ({
    page,
  }) => {
    await page.goto("/models/voices", { waitUntil: "domcontentloaded" });

    const promptBox = page.locator("textarea");
    await expect(promptBox).toBeVisible({ timeout: 30_000 });
    // 初始预填英文 default（确定性）
    await expect(promptBox).toHaveValue(new RegExp(ENGLISH_DEFAULT_PREFIX));

    // --- 受控输入往返（确定性核心契约）：fill 原子 set value，触发一次 onChange ---
    // fillStable 加固：受控 textarea 挂了 onFocus 副作用，Playwright fill() 的「聚焦→全选→插入」
    // 里首次聚焦触发的重渲染会打断全选/插入之间、把光标重置到 0，导致输入被插到预填值前面，
    // 合成 "输入"+"预填"。重渲染只在首次聚焦发生，故用 toPass 重试：第二次 fill 时已聚焦即稳。
    const fillStable = async (text: string) => {
      await expect(async () => {
        await promptBox.fill(text);
        await expect(promptBox).toHaveValue(text);
      }).toPass({ timeout: 15_000 });
    };
    await fillStable("a calm british narrator reading a bedtime story");
    await fillStable("");
    await fillStable("hello from the e2e text to speech demo");

    // --- 字数上限字面量仍在（受控输入未破坏 footer 结构） ---
    await expect(
      page.locator('[class*="Playground_textarea_footer__"]'),
    ).toContainText("/ 500");

    // --- 交互后页面仍稳定：未跳登录、无错误边界 ---
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("全局促销端点 500：footer 促销降级，页面 demo 主体仍渲染、未弹登录、不崩", async ({
    page,
  }) => {
    // 该页主体不依赖任何后端数据；唯一全局 XHR /v3/stripe/promotion 置 500 时，FooterBanner
    // 应静默降级，demo 结构（textarea + 4 voice + 6 library）仍完整渲染，错误边界不触发。
    await mockBackend(page, {
      failEndpoints: { "/v3/stripe/promotion": 500 },
    });
    await page.goto("/models/voices", { waitUntil: "domcontentloaded" });

    // demo 主体仍渲染
    const promptBox = page.locator("textarea");
    await expect(promptBox).toBeVisible({ timeout: 30_000 });
    await expect(promptBox).toHaveValue(new RegExp(ENGLISH_DEFAULT_PREFIX));
    await expect(
      page.locator(
        '[class*="Playground_voice_box_list__"] [class*="Playground_item__"]',
      ),
    ).toHaveCount(4);
    await expect(page.locator('[class*="VoiceLibrary_item__"]')).toHaveCount(6);

    // 未弹登录、无错误边界（促销失败被静默吞掉）
    await expect(page).not.toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
