import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpu-baremetal（营销/公开页，无需登录）。
 *
 * 页面类型（读 src 实测确认 — app/gpu-baremetal/page.tsx）：
 *  - 纯静态 server component：WebsiteNavbar + GpuBareMetalHero + GpuBareMetalPageContent + FooterSection。
 *  - 页面主体（Hero + PageContent）**不发任何 XHR**：GPU 卡片数据是 createWorkloadSections()
 *    在服务端硬编码的常量，没有 getBareMetalList / 任何 fetch。
 *  - components/BaremetalList.tsx（含 getBareMetalList XHR + 搜索框 + 抽屉）在本仓库**未被
 *    page.tsx 引用**（仅 i18n 目录残留其 key）——本测试用「搜索框不存在」做负向断言锁死这一事实，
 *    防止它被误接回来时回归无声漏过。
 *  - /gpu-baremetal 不在 LOGIN_REQUIRED_URL，未登录不弹登录 → 不 seedAuth。
 *  - 抓取到的唯一后端调用 /v3/stripe/promotion 来自共享导航/促销上下文（非页面主体）；
 *    注入脱敏 fixture 让运行确定性，不依赖真实后端。
 *
 * 断言纪律（关键）：本仓库经构建期 i18n 变换会自动抽取 JSX 文案（EN/ZH/DE… 多变体），
 *  连 "BEST VALUE"/"AI Inference"/区块标题都是 i18n key（值随变体变化）——**绝不断言这些文案**。
 *  可断言的「数据锚点」必须是跨全部变体恒定的：
 *   - GPU 型号名（h100Sxm="H100 SXM"、b200Sxm="B200 SXM"… 经核对在 7 个变体里值完全一致，
 *     是产品/SKU 专名而非可译文案）；
 *   - 价格串（"$1.70"/"$4.77"/"/GPU/hr" 根本未进 i18n 目录，源自 raw JSX 插值，全变体同形）。
 *  结构锚点用语义角色（article/h1/h3/h4）+ 稳定的 aria-label/href（href 不经 i18n）。
 *  页面无 data-testid（见交付报告「建议补 data-testid」）。
 *
 * DOM 真值（探针实测，已写入断言；非 raw-HTML，故不含 RSC flight echo 重复）：
 *   Solutions 区块: article=8, "/GPU/hr"=3, brevo CTA=5
 *   型号名: H100 SXM×2  B200 SXM×1  H200 SXM×2  RTX 5090×2  RTX 4090×1
 *   价格: $1.70×2  $4.77×1 ; 结构: h1×1, h3×8(4 区块标题+4 特性瓦片), h4×8(卡片标题)
 */

const PROMOTION = "gpu-baremetal-stripe-promotion.json";
const BREVO = "https://meetings-na2.hubspot.com/junyu";

test.describe("GPU Bare Metal marketing page（hermetic）", () => {
  test.beforeEach(async ({ page }) => {
    const promo = loadFixture<{ valid: boolean }>(PROMOTION);
    // 守卫：fixture 形态即测试前提（无 active promotion 的确定性基线）
    expect(promo.valid).toBe(false);
    await mockBackend(page, { endpoints: { "/v3/stripe/promotion": promo } });
  });

  test("静态页结构 + 确定性 GPU 卡片数据按硬编码渲染，未弹登录、不崩", async ({
    page,
  }) => {
    await page.goto("/gpu-baremetal", { waitUntil: "domcontentloaded" });

    // --- Hero（结构锚点 h1，不断言文案） ---
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 30_000,
    });

    // --- 公开页：未被弹去登录（未 seedAuth 仍可访问） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 内容主体容器（稳定 aria-label，非 i18n） ---
    const solutions = page.locator('section[aria-label="Solutions"]');
    await expect(solutions).toHaveCount(1);

    // --- 4 区块 × 2 卡片 = 8 个 GPU 卡片（语义 article，区块内计数，隔离 navbar/footer 噪音） ---
    await expect(solutions.locator("article")).toHaveCount(8);
    // 8 张卡标题 = 8 个 h4
    await expect(page.getByRole("heading", { level: 4 })).toHaveCount(8);
    // 4 区块标题 + 4 "Why Novita" 特性瓦片 = 8 个 h3
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(8);

    // --- 型号名逐张渲染（跨 i18n 变体恒定的 SKU 专名，对硬编码数据有牙） ---
    await expect(page.getByText("H100 SXM", { exact: true })).toHaveCount(2);
    await expect(page.getByText("B200 SXM", { exact: true })).toHaveCount(1);
    await expect(page.getByText("H200 SXM", { exact: true })).toHaveCount(2);
    await expect(page.getByText("RTX 5090", { exact: true })).toHaveCount(2);
    await expect(page.getByText("RTX 4090", { exact: true })).toHaveCount(1);

    // --- 价格分支：3 张「定价卡」(H100×2 + B200×1) 出 "/GPU/hr"，5 张「Contact us 卡」不出 ---
    // ("/GPU/hr" 未进 i18n 目录，全变体同形)
    await expect(solutions.getByText("/GPU/hr")).toHaveCount(3);
    await expect(page.getByText("$1.70", { exact: true })).toHaveCount(2); // H100（两个区块）
    await expect(page.getByText("$4.77", { exact: true })).toHaveCount(1); // B200

    // --- CTA 分支：5 张「Contact us 卡」的预约链接（href 不经 i18n，target=_blank 新开） ---
    const ctaLinks = solutions.locator(`a[href="${BREVO}"]`);
    await expect(ctaLinks).toHaveCount(5);
    // 抽样校验外链属性（新标签页打开）——一条交互契约
    await expect(ctaLinks.first()).toHaveAttribute("target", "_blank");

    // --- 负向结构断言：未被引用的 BaremetalList（搜索框 + 抽屉）确实未渲染 ---
    // 它若被误接回来，搜索框会出现 → 此断言失败，挡住无声回归。
    await expect(page.getByPlaceholder("Search")).toHaveCount(0);

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("Hero 主 CTA 指向预约链接并新标签页打开（交互契约）", async ({
    page,
  }) => {
    await page.goto("/gpu-baremetal", { waitUntil: "domcontentloaded" });

    const hero = page.locator("section").filter({
      has: page.getByRole("heading", { level: 1 }),
    });
    await expect(hero).toBeVisible({ timeout: 30_000 });

    // Hero 内唯一的 brevo 链接（"Contact Us" 主按钮，渲染为 <a renderTag="link">）
    const heroCta = hero.locator(`a[href="${BREVO}"]`);
    await expect(heroCta).toHaveCount(1);
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveAttribute("target", "_blank");
    await expect(heroCta).toHaveAttribute("rel", /noopener/);

    // 不崩
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
