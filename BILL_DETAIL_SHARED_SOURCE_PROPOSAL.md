# Bill Detail Shared Source Engineering Proposal

本文记录 `bill-detail` / `customer-bill-new` 在多站点、多后台项目中统一治理的工程方案。目标不是把业务逻辑藏进一个运行时 npm 包，而是把账单业务事实集中管理，再把可读、可审、可调试、可被 i18n 扫描的源码同步到各业务项目。

## 1. 核心结论

### 1.1 不建议把业务逻辑做成运行时 npm 黑盒

账单详情不是纯 UI 组件库，它包含大量高频变化的业务规则：

- 一级/二级 tab 能力。
- 产品品类枚举。
- 查询参数和时间规则。
- LLM token、Prompt Cache、多模态、阶梯价解释。
- 企业账单、团队账单、API Key 查询限制。
- 导出列、文件名、金额精度。

如果这些逻辑运行时来自 `node_modules`，业务项目会遇到几个问题：

- 代码不可见，排查问题需要跳包。
- i18n 扫描可能扫不到 `node_modules` 中的文案。
- 每次业务规则变更都要发布包、升级包、处理版本漂移。
- 宿主项目的权限、请求、状态、埋点、UI 组件仍然无法被包内直接稳定使用。

因此推荐：

> shared 统一管理业务事实和生成工具，但业务源码最终落到宿主项目 `src` 目录中。

### 1.2 推荐模型

一句话：

> shared 管业务事实，preset 管项目选择，adapter 管宿主能力，codegen/sync 管源码落地。

分层如下：

| 层级                  | 放什么                                                                                   | 不放什么                                         |
| --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Shared Source         | 账单能力 registry、schema、query builder、formatter、export schema、通用 hooks、生成模板 | 宿主项目具体 UI、路由、Redux、权限常量、请求封装 |
| Project Preset        | 当前项目启用哪些 tab、哪些产品、币种、时区、功能开关                                     | 具体组件实现                                     |
| Host Adapter          | API transport、UI 组件、i18n、toast、permission、analytics、member resolver              | 通用业务规则                                     |
| Generated/Sync Source | 由 shared 生成或同步到宿主 `src` 的可读源码                                              | 手写业务例外                                     |
| Project Overrides     | 少量明确的项目特例                                                                       | 通用能力分叉                                     |

## 2. 独有差异功能放在哪里

### 2.1 推荐放在 shared，但作为 capability plugin 管理

每个项目独有但仍属于 bill-detail 领域的能力，应放在 shared 统一管理，而不是散落在各业务项目里。

例如：

| 项目独有能力                    | 建议归属                        | 原因                                   |
| ------------------------------- | ------------------------------- | -------------------------------------- |
| PPIO `web_search` 按量账单      | shared capability plugin        | 仍是账单产品表，只是部分项目启用       |
| PPIO monthly `bare_metal`       | shared capability plugin        | 属于固定周期账单产品                   |
| Novita `llm_dedicated_endpoint` | shared capability plugin        | 属于 LLM 产品账单域                    |
| Novita monthly `image`          | shared capability plugin        | 属于月度账单产品                       |
| 某项目独有语言阻断逻辑          | host adapter / project-specific | 这是宿主 UI/语言策略，不是账单领域规则 |
| 某后台独有权限 key              | host adapter                    | 权限系统属于宿主                       |

这样做的好处：

- 所有账单能力在一张 capability map 里可见。
- 项目通过 preset 控制启用/禁用，不需要复制代码。
- 新增产品时先进入 shared registry，再由项目 preset 选择是否启用。
- 未来如果另一个项目也启用同类产品，不需要重新搬代码。

### 2.2 不建议放在 shared 的内容

下面这些是宿主项目能力，不应进入 shared business core：

- 路由注册方式：Next App Router、React Router、Vite route config。
- 权限系统：`PermissionWrapper`、后台 permission string。
- Redux/store shape。
- 请求封装：`request`、token、base URL、401 处理、mock。
- UI 库：AntD、shadcn/Radix、本地 Card/Table/Select。
- i18n 实现：`react-i18next`、编译期扫描、自定义字典加载。
- 埋点实现。
- 页面 shell、侧边栏宽度、布局容器。

这些用 adapter 连接。

## 3. Shared 仓库建议结构

建议新建独立 shared source 仓库或 monorepo package，但定位是“源码与工具仓库”，不是运行时业务 npm。

```text
bill-detail-shared/
  src/
    capabilities/
      modes.ts
      ondemand.ts
      monthly.ts
      aggregated.ts
      enterprise.ts
      plugins/
        webSearch.ts
        bareMetalMonthly.ts
        llmDedicatedEndpoint.ts
        imageDedicatedMonthly.ts
    schemas/
      billDetail.schema.ts
      tableColumn.schema.ts
      export.schema.ts
      projectPreset.schema.ts
    query/
      buildBillListParams.ts
      buildMonthlyParams.ts
      buildApiKeyParams.ts
      buildMemberParams.ts
      buildEnterpriseParams.ts
    formatters/
      money.ts
      billingPeriod.ts
      llmTokenFields.ts
      storageUsage.ts
      tradeType.ts
    export/
      buildWorkbookRows.ts
      buildWorkbook.ts
    hooks/
      useBillDetailQuery.ts
      useClientPagination.ts
    templates/
      moduleEntry.tsx.tpl
      generatedRegistry.ts.tpl
      generatedTables.tsx.tpl
      dictionaries.json.tpl
    presets/
      ppio-home.ts
      novita-home.ts
      ppio-admin.ts
      novita-admin.ts
      admin-frontend.ts
  tools/
    sync/
    generate/
    validate/
    diff/
  playground/
    next-app/
    vite-app/
  fixtures/
    ondemand-summary.json
    llm-billing.json
    api-key-billing.json
```

其中 npm 包可以存在，但用途限定为工具：

- `bill-detail-tools sync`
- `bill-detail-tools generate`
- `bill-detail-tools validate`
- `bill-detail-tools diff`

不建议让宿主页面运行时直接依赖 `import { BillDetailPage } from "@company/bill-detail"`。

## 4. 宿主项目落地结构

每个业务项目中建议生成或同步到如下目录：

```text
src/modules/bill-detail/
  shared/
    capabilities/
    query/
    formatters/
    export/
    hooks/
  generated/
    registry.generated.ts
    routes.generated.ts
    tables.generated.tsx
    messages.generated.ts
    manifest.generated.json
  adapters/
    api.ts
    ui.tsx
    i18n.ts
    permission.ts
    analytics.ts
    member.ts
    money.ts
    timezone.ts
  overrides/
    projectRules.ts
    customColumns.tsx
  index.tsx
```

建议文件策略：

| 目录         | 来源                          | 是否手改     |
| ------------ | ----------------------------- | ------------ |
| `shared/`    | 从 shared 仓库同步源码        | 通常不手改   |
| `generated/` | 由 schema/preset/codegen 生成 | 不手改       |
| `adapters/`  | 宿主项目维护                  | 手写         |
| `overrides/` | 宿主项目维护                  | 手写，但要少 |
| `index.tsx`  | 可生成初版，宿主可薄封装      | 尽量少改     |

生成文件头部应包含 manifest 注释：

```ts
// @bill-detail-managed
// source: bill-detail-shared@a1b2c3d
// preset: novita-admin
// editPolicy: do-not-edit-here
```

这样 PR diff 中能清楚知道代码来自哪一版 shared。

## 5. Schema 怎么管理

### 5.1 Schema 应该在 shared 管理

schema 是跨项目统一事实源，建议由 shared 管理。业务项目不直接修改主 schema，只通过 project preset 和 overrides 选择启用能力。

主 schema 负责描述：

- billing mode。
- product capability。
- filter schema。
- API query mapping。
- table columns。
- export columns。
- i18n message keys。
- visibility rules。
- feature flags。

项目 preset 负责描述：

- 当前项目启用哪些 mode。
- 当前项目启用哪些 product。
- 当前项目币种。
- 当前项目时区策略。
- 当前项目默认语言和文案策略。
- 当前项目是否启用企业账单、团队账单、API Key 账单。

### 5.2 示例

```ts
export const billDetailCapabilities = {
  modes: {
    OnDemand: {
      labelKey: "billingDetail.tabs.onDemand",
      defaultLabel: "Usage-based Billing",
      products: [
        "summary",
        "llm",
        "gen_api",
        "gpu",
        "serverless",
        "cloud_storage",
        "cloud_sandbox",
        "web_search",
        "llm_dedicated_endpoint",
      ],
    },
    Monthly: {
      labelKey: "billingDetail.tabs.monthly",
      defaultLabel: "Fixed-term Billing",
      products: ["summary", "gpu", "local_storage", "bare_metal", "image"],
    },
    MultiDimension: {
      labelKey: "billingDetail.tabs.aggregated",
      defaultLabel: "Aggregated Billing",
      products: ["creator", "api_key"],
    },
    Enterprise: {
      labelKey: "billingDetail.tabs.enterprise",
      defaultLabel: "Enterprise Billing",
      products: ["token_saving_plan"],
    },
  },
};
```

项目 preset：

```ts
export const ppioAdminPreset = {
  projectId: "ppio-admin",
  enabledModes: ["OnDemand", "Monthly", "MultiDimension", "Enterprise"],
  enabledProducts: {
    OnDemand: [
      "summary",
      "llm",
      "gen_api",
      "gpu",
      "serverless",
      "cloud_storage",
      "cloud_sandbox",
      "web_search",
    ],
    Monthly: ["summary", "gpu", "local_storage", "bare_metal"],
    MultiDimension: ["creator", "api_key"],
    Enterprise: ["token_saving_plan"],
  },
  timezonePolicy: "UTC_PLUS_8",
  currency: "CNY",
};
```

Novita preset：

```ts
export const novitaAdminPreset = {
  projectId: "novita-admin",
  enabledModes: ["OnDemand", "Monthly", "MultiDimension", "Enterprise"],
  enabledProducts: {
    OnDemand: [
      "summary",
      "llm",
      "llm_dedicated_endpoint",
      "gen_api",
      "gpu",
      "serverless",
      "cloud_storage",
      "cloud_sandbox",
    ],
    Monthly: ["summary", "gpu", "local_storage", "image"],
    MultiDimension: ["creator", "api_key"],
    Enterprise: ["token_saving_plan"],
  },
  timezonePolicy: "UTC",
  currency: "USD",
};
```

## 6. 代码生成逻辑

codegen 不应生成不可读的大块黑盒组件，而应生成“装配代码”。

### 6.1 输入

生成输入：

- shared capability schema。
- project preset。
- host `components.json`。
- host adapter contract。
- i18n strategy。
- optional overrides。

### 6.2 输出

生成输出：

- 当前项目实际启用的 registry。
- tab 顺序和 visibility 判断。
- table column schema。
- export schema。
- i18n message keys 或 dictionary patch。
- table/page 装配组件。
- manifest。

### 6.3 生成原则

生成代码要做到：

- 可读。
- 可 diff。
- 可断点调试。
- 可被 i18n 扫描。
- 不直接覆盖宿主手写 adapter。
- 不把宿主项目逻辑反向写进 shared。

示例生成结果：

```ts
export const generatedBillDetailRegistry = createBillDetailRegistry({
  preset: "novita-admin",
  modes: [
    {
      key: "OnDemand",
      label: t("billingDetail.tabs.onDemand", "Usage-based Billing"),
      products: [
        summaryTableDefinition,
        llmTableDefinition,
        llmDedicatedEndpointTableDefinition,
        genApiTableDefinition,
      ],
    },
  ],
});
```

如果宿主项目需要编译期 i18n 扫描，生成代码里应直接出现稳定 key 和 default text：

```tsx
t("billingDetail.products.llmDedicatedEndpoint", "LLM Dedicated Endpoints");
```

这样比运行时从 npm 包读取文案更适合当前约束。

## 7. components.json 的定位

`components.json` 可以做，但它不应该描述业务，只应该描述宿主项目的 UI 组件映射。

### 7.1 它适合管理什么

```json
{
  "ui": {
    "Tabs": "@/components/ui/tabs",
    "Table": "antd",
    "Button": "antd",
    "DateRangePicker": "@/components/ui/date-range-picker",
    "Select": "antd",
    "Pagination": "antd",
    "HoverCard": "@/components/ui/hover-card",
    "Empty": "antd"
  },
  "icons": {
    "Info": "lucide-react",
    "ChartPie": "lucide-react"
  },
  "style": {
    "cssModule": "src/modules/bill-detail/page.module.scss"
  }
}
```

它可以帮助生成器知道：

- 从哪里 import Button。
- Table 用 AntD 还是本地组件。
- DateRangePicker 的 prop 名是否需要 adapter。
- Empty/loading/pagination 用哪个组件。

### 7.2 它不适合管理什么

不要在 `components.json` 中放：

- 哪些账单 tab 展示。
- 哪些产品启用。
- API query 怎么拼。
- 金额怎么格式化。
- LLM token 怎么解释。
- API Key 查询限制。

这些属于 business schema / preset。

## 8. 组件替换和宿主能力映射

### 8.1 简单组件可通过 components.json scaffold

生成器可以根据 `components.json` 生成初始 `adapters/ui.tsx`：

```tsx
import { Button, Table, Pagination, Empty, Select, DatePicker } from "antd";

export const uiAdapter = {
  Button,
  Table,
  Pagination,
  Empty,
  Select,
  DateRangePicker: DatePicker.RangePicker,
};
```

### 8.2 复杂组件必须由 adapter 包一层

因为不同项目 UI 库的 props、loading、empty、pagination、popover 都不同，所以 shared 不应直接假设具体组件 API。

推荐 adapter 形态：

```tsx
export const uiAdapter = {
  renderTabs(props) {
    return (
      <Tabs
        activeKey={props.value}
        onChange={props.onChange}
        items={props.items}
      />
    );
  },

  renderTable(props) {
    return (
      <Table
        rowKey={props.rowKey}
        loading={props.loading}
        columns={props.columns}
        dataSource={props.rows}
        pagination={false}
      />
    );
  },

  renderPagination(props) {
    return (
      <Pagination
        current={props.page}
        pageSize={props.pageSize}
        total={props.total}
        onChange={props.onChange}
      />
    );
  },
};
```

shared 只消费统一接口，不直接 import AntD 或本地 UI。

### 8.3 宿主具体功能通过 adapter 注入

如果 shared 需要用到宿主能力，统一通过 adapter：

```ts
export interface BillDetailHostAdapters {
  api: {
    billDetailList(params: BillDetailListParams): Promise<BillListResponse>;
    monthlyList(params: MonthlyListParams): Promise<BillListResponse>;
    apiKeyList(params: ApiKeyListParams): Promise<BillListResponse>;
    memberList(params: MemberListParams): Promise<BillListResponse>;
    enterpriseList(params: EnterpriseListParams): Promise<BillListResponse>;
    category(params: CategoryParams): Promise<CategoryOption[]>;
  };
  i18n: {
    t(
      key: string,
      defaultText: string,
      values?: Record<string, unknown>,
    ): string;
  };
  permission: {
    canViewMode(mode: BillingMode): boolean;
    canViewProduct(mode: BillingMode, product: string): boolean;
  };
  member: {
    resolveDisplayName(input: MemberResolveInput): string;
  };
  analytics?: {
    track(event: string, payload?: Record<string, unknown>): void;
  };
  toast: {
    warning(message: string): void;
    error(message: string): void;
  };
  timezone: {
    toQueryTimestamp(date: unknown, boundary: "start" | "end"): number;
  };
  money: {
    formatAmount(value: number | string): string;
    exportAmount(value: number | string): number | string;
  };
}
```

这样 shared 可以使用宿主能力，但不会知道宿主项目内部实现。

## 9. Shared 独立开发和联调体验

shared 需要有自己的独立开发环境，但这个环境是为了验证业务 core 和生成结果，不是为了替代宿主项目。

### 9.1 Shared 本地开发

在 `bill-detail-shared` 中提供：

- fixtures：模拟各类账单响应。
- contract tests：验证 query params、formatter、export rows。
- schema validation：验证 preset 是否引用了不存在的 product。
- playground：Next/Vite 两套简单宿主。

开发流程：

```text
1. 修改 shared schema / formatter / query builder
2. 跑 unit tests + fixture tests
3. 在 playground 中查看生成页面
4. sync 到真实业务项目
5. 业务项目跑 i18n/build/页面验证
```

### 9.2 真实项目联调

建议提供 sync 命令：

```bash
pnpm bill-detail sync --project novita-admin --target ../novita-admin
pnpm bill-detail generate --project ppio-admin --target ../admin-frontend
pnpm bill-detail validate --target ../admin-frontend
```

sync 做两件事：

- 把 shared 源码复制到宿主 `src/modules/bill-detail/shared`。
- 根据 preset 生成 `src/modules/bill-detail/generated`。

真实项目联调时，开发者看到的是宿主项目里的源码，不需要跳到 npm 包里 debug。

### 9.3 发布方式

推荐发布的是“同步 PR”，不是“业务运行时包版本”。

流程：

```text
1. shared 仓库变更
2. shared 测试通过
3. bot/脚本同步到 5 个业务项目
4. 每个业务项目生成一个 PR
5. 各项目跑自己的 build、i18n、lint、页面测试
6. 项目 owner review 生成源码 diff
7. 合并
```

这样既有统一源头，又保留业务项目的可见性和上线节奏。

## 10. Schema 到代码的生成边界

schema 不应该生成所有东西。推荐边界：

| 内容                      | 生成       | 手写                       |
| ------------------------- | ---------- | -------------------------- |
| tab registry              | 是         | 少量 visibility override   |
| product registry          | 是         | 项目特例 override          |
| query params builder 调用 | 是         | API adapter 实现           |
| table column schema       | 是         | 复杂 cell renderer adapter |
| export schema             | 是         | 下载实现 adapter           |
| i18n keys/defaultText     | 是         | 字典翻译内容               |
| UI import scaffold        | 可选       | 实际 UI adapter            |
| route registration        | 可生成建议 | 由宿主项目接入             |
| permission implementation | 否         | 宿主项目                   |
| request implementation    | 否         | 宿主项目                   |
| analytics implementation  | 否         | 宿主项目                   |

核心判断：

> 只要涉及宿主项目基础设施，就不要由 shared 强行生成业务逻辑，只生成接口和装配点。

## 11. 迁移路线

### 阶段 1：建立 shared facts

- 建立 mode/product capability registry。
- 建立 PPIO、Novita、admin-frontend presets。
- 只生成 registry 和文案 key，不改真实页面。
- 用现有审计文档校验每个项目启用能力是否准确。

### 阶段 2：抽 query/filter core

- 先抽 `buildBillDetailListParams`。
- 支持 UTC、UTC+8 两种 timezone policy。
- 支持 endTime 日末包含规则。
- 支持 API Key 2026-01-01 和 31 天限制。

### 阶段 3：抽简单表

优先处理 Summary 和 GenApi：

- 列少。
- formatter 简单。
- 导出容易对齐。
- 适合作为生成链路验证样本。

### 阶段 4：抽 LLM formatter

以 Novita 已拆出的 `billTokenPriceFieldRenderers.tsx` 思路为基础，沉淀：

- token usage formatter。
- Prompt Cache formatter。
- multimodal formatter。
- tiered price formatter。
- export formatter。

### 阶段 5：抽 Aggregated Billing

处理 `PurcherTable` / `APIKeyTable`：

- by creator。
- by API key。
- team/member resolver。
- API Key date validation。

### 阶段 6：抽 Monthly / Enterprise

最后处理：

- monthly GPU/storage/bare metal/image。
- enterprise saving plan。
- 企业可见性和团队可见性外置为 adapter/preset。

## 12. 最终判断

每个项目独有但属于 bill-detail 领域的能力，建议进入 shared 统一管理，用 capability plugin + project preset 控制展示不展示。

每个项目独有且属于宿主基础设施的能力，继续留在业务项目，通过 adapter 暴露给 shared 使用。

schema 应由 shared 统一维护，业务项目通过 preset 和 overrides 参与选择，而不是直接分叉 schema。

shared 独立包的价值是开发工具、校验工具、同步工具和 playground，不是运行时黑盒业务组件。

`components.json` 可以作为 UI adapter scaffold 的输入，但不能替代 business schema。真正的组件替换依赖 `uiAdapter`，真正的宿主能力依赖 `api/i18n/permission/member/analytics/timezone/money` 等 adapter。

这个方案的本质是：

> 用工程能力把统一业务源码“生成并落地”到每个项目，而不是用 npm 包把业务逻辑“封装并隐藏”起来。
