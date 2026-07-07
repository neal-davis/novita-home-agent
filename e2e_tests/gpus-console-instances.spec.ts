import { test, expect } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/instances（客户端取数页）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 覆盖那个），而是断言**确定性行为**：
 * 列表态按 fixture 出 N 张实例卡 + 工具栏渲染；空态切到 DefaultGuide（onboarding）；
 * 两态都未被弹去登录、不触发错误边界。
 *
 * 渲染契约（读 src 实测确认）：
 *  - page.tsx 是 server component，但取数全在客户端：components/container.tsx 是 "use client"，
 *    挂载后读 Redux state.user.uuid 守卫——uuid 存在才发 reqGpuInstance()（/gpu/instances 的 XHR），
 *    可被 page.route 拦截。uuid 由 Header 挂载时 fetch /v1/user/info 注入（updateUserInfo
 *    要求 payload.teams 是数组，故 fixture teams:[]）。
 *  - container.tsx 分支：res.instances.length > 0 → <Section>（卡片列表）；否则 → <DefaultGuide>。
 *  - Section 每张实例卡是一个 <button id="panel3-header">（每卡一个，id 复用）→
 *    locator("#panel3-header") 命中数 == 实例数（实测 1→1 / 2→2 / 3→3），是干净的「行数」锚点。
 *  - Section 工具栏「+ GPU Instance」按钮带稳定 id（CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_TO_CREATE
 *    = "main__gpus-console__instance__to-create"），DefaultGuide 不渲染它——用它区分两态。
 *
 * 选择器纪律：无 i18n 文案断言。锚点用稳定 id（#main__gpus-console__instance__to-create、
 * #panel3-header）与稳定语义 class（[class*='subContainer']）。
 * DefaultGuide 无 data-testid / 稳定 id（见交付报告「建议补 data-testid」），故空态只能断言
 * 「Section 工具栏不存在 + 不崩 + 未弹登录」——已是 onboarding 态的合格深度断言。
 */

const CREATE_BTN_ID = "#main__gpus-console__instance__to-create";
const INSTANCE_CARD = "#panel3-header";

const baseEndpoints = {
  "/v1/user/info": loadFixture("gpus-console-instances-user-info.json"),
};

test.describe("GPU Console Instances（hermetic）", () => {
  test("列表态：按 fixture 渲染 N 张实例卡 + 工具栏，未弹登录、不崩", async ({
    page,
  }) => {
    const list = loadFixture<{ instances: unknown[] }>(
      "gpus-console-instances-list.json",
    );
    const expectedRows = list.instances.length; // 3

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: { ...baseEndpoints, "/gpu/instances": list },
    });
    await page.goto("/gpus-console/instances");

    // 稳定锚点：工具栏「+ GPU Instance」按钮（客户端 fetch + Section 渲染完成的信号）。
    const createBtn = page.locator(CREATE_BTN_ID);
    await expect(createBtn).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- Section 容器渲染（区别于 DefaultGuide） ---
    await expect(page.locator("[class*='subContainer']")).toHaveCount(1);

    // --- 列表按 fixture 出行：每张卡一个 #panel3-header，命中数 == 实例数 ---
    await expect(page.locator(INSTANCE_CARD)).toHaveCount(expectedRows);

    // --- 代表性内容：fixture 合成实例名 / id 渲染进卡片（非 i18n 文案） ---
    await expect(
      page.getByText("e2e-instance-onDemand", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/inst-aaaa1111/).first()).toBeVisible();

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空态：无实例时切到 DefaultGuide（onboarding），无工具栏、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/gpu/instances": loadFixture("gpus-console-instances-list-empty.json"),
      },
    });
    await page.goto("/gpus-console/instances");

    // DefaultGuide 的稳定结构锚点：Deploy / Learn More 两个 <button>（角色，不带 i18n name）。
    // 空态加载完成后页面至少有这两个动作按钮；先等到它们出现再做负向断言，避免在 loading 期抢跑。
    await expect
      .poll(async () => page.getByRole("button").count(), {
        timeout: 30_000,
      })
      .toBeGreaterThanOrEqual(2);

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 切到 DefaultGuide：Section 工具栏与实例卡都不存在 ---
    await expect(page.locator(CREATE_BTN_ID)).toHaveCount(0);
    await expect(page.locator(INSTANCE_CARD)).toHaveCount(0);
    await expect(page.locator("[class*='subContainer']")).toHaveCount(0);

    // --- 不触发错误边界 ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
