import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/models-console/settings（鉴权 console 页）。
 *
 * page.tsx 是 RSC 壳，但取数全在客户端：PermissionWrapper / PlaygroundSwitch 都是
 * "use client"，挂载后由全局 Header 的 useHeaderAuth 发 XHR（/v1/user/info +
 * fetchEnterprise → /v1/enterprise-plan/config），可被 page.route 拦截。故这一层断言
 * **确定性行为**而不只是「不白屏」：权限门放行、Playground 卡 + Switch 渲染、
 * **Switch 开关态由 enterprise 配置驱动**（OFF/ON 两个分支）、PAYG 点开关弹升级
 * Dialog 且不翻转、未弹登录、不触发错误边界。
 *
 * 渲染契约（读 src + 实测确认）：
 *  - PermissionWrapper(resourceGroup=model_api, resource=settings, action=read)：
 *    uuid 空 → 渲染空 <></>（白屏）；故 /v1/user/info fixture 必须带 uuid。
 *    updateUserInfo 要求 payload.teams 是数组，fixture teams:[] → currentTeam=null。
 *    checkPermission(uuid 存在, currentTeam null) 直接返回 true（第 31-33 行短路），
 *    无需单独的 permissions-config 端点 → 门放行，渲染 PlaygroundSwitch。
 *    同理 usePermission(action=all) 也返回 true → Switch 可编辑（非只读）。
 *  - PlaygroundSwitch 读 state.config.enterprise（fetchEnterprise 从
 *    /v1/enterprise-plan/config 注入）。useEffect：playgroundAPIConfig===USE_ENTERPRISE
 *    → setIsChecked(true)，否则 false。故 Switch 的 aria-checked 由 fixture 决定。
 *  - handleChange：!isEnterprisePlan → setConfirmVisible(true) 早退（不发 PUT、不翻转）；
 *    isEnterprisePlan 时才真正 setPlaygroundConfig + 翻转。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。Switch 用源码硬编码 track id
 * #main__models-console__settings__playground-switch（id={CLICK_BTN_IDs...}，locale 无关）；
 * 升级 Dialog 用其按钮的稳定 track id（playground-tips-cancel / -dedicated-endpoint）+
 * getByRole("dialog")；卡片用稳定语义 class .console-card；开关态用 aria-checked（ARIA，
 * 非文案）。已在交付报告建议给 .console-card 补 data-testid（见报告）。
 */

const SWITCH_ID = "#main__models-console__settings__playground-switch";
const DIALOG_CANCEL_ID =
  "#main__models-console__settings__playground-tips-cancel";
const DIALOG_DE_ID =
  "#main__models-console__settings__playground-tips-dedicated-endpoint";

const userInfo = loadFixture("models-console-settings-user-info.json");

const seed = async (page: Page, enterpriseConfigFixture: string) => {
  await seedAuth(page);
  await mockBackend(page, {
    endpoints: {
      "/v1/user/info": userInfo,
      "/v1/enterprise-plan/config": loadFixture(enterpriseConfigFixture),
    },
  });
};

test.describe("Models Console Settings（hermetic）", () => {
  test("权限门放行：渲染 Playground 卡 + Switch（PAYG 配置下 Switch=OFF），未弹登录、不崩", async ({
    page,
  }) => {
    await seed(page, "models-console-settings-enterprise-config-payg.json");
    await page.goto("/models-console/settings");

    // 稳定锚点：Playground Switch（客户端 fetch + PermissionWrapper 放行 + 渲染完成的信号），
    // 自带重试等待，避免在挂载/数据回填前抢跑。
    const sw = page.locator(SWITCH_ID);
    await expect(sw).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 带 uuid 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 结构：恰好一张 Playground 卡 + 一个 switch 角色（PermissionWrapper 放行而非
    //     渲染空壳 / no-permission 块；后两者都不含 .console-card+switch） ---
    await expect(page.locator(".console-card")).toHaveCount(1);
    await expect(page.getByRole("switch")).toHaveCount(1);

    // --- 数据分支：fixture playgroundAPIConfig=NOT_USE_ENTERPRISE → Switch 渲染 OFF ---
    await expect(sw).toHaveAttribute("aria-checked", "false");

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("数据分支：enterprise 计划 + USE_ENTERPRISE 配置 → Switch 渲染 ON", async ({
    page,
  }) => {
    await seed(page, "models-console-settings-enterprise-config-on.json");
    await page.goto("/models-console/settings");

    const sw = page.locator(SWITCH_ID);
    await expect(sw).toBeVisible({ timeout: 30_000 });

    // PlaygroundSwitch 的 useEffect 在 config 回填后把 playgroundAPIConfig===USE_ENTERPRISE
    // 映射成 setIsChecked(true)；等到 aria-checked 翻成 true（自带重试，覆盖回填时序）。
    await expect(sw).toHaveAttribute("aria-checked", "true", {
      timeout: 10_000,
    });

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("交互分支：PAYG 计划下点 Switch → 弹升级 Dialog，且 Switch 不翻转", async ({
    page,
  }) => {
    await seed(page, "models-console-settings-enterprise-config-payg.json");
    await page.goto("/models-console/settings");

    const sw = page.locator(SWITCH_ID);
    await expect(sw).toBeVisible({ timeout: 30_000 });
    // 初始 OFF（前置条件）
    await expect(sw).toHaveAttribute("aria-checked", "false");

    // 升级 Dialog 在点击前不存在
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // handleChange：!isEnterprisePlan → setConfirmVisible(true) 早退。点击后 Dialog 打开。
    await sw.click();

    // Dialog 的稳定结构锚点：Cancel / Learn More 两个带 track id 的按钮 + dialog 角色。
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await expect(page.locator(DIALOG_CANCEL_ID)).toBeVisible();
    await expect(page.locator(DIALOG_DE_ID)).toBeVisible();

    // 关键：PAYG 路径早退，没发 PUT、没翻转 → Switch 仍 OFF。
    await expect(sw).toHaveAttribute("aria-checked", "false");

    // Cancel 关闭 Dialog（交互闭环）
    await page.locator(DIALOG_CANCEL_ID).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
