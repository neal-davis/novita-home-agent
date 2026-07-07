import { test, expect, type Page } from "@playwright/test";
import { loadFixture, mockBackend, seedAuth } from "./helpers/mockBackend";

/**
 * hermetic 行为门禁：/gpus-console/settings（console 鉴权页）。
 *
 * 这一层不只断言「不白屏」（全站 sweep 覆盖那个），而是断言**确定性行为/结构**：
 * 三个设置面板（SSH Public Keys / Container Registry Auth / Single-Numa）从 mocked
 * 后端把数据渲染出来——SSH key 文本填进 textarea、registry 列表按 fixture 出行、
 * Single-Numa 复选框反映 fixture 的布尔值；并覆盖「有数据 vs 空数据」两条分支；
 * 两态都未被弹去登录、不触发错误边界。
 *
 * 渲染契约（读 src 实测确认）：
 *  - page.tsx 是 server component，但取数全在客户端：components/section.tsx 是 "use client"，
 *    挂载后并行发三个 XHR（可被 page.route 拦截）：
 *      · reqGetSSHKey()        → GET /api/v1/user/sshkey   → res.key  → SSH textarea value
 *      · reqGetImageAuths()    → GET /api/v1/gpu/image/repository/auths → res.data → registry 表行
 *      · reqGetUserSettings()  → GET /v1/user/settings      → res.singleNuma → 复选框初值
 *    （request() 返回整个 JSON body，故 fixture body 形如 { code:0, key/data/singleNuma }）。
 *  - 权限：usePermission 读 Redux state.user.uuid + currentTeam。fixture user-info 的
 *    uuid 存在 + teams:[] → currentTeam=null → checkPermission() 全部返回 true → 权限门控的
 *    UI（SSH「Update Public Key」按钮、registry「Action」列与删除按钮、Single-Numa 复选框）渲染。
 *    uuid 由 Header 挂载时 fetch /v1/user/info 注入（updateUserInfo 要求 teams 为数组）。
 *
 * 选择器纪律：**绝不断言 i18n 文案**。锚点全部 locale 无关：
 *  - 结构：SSH 更新按钮的稳定 id（CLICK_BTN_IDs.GPUS_CONSOLE.SETTINGS_UPDATE_PUBLIC_KEY
 *    = "main__gpus-console__settings__update-public-key"，源码硬编码 track id）；
 *    Section 根容器稳定 class 片段 [class*='subContainer']；该容器内**唯一**的 <table>
 *    就是 registry 表（实测 subContainer 内 table 数恒为 1，页面其余 5 张表来自 Header/通知，
 *    在 subContainer 外）。
 *  - 数据：fixture 注入的纯数据值——SSH key 字符串（写进 textarea.inputValue）、registry 行数、
 *    registry 行内的合成 id/name、Single-Numa 复选框的 data-state（Radix Checkbox 把
 *    singleNuma 布尔映射成 data-state=checked/unchecked；注意 Playwright getByRole("checkbox")
 *    对该 Radix 实现命中 0，故用 `label button[role='checkbox']` + data-state 断言）。
 * 注：页面文案如 "SSH Public Keys"/"ID"/"Name"/"Prefer Single-Numa" 在 src 里是硬编码字面量
 * （非 i18n 目录键），但本 spec 一律不依赖它们；锚点用 id / class / data-state。
 * 环境备注：本环境（dev/test）始终有一个全局「Instance Migration」通知 Dialog 浮层
 * （role=dialog data-state=open）盖在页面上——它拦截 pointer 事件，故本 spec 不做点击交互，
 * 改以「两套 fixture 跑两条数据分支」覆盖行为（count/getAttribute/visible 断言不受浮层影响）。
 */

const SSH_UPDATE_BTN = '[id="main__gpus-console__settings__update-public-key"]';
const SUB_CONTAINER = "[class*='subContainer']";
const NUMA_CHECKBOX = "label button[role='checkbox']";

const baseEndpoints = {
  "/v1/user/info": loadFixture("gpus-console-settings-user-info.json"),
};

/** Section 根容器内唯一的 registry 表（页面其余表在 Header/通知里，不在 subContainer 内）。 */
const registryTable = (page: Page) =>
  page.locator(`${SUB_CONTAINER} table`).first();

test.describe("GPU Console Settings（hermetic）", () => {
  test("有数据：SSH key/registry 列表/Single-Numa 从 mocked 数据渲染，未弹登录、不崩", async ({
    page,
  }) => {
    const auths = loadFixture<{ data: Array<{ id: string; name: string }> }>(
      "gpus-console-settings-image-auths.json",
    );
    const sshkey = loadFixture<{ key: string }>(
      "gpus-console-settings-sshkey.json",
    );
    const expectedRows = auths.data.length; // 3

    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/gpu/image/repository/auths": auths,
        "/user/sshkey": sshkey,
        "/user/settings": loadFixture(
          "gpus-console-settings-user-settings-on.json",
        ),
      },
    });
    await page.goto("/gpus-console/settings", {
      waitUntil: "domcontentloaded",
    });

    // 稳定锚点：SSH「Update Public Key」按钮（客户端 fetch + Section 渲染完成 + 权限通过的信号），
    // 自带重试等待，避免在挂载/数据回填前抢跑。
    const updateBtn = page.locator(SSH_UPDATE_BTN);
    await expect(updateBtn).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录（seedAuth + mocked /v1/user/info 成功） ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 结构：Section 根容器渲染 ---
    await expect(page.locator(SUB_CONTAINER)).toHaveCount(1);

    // --- 数据：SSH key 从 mocked /user/sshkey 写进 textarea ---
    await expect(page.locator("textarea").first()).toHaveValue(sshkey.key);

    // --- 数据：registry 表按 fixture 出行（subContainer 内唯一表，3 行） ---
    await expect(registryTable(page).locator("tbody tr")).toHaveCount(
      expectedRows,
    );
    // 代表性内容：fixture 合成 id / name 渲染进行（非 i18n 文案）
    await expect(
      registryTable(page).getByText(auths.data[0].id, { exact: true }),
    ).toBeVisible();
    await expect(
      registryTable(page).getByText(auths.data[0].name, { exact: true }),
    ).toBeVisible();
    // 每行一个删除按钮（delete 权限通过 → Action 列渲染）。
    // 锚点用 aria-label 属性选择器（src 硬编码 aria-label="Delete registry auth"，locale 无关）：
    // 该按钮内含 lucide Trash2 <svg>，Playwright 的 getByRole 可访问名计算对其命中 0，
    // 故改用属性选择器（实测稳定命中 N）。
    await expect(
      registryTable(page).locator("button[aria-label='Delete registry auth']"),
    ).toHaveCount(expectedRows);

    // --- 数据：Single-Numa 复选框反映 fixture singleNuma:true → data-state=checked ---
    await expect(page.locator(NUMA_CHECKBOX).first()).toHaveAttribute(
      "data-state",
      "checked",
    );

    // --- 不触发错误边界（src/app/error.tsx → <h1>Error</h1>） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });

  test("空数据分支：registry 空表 + SSH 空 + Single-Numa 未勾选，仍渲染、不崩", async ({
    page,
  }) => {
    await seedAuth(page);
    await mockBackend(page, {
      endpoints: {
        ...baseEndpoints,
        "/gpu/image/repository/auths": loadFixture(
          "gpus-console-settings-image-auths-empty.json",
        ),
        "/user/sshkey": { code: 0, key: "" },
        "/user/settings": loadFixture(
          "gpus-console-settings-user-settings.json",
        ),
      },
    });
    await page.goto("/gpus-console/settings", {
      waitUntil: "domcontentloaded",
    });

    const updateBtn = page.locator(SSH_UPDATE_BTN);
    await expect(updateBtn).toBeVisible({ timeout: 30_000 });

    // --- 未被弹去登录 ---
    await expect(page).not.toHaveURL(/\/login/);

    // --- 结构未塌：Section 容器在，registry 表头在但零数据行 ---
    await expect(page.locator(SUB_CONTAINER)).toHaveCount(1);
    await expect(registryTable(page)).toBeVisible();
    await expect(registryTable(page).locator("tbody tr")).toHaveCount(0);

    // --- 数据空态：SSH textarea 为空 ---
    await expect(page.locator("textarea").first()).toHaveValue("");

    // --- 数据分支：Single-Numa 复选框 fixture singleNuma:false → data-state=unchecked ---
    await expect(page.locator(NUMA_CHECKBOX).first()).toHaveAttribute(
      "data-state",
      "unchecked",
    );

    // --- 空态不应触发错误边界（兜底 {} 会让期望数组的组件抛错，这里显式注入空数组壳证明无此问题） ---
    await expect(
      page.getByRole("heading", { name: "Error", exact: true }),
    ).toHaveCount(0);
  });
});
