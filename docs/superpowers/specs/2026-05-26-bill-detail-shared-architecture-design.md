# Bill Detail Shared Source Architecture Design

> 日期：2026-05-26
> 范围：5 个 git 仓库、6 个项目部署（3 个网站 + 3 个管理后台，PPIO 与 Novita 管理后台共用 admin-frontend 仓库）
> 项目清单与现状逐项明细以 [BILL_DETAIL_MODULE_AUDIT.md](../../../BILL_DETAIL_MODULE_AUDIT.md) 为准。
> 关联文档：[BILL_DETAIL_SHARED_SOURCE_PROPOSAL.md](../../../BILL_DETAIL_SHARED_SOURCE_PROPOSAL.md)

## 1. 背景与目标

### 1.1 现状

`bill-detail` / `customer-bill-new` 模块在 5 个 git 仓库中以拷贝形式存在，每次需求变更（新增产品、修改列、调整 query、改文案）都要在 5 个仓库分别动手。技术栈与多语言实现进一步加剧分叉，下表为代表性样本（完整项目清单见审计文档）：

| 项目                          | 技术栈       | i18n 实现                                       |
| ----------------------------- | ------------ | ----------------------------------------------- |
| novita-home                   | Next.js      | 编译期源代码扫描（i18nMode: `literal-seed`）    |
| ppio-home                     | Next.js      | dict 注入（i18nMode: `dict-object`）            |
| jiekou-home                   | Next.js      | dict 注入（i18nMode: `dict-object`）            |
| admin-frontend (PPIO admin)   | Vite + React | react-i18next 全局 `t`（i18nMode: `runtime-t`） |
| admin-frontend (Novita admin) | Vite + React | react-i18next 全局 `t`（i18nMode: `runtime-t`） |

PPIO/Novita admin 共享同一个 admin-frontend 仓库，按 brand 分别 `VITE_BRAND=ppio|novita pnpm build` 出包，路由侧通过 vite alias 锁定 active module（详见 §4.2）。其余管理后台部署及对应仓库以审计文档为准，本方案对所有 5 个仓库一视同仁。

### 1.2 目标

> 改一处 shared 源码，五个仓库通过同步落地各自源代码，每个项目按自己的 i18n / 构建 / 路由 / 权限流程跑通。

具体：

- **业务事实集中**：账单产品、列、filter、query 规则、export schema 由 shared 唯一维护
- **源代码同步**，不做运行时 npm 黑盒（多语言扫描需要看到源码）
- **三种 i18n 输出**：novita-home `literal-seed`，ppio-home / jiekou-home `dict-object`，admin-frontend 双 preset `runtime-t`，由 preset 选择
- **业务项目手动 pull**：节奏由各项目 owner 控制
- **工具链尽量轻**：不打 npm 包、不引入 bundler、用 tsx 直跑 TS
- **AI 不参与翻译**：字典翻译走各项目原有流程

### 1.3 非目标

- 不替换业务项目的路由、状态管理、请求封装、权限系统
- 不强行统一 UI 组件库（AntD vs shadcn 由 adapter 承接）
- 不把 i18n 字典上交到 shared 仓库
- 不做运行时业务包发布（只发布 sync 工具用的脚本，可选）

## 2. 整体架构

### 2.1 分层

```
┌─────────────────────────────────────────────────────────┐
│  bill-detail-shared (独立 git 仓库)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ capabilities/  modes、products、plugin             │ │
│  │ schemas/       capability / preset / column zod    │ │
│  │ query/         buildXxxParams                      │ │
│  │ formatters/    money / token / period              │ │
│  │ export/        workbook builder                    │ │
│  │ hooks/         useBillDetailQuery 等(纯函数+adapter)│ │
│  │ presets/       ppio-home / novita-home / ...       │ │
│  │ templates/     codegen 模板                         │ │
│  │ tools/         CLI: sync / dev / diff              │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │  manual pull (script)
        ┌─────────────────┼─────────────────────────┐
        ▼                 ▼                         ▼
┌───────────────┐  ┌───────────────┐       ┌───────────────────┐
│ novita-home   │  │ ppio-home     │  ...  │ admin-frontend    │
│               │  │               │       │ ┌──────────────┐ │
│ src/modules/  │  │ src/modules/  │       │ │ ppio-admin    │ │
│  bill-detail/ │  │  bill-detail/ │       │ │ preset 文件夹 │ │
│   shared/     │  │   shared/     │       │ ├──────────────┤ │
│   generated/  │  │   generated/  │       │ │ novita-admin  │ │
│   adapters/   │  │   adapters/   │       │ │ preset 文件夹 │ │
│   overrides/  │  │   overrides/  │       │ └──────────────┘ │
└───────────────┘  └───────────────┘       └───────────────────┘
```

### 2.2 四类代码

| 类别         | 谁写         | 是否手改   | 谁同步            |
| ------------ | ------------ | ---------- | ----------------- |
| `shared/`    | shared 仓库  | 不手改     | CLI sync 复制     |
| `generated/` | codegen 产出 | 不手改     | CLI generate 产出 |
| `adapters/`  | 业务项目     | 手写       | 业务项目自己维护  |
| `overrides/` | 业务项目     | 手写（少） | 业务项目自己维护  |

`shared/` + `generated/` 头部都打 manifest 注释：

```ts
// @bill-detail-managed
// source: bill-detail-shared@a1b2c3d
// preset: ppio-admin
// editPolicy: do-not-edit-here
```

CI 校验这两个目录的内容必须等于按当前 manifest 重新生成的结果。

### 2.3 shared 内容契约（no tsx / no UI / no React render）

shared 仓库**不包含任何 UI 渲染代码**。文件层面是硬约束，CI 用 lint 规则强制：

| 内容                                                                            | shared 是否允许                                  |
| ------------------------------------------------------------------------------- | ------------------------------------------------ |
| `.ts` 配置定义（capability / preset / schema）                                  | ✅ 唯一业务事实源                                |
| `.ts` 纯函数（query / formatter / validator / transformer）                     | ✅ 无副作用、无 DOM                              |
| `.ts` codegen emit 函数（产出 .tsx 字符串）                                     | ✅ 输出代码                                      |
| `.ts` 类型与契约（adapter interface、IR 类型）                                  | ✅ 描述宿主能力                                  |
| 引用 `react` 的 state primitive（useState / useEffect / useMemo / useCallback） | ⚠️ 仅 `hooks/` 目录允许，禁止其它任何 react 引用 |
| `.tsx` / 任何 JSX                                                               | ❌ 渲染全部在业务项目                            |
| `import React from 'react'`（用于 JSX 命名空间）                                | ❌                                               |
| `import { ... } from 'antd' / 'shadcn' / 'lucide-react'`                        | ❌ UI 库只能在业务项目 adapter                   |
| DOM API（document / window / fetch）                                            | ❌ 浏览器副作用禁止                              |
| 业务项目路径（`@/...`、`~/...`）                                                | ❌ shared 不知道宿主 alias                       |
| 网络请求实现                                                                    | ❌ 通过 adapter.api 注入                         |
| i18n 实际调用                                                                   | ❌ 通过 adapter.i18n 注入                        |
| toast / modal 等副作用 UI                                                       | ❌ 通过 adapter 注入                             |

shared 一句话：**配置 DSL + 业务纯函数 + codegen kit + 类型契约**。

### 2.4 实际写法对照

下面是 shared 文件的真实形状（没有任何 .tsx）。

**capability 定义**（纯数据）：

```ts
// bill-detail-shared/src/capabilities/products/apiKey.ts
import { defineProduct } from "../../schemas/capability.schema";

export const apiKeyProduct = defineProduct({
  productKey: "api_key",
  parentMode: "MultiDimension",
  labels: {
    tab: {
      messageId: "billingDetail.products.apiKey.tab",
      defaults: { en: "By API Key", zh: "按 API Key" },
    },
  },
  columns: [
    {
      id: "apiKeyName",
      messageId: "billingDetail.products.apiKey.col.name",
      defaults: { en: "API Key Name", zh: "API Key 名称" },
      accessor: "api_key_name",
      kind: "text",
    },
    {
      id: "amount",
      messageId: "billingDetail.products.apiKey.col.amount",
      defaults: { en: "Amount", zh: "金额" },
      accessor: "amount",
      kind: "money",
    },
  ],
  filters: [
    { id: "dateRange", kind: "date-range" },
    { id: "apiKey", kind: "select", source: "apiKeyOptions" },
  ],
  api: { list: "billDetailApiKey" },
  rules: { dateLowerBound: "2026-01-01", maxRangeDays: 31 },
  exportColumns: [
    /* ... */
  ],
});
```

**业务纯函数**（query / formatter）：

```ts
// bill-detail-shared/src/query/buildApiKeyParams.ts
import type {
  ApiKeyQueryInput,
  ApiKeyApiParams,
} from "../schemas/query.schema";
import type { TimezoneAdapter } from "../adapters/timezone.contract";

export function buildApiKeyParams(
  input: ApiKeyQueryInput,
  tz: TimezoneAdapter,
): ApiKeyApiParams {
  return {
    start_time: tz.toQueryTimestamp(input.range.start, "start"),
    end_time: tz.toQueryTimestamp(input.range.end, "end"),
    api_key: input.apiKey ?? undefined,
    page: input.page,
    page_size: input.pageSize,
  };
}
```

```ts
// bill-detail-shared/src/formatters/llmTokenFields.ts
export interface LlmTokenFields {
  input: number;
  output: number;
  cached?: number;
}
export interface TokenCellViewModel {
  primary: string;
  tooltip: string;
}

export function formatTokenUsage(row: LlmTokenFields): TokenCellViewModel {
  const total = row.input + row.output;
  const tooltip =
    row.cached != null
      ? `Input ${row.input} · Output ${row.output} · Cache hit ${row.cached}`
      : `Input ${row.input} · Output ${row.output}`;
  return { primary: `${total}`, tooltip };
}
```

注意：formatter 返回 view model（字符串、数字、枚举），**不返回 JSX**。具体怎么 render hover card 是业务项目 adapter 的事。

**adapter 契约**（仅类型，不实现）：

```ts
// bill-detail-shared/src/adapters/ui.contract.ts
export interface UiAdapter {
  renderTokenCell(value: TokenCellViewModel): unknown; // 业务项目返回 ReactNode
  renderMoneyCell(value: { amount: string; currency: string }): unknown;
  renderTabs(props: TabsProps): unknown;
  renderTable(props: TableProps): unknown;
  renderPagination(props: PaginationProps): unknown;
}
```

shared 用 `unknown` 而不是 `ReactNode`，因为 shared 不引 react 命名空间。业务项目 adapter 实现时声明返回 `ReactNode`，TS 在业务项目侧检查。

**codegen emit 函数**（纯字符串）：

```ts
// bill-detail-shared/src/templates/tables.generated.tsx.emit.ts
import type { EmitCtx } from "../tools/codegen/emit";
import { emitHeader, emitColumns, emitImports } from "../tools/codegen/parts";

export function emitTablesGenerated(ctx: EmitCtx): string {
  return [
    emitHeader(ctx), // @bill-detail-managed 注释
    emitImports(ctx, ["apiKeyProduct"]), // 按 preset 启用列表 import
    "",
    `export const apiKeyColumns = ${emitColumns(ctx, "api_key")};`,
    `export const apiKeyTabLabel = ${emitLabel(ctx, "api_key", "tab")};`,
  ].join("\n");
}
```

shared 全程操作字符串，最后 prettier 格式化、ts-morph 校验、原子写入业务项目 `generated/tables.generated.tsx`。**真正的 .tsx 文件只在业务项目落地**。

**业务项目 adapter 实现**（这里才有 .tsx）：

```tsx
// admin-frontend/src/modules/bill-detail-ppio/adapters/ui.tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Table, Pagination, Tabs } from "antd";
import type { UiAdapter } from "../shared/adapters/ui.contract";

export const uiAdapter: UiAdapter = {
  renderTokenCell({ primary, tooltip }) {
    return (
      <HoverCard>
        <HoverCardTrigger>{primary}</HoverCardTrigger>
        <HoverCardContent>{tooltip}</HoverCardContent>
      </HoverCard>
    );
  },
  renderMoneyCell({ amount, currency }) {
    return (
      <span className="tabular-nums">
        {currency} {amount}
      </span>
    );
  },
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

**业务项目装配点**（生成的薄壳）：

```tsx
// admin-frontend/src/modules/bill-detail-ppio/generated/ApiKeyTable.generated.tsx
// @bill-detail-managed
// source: bill-detail-shared@a1b2c3d  preset: ppio-admin  editPolicy: do-not-edit-here
import { apiKeyColumns, apiKeyTabLabel } from "./tables.generated";
import { useApiKeyQuery } from "../shared/hooks/useApiKeyQuery";
import { uiAdapter } from "../adapters/ui";
import { apiAdapter } from "../adapters/api";

export function ApiKeyTable(props: ApiKeyTableProps) {
  const { rows, loading, page, pageSize, total, setPage } = useApiKeyQuery(
    props.input,
    { api: apiAdapter },
  );
  const columns = apiKeyColumns.map((c) => ({
    ...c,
    render:
      c.kind === "money"
        ? (v: unknown) =>
            uiAdapter.renderMoneyCell({ amount: String(v), currency: "CNY" })
        : undefined,
  }));
  return (
    <>
      {uiAdapter.renderTable({ rowKey: "id", loading, columns, rows })}
      {uiAdapter.renderPagination({ page, pageSize, total, onChange: setPage })}
    </>
  );
}
```

这段 .tsx 是 codegen 产出，落到业务项目里。shared 里只存在它的 emit 函数（字符串）。

### 2.5 通用化：其他模块如何套用本方案

bill-detail 因为有清晰的"模式 × 产品 × 列"分解，capability schema 长得整齐。其他模块（设置中心、导出中心、自定义表单、上传中心）不一定这么结构化，但同一套方法仍然适用——schema 形状不同而已。

**通用化四步：**

| 步骤               | 做什么                                                                                | 产出                                    |
| ------------------ | ------------------------------------------------------------------------------------- | --------------------------------------- |
| 1. 抽 domain       | 列出该模块跨项目共同的"事实"（数据 + 规则 + 文案 key），剔除项目独有 UI / 路由 / 权限 | 一份手稿                                |
| 2. 定义 schema     | 把事实写成 zod schema，预留 preset 覆盖位                                             | `src/schemas/*.ts`                      |
| 3. 抽业务函数      | query / validate / transform / format 全部抽成纯函数                                  | `src/{query,formatters,validators}/...` |
| 4. 写 codegen emit | emit 函数读 schema + preset + components.json，产出 .tsx 字符串                       | `src/templates/*.emit.ts`               |

shared 仓库的目录骨架对任何模块都长一样：

```text
src/
  schemas/           ← zod + 类型
  capabilities/      ← schema 的具体实例（业务事实）
  query|formatters|validators|transformers/  ← 纯函数
  templates/         ← emit 函数（产出字符串）
  presets/           ← 项目选择
  hooks/             ← 纯函数 + adapter 注入（允许 react state primitive，禁止 JSX）
  adapters/          ← 契约类型（不含实现）
tools/cli/           ← sync / dev / diff
```

**示例 A：导出中心模块**

schema 不是 capability/product，而是 `ExportRecipe`：

```ts
// export-center-shared/src/schemas/exportRecipe.schema.ts
export const ExportRecipeSchema = z.object({
  recipeId: z.string(),
  source: z.object({ api: z.string(), params: z.record(z.unknown()) }),
  columns: z.array(ExportColumnSchema),
  rateLimit: z
    .object({ maxConcurrent: z.number(), maxPerHour: z.number() })
    .optional(),
  permission: z.string().optional(),
  labels: LabelBundleSchema,
});
```

preset 决定该项目启用哪些 recipeId、覆盖哪些列。codegen 产出"导出任务定义 + 一段执行 hook + 一个触发按钮 .tsx"。UI 组件全部走 components.json 映射到业务项目自己的 Button / Dialog / Progress。

**示例 B：高自由度模块（自定义表单 / 向导）**

业务事实没法用枚举列表表达，走 IR（intermediate representation）路线，shared 定义 IR 树：

```ts
// form-shared/src/schemas/formIR.schema.ts
export type FormNode =
  | {
      kind: "input";
      field: string;
      rules: ValidationRule[];
      labels: LabelBundle;
    }
  | {
      kind: "select";
      field: string;
      options: OptionSource;
      labels: LabelBundle;
    }
  | { kind: "group"; titleKey: string; children: FormNode[] }
  | {
      kind: "conditional";
      when: { field: string; equals: unknown };
      then: FormNode[];
    };

export const FormRecipeSchema = z.object({
  formId: z.string(),
  nodes: z.array(z.lazy(() => FormNodeSchema)),
  submit: z.object({ api: z.string(), confirmKey: z.string().optional() }),
});
```

shared 里写一个 IR walker 把 FormRecipe + preset 转成 codegen 字符串，业务项目 adapter 提供 `<Input>` `<Select>` `<Form.Group>` 的具体实现。同一套 IR 在 PPIO 渲染 AntD，在 Novita 渲染 shadcn，业务项目自己接 components.json 即可。

### 2.6 选用判据：什么模块值得套用

| 信号                                   | 是否值得                           |
| -------------------------------------- | ---------------------------------- |
| 多个项目（≥3）存在拷贝                 | ✅                                 |
| 业务事实清晰（能抽出 schema 或 IR）    | ✅                                 |
| 每次需求要同时改多个项目               | ✅                                 |
| 项目差异在"启用 / 顺序 / 取值范围"层面 | ✅                                 |
| 项目差异在"完全不同的 UX / 交互流"     | ❌ 硬接会很糟                      |
| 模块逻辑高度依赖宿主全局状态           | ⚠️ 先把宿主依赖抽到 adapter 才能接 |
| 模块本身在快速迭代实验中               | ❌ 等稳定再接                      |
| 跨项目的不一致是有意为之（产品决策）   | ❌ 别强行统一                      |

**核心判据**：如果你能用一句话写出"这个模块跨项目共同的事实是 X"，就值得套；如果只能说"它们都是表单"或"它们都是页面"，那是 UI 相似不是业务相似，不要套。

## 3. shared 仓库工程

### 3.1 目录

shared 源码拆成 `core/` 与 `react/` 两层：

- `core/` 是纯 TypeScript，**禁止任何 `import 'react'` / JSX / DOM**，仅依赖 zod 等无副作用 lib。CI lint 规则强制隔离。
- `react/` 允许 `import { useState, useEffect, useMemo, useCallback } from "react"` 但仍**禁止 JSX**，用来承载 hook 形态的纯函数（如分页、查询编排）。
- `templates/` 是 emit 函数，跨两层产出字符串。

```text
bill-detail-shared/
  src/
    core/                               # 纯 TS，跨 React 版本无关
      capabilities/
        modes.ts                        # OnDemand / Monthly / MultiDimension / Enterprise
        products/
          summary.ts
          llm.ts
          llmDedicatedEndpoint.ts       # Novita-only product，capability 在 shared
          bareMetalMonthly.ts           # PPIO-only product
          imageMonthly.ts               # Novita-only product
          webSearch.ts                  # PPIO-only product
          ...
      schemas/
        capability.schema.ts            # zod
        preset.schema.ts
        components.schema.ts
        config.schema.ts                # bill-detail.config.ts
      query/
        buildBillDetailListParams.ts
        buildMonthlyParams.ts
        buildApiKeyParams.ts
        buildMemberParams.ts
        buildEnterpriseParams.ts
      formatters/
        money.ts
        billingPeriod.ts
        llmTokenFields.ts
        storageUsage.ts
      export/
        buildWorkbookRows.ts
      adapters/                         # 仅类型契约，不含实现
        ui.contract.ts
        api.contract.ts
        i18n.contract.ts
        money.contract.ts
        timezone.contract.ts
        toast.contract.ts
        permission.contract.ts
        member.contract.ts
        featureFlag.contract.ts
      presets/
        ppio-home.ts
        novita-home.ts
        jiekou-home.ts
        ppio-admin.ts
        novita-admin.ts
    react/                              # 允许 react state primitive，禁 JSX
      hooks/
        useBillDetailQuery.ts           # useState/useEffect + adapter 注入
        useClientPagination.ts
    templates/
      moduleEntry.tsx.emit.ts           # 全部为 .ts，emit 函数返回字符串
      registry.generated.ts.emit.ts
      tables.generated.tsx.emit.ts
      messagesManifest.json.emit.ts
      messagesSeed.generated.ts.emit.ts
  tools/
    cli/
      bill-detail.ts                    # 入口，tsx 直跑
      commands/
        sync.ts
        dev.ts
        diff.ts
    codegen/
      emit.ts                           # TS function → string
      formatTs.ts                       # prettier
      validateTs.ts                     # ts-morph
      i18nRuntimeT.ts                   # runtime-t 模式
      i18nDictObject.ts                 # dict-object 模式
      i18nLiteralSeed.ts                # literal-seed 模式
  fixtures/
    {capability}/
      params.snapshot.json
      columns.snapshot.json
      export.snapshot.xlsx.json
      formatter.edge-cases.json
  playground/                           # 可选，验证用
  package.json                          # type: module，依赖 zod / ts-morph / prettier / chokidar / tsx
  tsconfig.base.json                    # 共享基础
  tsconfig.core.json                    # core/ 不引 dom / react lib
  tsconfig.react.json                   # react/ 引 react，禁 jsx
  oxlint.json                           # 规则强制 core/ 不依赖 react
  eslint.config.js
```

### 3.1.1 源码同步约束

shared 源码会被复制到 5 个业务项目，因此必须满足"在任意宿主环境都能编译运行"：

| 约束                                                              | 说明                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| 不依赖 shared 仓库 tsconfig path alias                            | shared 内部互相 import 用相对路径，不使用 `@/...`       |
| 不使用 Node-only API（fs / path / process）                       | 这些只能出现在 `tools/`                                 |
| 不依赖测试工具（vitest / jest）                                   | 测试仅在 shared 仓库内运行，不进入业务项目同步集        |
| `core/` 不引 react                                                | lint 强制                                               |
| `core/` / `react/` 不引 UI 库、不引 i18n 库                       | lint 强制                                               |
| React 版本敏感 API（concurrent features）禁止                     | 业务项目 React 版本可能不同（next 15、vite + react 18） |
| 同步目标只包含 `core/`、`react/`、`templates/` 不需要的运行时部分 | `tools/`、`fixtures/`、`playground/` 永不同步到业务项目 |

sync 命令产生的业务项目 `shared/` 目录：

```text
src/modules/bill-detail/shared/
  core/         ← 来自 shared 仓库 src/core/
  react/        ← 来自 shared 仓库 src/react/
```

`templates/` 不进入业务项目（emit 函数只在 shared 仓库 CLI 执行时使用，产物已经是业务项目的 `generated/`）。

### 3.1.2 依赖契约与 TS 正确性

shared 源码同步到 5 个业务项目后，会被各业务项目自己的 `tsc` 重新编译；如果 shared 假定的 react 版本、第三方运行时依赖与业务项目实际版本不一致，会在业务项目里报类型错误。为此 shared 与业务项目之间用 `peerDependencies` 建立一份显式契约。

**shared 仓库 `package.json`**：

```json
{
  "name": "bill-detail-shared",
  "private": true,
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "react": "^18.3.0",
    "zod": "^3.23.0",
    "typescript": "^5.4.0"
  }
}
```

`peerDependencies` 是契约（业务项目必须满足），`devDependencies` 是 shared 自己开发时跑 tsc / fixture 的最低版本。运行时业务项目从自身 `node_modules` 解析 react / zod，shared 不会带额外副本。

**CLI sync 前置依赖检查**：

`bill-detail sync` 执行第一步就读业务项目 `package.json`，比对 shared 的 peer 范围；不满足直接拒绝写文件，避免业务项目编译期才暴露问题。

```text
$ pnpm bill-detail sync
✓ Loaded config (preset: ppio-admin)
✗ Dependency contract violated:
  - business project missing zod (shared peer-dep ^3.22.0)
  - business project react@17.0.2 not in shared peer range ^18 || ^19
  Resolve with: pnpm add zod@^3.23.0
  Aborted before any file written.
```

**三段 tsc 校验**：

| 阶段           | 跑什么                                                                            | 防什么                                                                      |
| -------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| shared 仓库 CI | `tsc -p tsconfig.core.json` + `tsc -p tsconfig.react.json`                        | shared 自身类型错；`core/` 不引 react/dom lib，`react/` 不允许 JSX          |
| sync 命令尾段  | `tsc --noEmit` 业务项目内 `src/modules/bill-detail/`（可选 `--paths` 仅扫该目录） | sync 后立刻发现宿主 react / zod 版本与 shared 期望不兼容，sync 步骤显式失败 |
| 业务项目 CI    | `pnpm typecheck`                                                                  | 业务项目其他代码引用 `bill-detail` 入口的类型回归                           |

**React 版本矩阵 CI**：

shared 仓库 CI 跑两组 typecheck，分别 install `react@18` 和 `react@19`，确保 shared 同时兼容两侧。jiekou-home / novita-home / ppio-home 用 next 15 + react 19，admin-frontend 用 vite + react 18，shared 不能用任意一侧的版本独有 API。

**禁用清单**（lint 规则 + tsc 校验交叉拦下）：

- 禁 React concurrent feature（`useTransition`、`useSyncExternalStore` 等版本敏感 API）—— 用 useState/useEffect 即可
- 禁 React Server Components（Next App Router 用，admin-frontend Vite 不支持）
- 禁 Node 内置模块（`node:fs` / `node:path`）出现在 `core/` `react/`
- 禁第三方运行时依赖未在 peerDependencies 声明
- 禁 `import "@/..."` shared tsconfig path alias

业务项目侧不需要为 shared 单独配 tsconfig path，shared 内部相对路径 import 即可在业务项目原 tsconfig 下被正确解析。

### 3.2 工具栈

| 用途           | 选型                           | 备注                                         |
| -------------- | ------------------------------ | -------------------------------------------- |
| TS 执行        | tsx                            | 不打包，CLI 直跑源码                         |
| Schema 校验    | zod                            | capability / preset / components.json        |
| AST 校验       | ts-morph                       | 生成后回检引用、import、未使用导出           |
| 格式化         | prettier                       | 仅生成产物的最终格式化                       |
| Linter（主）   | oxlint                         | 默认更快                                     |
| Linter（兜底） | eslint + @oxlint/eslint-plugin | 复用 oxlint 规则，覆盖 oxlint 暂不支持的规则 |
| 文件监听       | chokidar                       | dev 模式                                     |
| 类型检查       | tsc --noEmit                   | shared 自身 + 生成产物可选                   |

不引入 tsup / rollup / esbuild。CLI 通过业务项目的 `node_modules/.bin/bill-detail`（指向 tsx + entry）或 bootstrap 脚本调用。

### 3.3 capability 定义

每个产品就是一个 `defineProduct` 调用：

```ts
// capabilities/products/apiKey.ts
export const apiKeyProduct = defineProduct({
  productKey: "api_key",
  parentMode: "MultiDimension",
  labels: {
    tab: {
      messageId: "billingDetail.products.apiKey.tab",
      defaults: { en: "By API Key", zh: "按 API Key" },
    },
  },
  filters: [
    { id: "dateRange", kind: "date-range" },
    { id: "apiKey", kind: "select", source: "apiKeyOptions" },
  ],
  columns: [
    {
      id: "apiKeyName",
      messageId: "billingDetail.products.apiKey.col.name",
      defaults: { en: "API Key Name", zh: "API Key 名称" },
      accessor: "api_key_name",
      kind: "text",
    },
    // ...
  ],
  api: { list: "billDetailApiKey" },
  rules: {
    dateLowerBound: "2026-01-01",
    maxRangeDays: 31,
  },
  exportColumns: [
    /* ... */
  ],
});
```

跨项目独有的产品（Novita-only `llm_dedicated_endpoint`、PPIO-only `bare_metal`）也住在 shared，由各项目 preset 的 `enabledProducts` 决定是否启用。

### 3.4 preset

```ts
// presets/ppio-admin.ts
export const ppioAdminPreset = definePreset({
  projectId: "ppio-admin",
  i18nMode: "runtime-t",
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
});
```

```ts
// presets/novita-home.ts
export const novitaHomePreset = definePreset({
  projectId: "novita-home",
  i18nMode: "literal-seed", // ⬅️ 唯一启用 literal-seed 的项目
  enabledModes: ["OnDemand", "Monthly", "MultiDimension"],
  enabledProducts: {
    /* ... */
  },
  timezonePolicy: "UTC",
  currency: "USD",
});
```

`i18nMode` 是 codegen 行为开关，下文 §4 详述。

## 4. 业务项目落地

### 4.1 通用结构

```text
src/modules/bill-detail/
  shared/                         # CLI sync 复制（不手改）
    core/                         # 纯 TS
      capabilities/
      schemas/
      query/
      formatters/
      export/
      adapters/                   # 仅类型契约
      presets/
    react/                        # 允许 react state primitive，禁 JSX
      hooks/
  generated/                      # CLI generate 产出（不手改）
    registry.generated.ts
    routes.generated.ts
    tables.generated.tsx
    messages-manifest.json        # runtime-t / dict-object 模式
    messages-seed.generated.ts    # 仅 literal-seed 模式
    manifest.generated.json
  adapters/                       # 业务项目手写，统一 re-export
    index.ts                      # 唯一对外口子（详见 §5.1）
    ui.tsx
    api.ts
    i18n.ts
    permission.ts
    member.ts
    money.ts
    timezone.ts
    toast.ts
    featureFlag.ts
  overrides/                      # 业务项目手写（少）
    projectRules.ts
    customColumns.tsx
  index.tsx                       # 业务项目装配点（薄）
```

### 4.2 admin-frontend 双 preset

PPIO + Novita admin 共用一个仓库，但生成两套源码到不同物理目录，运行时只在路由层做 lazy 分流，**不在生成代码内部做 brand 分支**。

```ts
// admin-frontend/bill-detail.config.ts
export default {
  shared: {
    repo: "git@github.com:org/bill-detail-shared.git",
    ref: "main",
    cacheDir: ".cache/bill-detail-shared",
  },
  presets: [
    {
      name: "ppio-admin",
      generateTo: "src/modules/bill-detail-ppio",
      componentsFile: "bill-detail.components.ppio.json",
    },
    {
      name: "novita-admin",
      generateTo: "src/modules/bill-detail-novita",
      componentsFile: "bill-detail.components.novita.json",
    },
  ],
};
```

路由层不依赖运行时分支判断，**改用构建期 alias 把 active module 固定为单一目录**，确保部署产物只包含当前 brand：

```ts
// admin-frontend/vite.config.ts
import { defineConfig, loadEnv } from "vite";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const brand =
    env.VITE_BRAND === "ppio" ? "bill-detail-ppio" : "bill-detail-novita";
  return {
    resolve: {
      alias: {
        "@/modules/bill-detail-active": path.resolve(
          __dirname,
          `src/modules/${brand}`,
        ),
      },
    },
  };
});
```

```tsx
// admin-frontend/src/router/bill-detail.tsx
const BillDetail = lazyWithRetry(() => import("@/modules/bill-detail-active"));
```

部署 PPIO 时 `VITE_BRAND=ppio pnpm build`，部署 Novita 时 `VITE_BRAND=novita pnpm build`。路由永远只 import 一个 active module，rollup 不需要依赖 `import.meta.env.isZh` 字面量替换 + 分支消除两步配合（实测在嵌套 dynamic import 中并不总是成立）。两个目录 `bill-detail-ppio` / `bill-detail-novita` 仍然物理保留在源码中，便于本地调试切换，但产物里只剩一个。

如果同一份产物必须同时承载两个 brand（极少见，例如运行时账号切换），再退化到 lazy 条件 import，并接受可能两侧都进 bundle。本方案默认按 brand 拆构建产物。

### 4.3 单 preset 项目（其余 4 个）

```ts
// novita-home/bill-detail.config.ts
export default {
  shared: { repo, ref: "main", cacheDir: ".cache/bill-detail-shared" },
  preset: "novita-home",
  generateTo: "src/modules/bill-detail",
  componentsFile: "bill-detail.components.json",
};
```

### 4.4 本地 dev 覆盖

```ts
// bill-detail.config.local.ts (gitignored)
export default {
  dev: {
    sharedLocalPath: "../../bill-detail-shared", // 直接指向本地 shared 工作区
  },
};
```

存在该文件时，CLI 跳过 git clone，直接 watch 本地路径。

## 5. components.json：仅 UI scaffold

`bill-detail.components.json` **只描述 UI 组件、图标的 import 映射**，不再承担其他宿主能力的入口。这样做的原因：之前把 transport / i18n / money / timezone / toast 都塞进 `components.json` 会让它退化成第二套 adapter 中心，与 `adapters/` 目录职责重叠。

### 5.0 shared 用到的全局组件清单

shared codegen 产出的 tsx 实际只会用到这一组组件。其余视觉外壳（页面 padding / Card 边框 / 面包屑 / 侧边栏）在业务项目 `index.tsx` 装配入口手写，shared 不感知。

| 组件                             | 用途                                          | adapter 必选/可选 |
| -------------------------------- | --------------------------------------------- | ----------------- |
| Tabs                             | 一级 mode / 二级 product                      | 必选              |
| Table                            | 列表展示                                      | 必选              |
| Pagination                       | 分页                                          | 必选              |
| DateRangePicker                  | 时间筛选                                      | 必选              |
| Select                           | 产品 / 团队 / API key 下拉                    | 必选              |
| Empty                            | 空数据                                        | 必选              |
| Button                           | 导出 / 刷新                                   | 必选              |
| Tooltip / HoverCard              | 列内字段说明（LM token / prompt cache）       | 必选              |
| Spinner / Loading                | 加载态（也可由 Table loading 内嵌）           | 必选              |
| Skeleton / Modal / Drawer / Card | 当前 bill-detail 不用，未来若引入按 §5.4 流程 | 可选              |

design-token 一致性（颜色 / 间距 / 圆角 / 字体）属于另一项跨项目独立工作流，不在本 spec 范围；shared 当前不持有视觉值，业务项目各自维持现状即可。

### 5.0.1 components.json 示例

```json
{
  "ui": {
    "Tabs": { "from": "@/components/ui/tabs", "named": "Tabs" },
    "Table": { "from": "antd", "named": "Table" },
    "Button": { "from": "antd", "named": "Button" },
    "DateRangePicker": {
      "from": "@/components/ui/date-range-picker",
      "default": true
    },
    "Pagination": { "from": "antd", "named": "Pagination" },
    "Empty": { "from": "antd", "named": "Empty" },
    "HoverCard": { "from": "@/components/ui/hover-card", "named": "HoverCard" }
  },
  "icons": {
    "Info": { "from": "lucide-react", "named": "Info" },
    "ChartPie": { "from": "lucide-react", "named": "ChartPie" }
  }
}
```

字段设计原则：

- `from` 是宿主项目能直接 resolve 的模块路径（alias 或 npm 包名都行）
- `named` 或 `default` 二选一
- 同一名字在 codegen 中是稳定的引用，新增组件需要先在 components.json 注册

`components.json` 用 zod 校验，缺字段、字段类型错误立刻报错。codegen 用它来生成 `import` 语句的右边——例如 `renderTable` adapter 实现里要 `import { Table } from "antd"`，这句的来源就是 components.json。但具体哪些组件被 import、按什么 props 装配，仍由 adapter 实现自己决定，codegen 不直接 emit 装配代码到 components.json 字段上。

### 5.1 宿主能力统一走 adapters/index.ts

UI scaffold 之外的所有宿主能力（API transport、i18n、money、timezone、toast、permission、member、analytics、featureFlag）都通过业务项目 `adapters/index.ts` 显式导出。codegen / shared hooks **只 import 这一个口子**，不直接 import 宿主工具：

```ts
// 业务项目 src/modules/bill-detail/adapters/index.ts
export { uiAdapter } from "./ui";
export { apiAdapter } from "./api";
export { i18nAdapter } from "./i18n"; // resolveMessage / runtime-t entry
export { moneyAdapter } from "./money";
export { timezoneAdapter } from "./timezone";
export { toastAdapter } from "./toast";
export { permissionAdapter } from "./permission";
export { memberAdapter } from "./member";
export { featureFlagAdapter } from "./featureFlag";

export type BillDetailAdapters = {
  ui: UiAdapter;
  api: ApiAdapter;
  i18n: I18nAdapter;
  money: MoneyAdapter;
  timezone: TimezoneAdapter;
  toast: ToastAdapter;
  permission: PermissionAdapter;
  member: MemberAdapter;
  featureFlag: FeatureFlagAdapter;
};
```

shared 在契约层（§2.4 `adapters/*.contract.ts`）声明每种 adapter 的接口形状，业务项目实现并通过 `adapters/index.ts` 导出。codegen 产出的装配代码只写：

```tsx
import { uiAdapter, apiAdapter, i18nAdapter } from "../adapters";
```

不出现 `import { Table } from "antd"`、`import { useTranslation } from "react-i18next"` 这种宿主直引。

### 5.2 i18n adapter 与 components.json 的衔接（literal-seed 例外）

`literal-seed` 模式需要 codegen 知道 scanner 的调用形式与 seed 文件位置。这部分配置不属于"UI 组件"，但又是 codegen 的必要输入。处理：放进 `bill-detail.config.ts` 的 `i18n` 段，**不放 components.json**，避免再次扩张 components.json：

```ts
// novita-home/bill-detail.config.ts
export default {
  shared: { repo, ref, cacheDir },
  preset: "novita-home",
  generateTo: "src/modules/bill-detail",
  componentsFile: "bill-detail.components.json",
  i18n: {
    seed: {
      entryFile: "src/modules/bill-detail/generated/messages-seed.generated.ts",
      callShape: "object-literal", // 扫描器识别形式
    },
  },
};
```

### 5.3 新增 UI 组件：必选拦下、可选兜底占位

shared 引入此前没用过的 UI 组件（例如未来要加 Skeleton / Modal）属于一次显式 breaking 扩展，处理流程要求"5 个业务项目要么补 adapter，要么走兜底占位"。两类方法分开管理：

**必选方法（Tabs / Table / Pagination / DateRangePicker / Select / Empty / Button / Tooltip / Spinner）**：

- shared `UiAdapter` 必选 method，业务项目 adapter 缺一就 sync 末段 `tsc --noEmit` 报错（详见 §3.1.2 / §7.2 step 11）
- 永不兜底，因为这些组件缺失会让账单页面无法工作
- 任何变更（加新必选 / 改 props 形状）走 shared 仓库 PR + 5 业务项目同步 PR 的工程节奏

**可选方法（Skeleton / Modal / Drawer / Card / 未来新增）**：

- shared `OptionalUiAdapter` 标 `?` 可选；shared 内部 `tryRender(component, props, fallback)` 包一层
- 业务项目没实现时，shared 走兜底占位 `<PlaceholderRenderer name="Skeleton" />`，渲染结果是一个最小可见的 div，文案为 i18n key `billDetail.placeholder.componentMissing`，hover 显示 `Skeleton not implemented in adapter`
- 业务项目可以分批补 adapter；不影响其它产品功能上线
- CLI 在 sync 时输出 warning 列出业务项目缺哪些 optional method、提示 `pnpm bill-detail scaffold-adapter` 一行生成 stub

```ts
// shared/react/uiAdapter.ts
export interface UiAdapter {
  // 必选
  renderTabs(props: TabsRenderProps): unknown;
  renderTable<R>(props: TableRenderProps<R>): unknown;
  renderPagination(props: PaginationRenderProps): unknown;
  renderDateRangePicker(props: DateRangeRenderProps): unknown;
  renderSelect<V>(props: SelectRenderProps<V>): unknown;
  renderEmpty(props: EmptyRenderProps): unknown;
  renderButton(props: ButtonRenderProps): unknown;
  renderTooltip(props: TooltipRenderProps): unknown;
  renderSpinner(props: SpinnerRenderProps): unknown;
}

export interface OptionalUiAdapter {
  // 可选，缺失走 PlaceholderRenderer
  renderSkeleton?(props: SkeletonRenderProps): unknown;
  renderModal?(props: ModalRenderProps): unknown;
  renderDrawer?(props: DrawerRenderProps): unknown;
  renderCard?(props: CardRenderProps): unknown;
}

export function tryRender<K extends keyof OptionalUiAdapter>(
  adapter: OptionalUiAdapter,
  key: K,
  props: Parameters<NonNullable<OptionalUiAdapter[K]>>[0],
): unknown {
  const fn = adapter[key];
  if (fn) return fn(props as never);
  return renderPlaceholder({ name: key, props });
}
```

scaffold 命令：

```text
$ pnpm bill-detail scaffold-adapter
✓ Detected new optional method: renderSkeleton (added in shared @ a1b2c3d)
  ? Append stub to src/modules/bill-detail/adapters/ui.tsx? (Y/n)
  ✓ Wrote stub. Implementation TODO marker added.
```

shared 不规定具体 props 的物理形状（antd / shadcn / 自研 UI 库 props 不同），那部分留给后续具体场景按需对齐——shared 只负责把"语义化描述"传给 adapter，业务 adapter 自己翻译到目标 UI 库。

## 6. i18n 三模 codegen

业务项目对 i18n 的接入方式并不统一：有的有全局 `t(key)` 调用、有的把字典作为 prop 注入、有的依赖编译期扫描器扫源码 literal。**强行假设统一会破坏宿主原有约定**。codegen 因此支持三种输出形态，由 preset 的 `i18nMode` 字段选择：

| 模式           | 适用项目                                                   | 输出形态                                                                            | 文案来源                          |
| -------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------- |
| `runtime-t`    | ppio-admin / novita-admin（react-i18next 有全局 `t`）      | `t(key)` 调用                                                                       | 项目字典 + messages-manifest 填充 |
| `dict-object`  | ppio-home / jiekou-home（dict 通过 prop 注入，无全局 `t`） | `dict.key` 引用，由装配层注入 dict                                                  | 项目字典 + messages-manifest 填充 |
| `literal-seed` | novita-home（编译期扫源码）                                | UI 走统一 `resolveMessage(messageId)`，同时输出独立 seed 文件承载扫描器要的 literal | resolver + seed 文件              |

三种模式由同一份 capability 产出，不污染 capability schema 本身。

### 6.1 `runtime-t`（admin 两个 preset）

适用宿主提供了全局 `t` 函数（如 react-i18next）：

```tsx
// generated/tables.generated.tsx
import { t } from "@/utils/i18n";

export const apiKeyTabLabel = () => t("billingDetail.products.apiKey.tab");
export const apiKeyColumns = [
  {
    id: "apiKeyName",
    title: () => t("billingDetail.products.apiKey.col.name"),
    accessor: (row) => row.api_key_name,
  },
];
```

同时输出 `messages-manifest.json`，CLI `merge-messages` 把新 key 用 shared defaults 填入项目字典，已存在的 key 不覆盖。

### 6.2 `dict-object`（home 类 dict prop 注入）

宿主没有全局 `t`，dict 通过组件 prop 注入：

```tsx
// generated/tables.generated.tsx
import type { BillDetailDict } from "../shared/i18n/dict.types";

export const buildApiKeyColumns = (dict: BillDetailDict) => [
  {
    id: "apiKeyName",
    title: dict.products.apiKey.col.name,
    accessor: (row) => row.api_key_name,
  },
];
export const buildApiKeyTabLabel = (dict: BillDetailDict) =>
  dict.products.apiKey.tab;
```

装配层从宿主 page-level dict 中切出该模块需要的子树，传入 builder。messages-manifest 同样产出，CLI 把新 key 合并到宿主 dict 文件（按宿主约定的 JSON 树形结构写入）。

### 6.3 `literal-seed`（novita-home 编译期扫描）

novita-home 的扫描器只能识别特定调用形式（实测不一定扫普通 TS 常量赋值），不能把 literal 散在 generated 表里。把 UI 与扫描 seed 分离：

UI 代码走统一 message resolver，所有调用形式可预测、可被白名单扫描或被运行时翻译替换：

```tsx
// generated/tables.generated.tsx
import { resolveMessage as m } from "../shared/i18n/resolveMessage";

export const apiKeyTabLabel = () => m("billingDetail.products.apiKey.tab");
export const apiKeyColumns = [
  {
    id: "apiKeyName",
    title: () => m("billingDetail.products.apiKey.col.name"),
    accessor: (row) => row.api_key_name,
  },
];
```

scanner seed 是独立文件，只承载扫描器要识别的 literal，不参与运行时渲染：

```ts
// generated/messages-seed.generated.ts
// @bill-detail-scanner-seed  do-not-import-at-runtime
export const seed = {
  "billingDetail.products.apiKey.tab": "By API Key",
  "billingDetail.products.apiKey.col.name": "API Key Name",
  "billingDetail.products.apiKey.col.amount": "Amount",
  // ...
};
```

seed 文件的位置、扫描调用形式按 novita-home 现有 scanner 配置定制（在 `bill-detail.components.json` 的 `i18n` 段声明 `scanner.entryFile` / `scanner.callShape`）。CI 跑一次 novita-home 扫描器，断言 seed 中所有 key 都被扫到。

resolver 的运行时实现由项目 adapter 决定：可以是查 dict、可以是返回 seed.{key}、可以是查任何宿主自己的 i18n store。shared 不假设。

### 6.4 codegen 实现要点

```ts
function emitColumnTitle(col: ColumnDef, ctx: EmitCtx): string {
  switch (ctx.i18nMode) {
    case "runtime-t":
      return `() => t(${JSON.stringify(col.messageId)})`;
    case "dict-object":
      return `dict.${col.messageDictPath}`;
    case "literal-seed":
      return `() => m(${JSON.stringify(col.messageId)})`;
  }
}
```

emit 返回字符串 → prettier → ts-morph 校验：

- 所有 import 来自 `components.json` 或 shared 模块
- `runtime-t` 模式禁止 `t(...)` 第二参数（避免污染扫描）
- `dict-object` 模式禁止生成代码里出现裸 literal
- `literal-seed` 模式禁止生成代码里出现裸 literal（literal 只能在 seed 文件）
- 无未使用导出、无 `any` / `@ts-ignore`

### 6.5 dead key 检测

每次 generate 后，CLI 对比 `messages-manifest.json` 的旧 vs 新：

```
$ pnpm bill-detail generate
✓ Wrote src/modules/bill-detail/generated/...
✓ Merged 3 new keys into locales/en.json
✓ Merged 3 new keys into locales/zh.json
⚠ Dead keys (still in dict but not in manifest):
  - billingDetail.products.apiKey.col.legacyField
  Run `bill-detail prune-messages --apply` to remove (review first).
```

prune 永远是显式手动操作。`literal-seed` 模式同样跑 dead key 检测，对比 seed 文件而非 dict。

## 7. CLI：sync / dev / diff

### 7.1 三种模式 + 两个辅助命令

| 命令                           | 用途                         | 行为                                                                                                                              |
| ------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `bill-detail sync`             | 业务项目主动拉取 shared 一次 | 依赖契约检查 → git clone/fetch shared → 复制 `shared/` → 跑 codegen → 写 `generated/` → 合并 messages-manifest → 镜像目录置只读   |
| `bill-detail dev`              | 本地联调                     | 读 `bill-detail.config.local.ts` → chokidar watch shared 本地路径 → 文件变更触发重写 → 重新置只读                                 |
| `bill-detail diff [--check]`   | CI 校验                      | 模拟一次 generate 到内存，与磁盘上的 `generated/` 比对，不一致则失败                                                              |
| `bill-detail open <file>`      | 跳到 canonical               | 解析文件 header `canonical:` 字段，拼上 `sharedLocalPath`，调 `$EDITOR` 打开（详见 §7.5.4）                                       |
| `bill-detail unlock`           | 临时解锁镜像                 | 把 `shared/` `generated/` 改回可写以便排查；下一次 sync/dev 自动锁回（详见 §7.5.5）                                               |
| `bill-detail scaffold-adapter` | 补 adapter 缺失方法          | 比对 shared `UiAdapter` / `OptionalUiAdapter` 与业务 `adapters/ui.tsx`，按 `components.json` 映射在文件末尾追加 stub（详见 §5.3） |

### 7.2 sync 执行步骤

```text
0. 读业务项目 package.json，比对 shared peerDependencies，违约直接退出（详见 §3.1.2）
1. 读 bill-detail.config.ts + bill-detail.components.json
2. zod 校验配置
3. 解析 shared 来源:
   - 有 dev.sharedLocalPath  → 直接用本地路径
   - 否则                     → git clone/fetch 到 cacheDir@ref，记录 commit
4. 复制 shared/src/{capabilities,query,formatters,export,hooks}/
   → src/modules/bill-detail/shared/
   每个文件加 @bill-detail-managed header（含 canonical 路径与 commit hash）
5. 加载 preset，运行 codegen:
   - registry.generated.ts
   - tables.generated.tsx
   - routes.generated.ts
   - manifest.generated.json
   - messages-manifest.json (runtime-t / dict-object 模式)
   - messages-seed.generated.ts (literal-seed 模式)
6. ts-morph 校验
7. prettier 格式化
8. 原子写入: 每个文件先写 .tmp 再 rename，整批失败则全部回滚
9. 合并 messages-manifest 到项目字典
10. 镜像目录 chmod 0444（文件）/ 0555（目录），覆盖 shared/ 与 generated/
11. （可选）跑 `tsc --noEmit` 扫 src/modules/bill-detail/，宿主 react / zod 版本契约二次确认
12. 输出报告: 新增/更新/dead key 清单 + 锁定文件数
```

### 7.3 dev 模式与 HMR

CLI 不实现自己的 HMR；它只负责把 shared 变更转译成磁盘上的源码变更，HMR 由业务项目自身的开发服务器（Next dev / Vite dev）接管。

```text
shared/src/capabilities/products/apiKey.ts  (改一行)
            │
            │  chokidar watch
            ▼
CLI 重新跑该 preset 的 codegen
            │
            │  原子写入 src/modules/bill-detail/generated/tables.generated.tsx
            ▼
Vite/Next dev 文件监听器探测到变更，触发 HMR
            ▼
浏览器局部刷新，业务页面立刻看到效果
```

debounce 200ms 避免连续保存抖动。原子写入避免业务 dev server 读到半文件触发 false positive。

### 7.4 双 preset 时

`bill-detail sync` 顺序执行 presets 数组，每个 preset 一次完整流程：clone shared → 复制到该 preset 的 `generateTo/shared/` → codegen 该 preset 的 `generated/` → 合并字典。两套源码物理隔离。

### 7.5 开发者体验与编辑链路

业务项目下 `src/modules/bill-detail/shared/` 与 `generated/` 都是 sync 产物，并不是真正的"源"。如果直接在业务项目里改这些文件，会在下次 sync 时被覆盖；用 Claude Code 或人类开发者在业务项目里查代码时，也容易误认为这就是可改文件。下面的编辑链路解决"在哪里改、在哪里读、读到的代码可不可信"三件事。

#### 7.5.1 三种调试场景

| 场景                       | 编辑位置                                                         | 看到效果的方式                                                                                                                |
| -------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **A. 业务侧定制**          | 业务项目 `adapters/`、`overrides/`、`bill-detail.config.ts`      | 业务项目 dev server 直接热更新，不需要碰 shared                                                                               |
| **B. shared 跨项目改动**   | shared 仓库 `src/core/` `src/react/` `src/capabilities/`         | `bill-detail dev` 在业务项目侧 watch sharedLocalPath，shared 改动 → 重写业务项目 `shared/` `generated/` → 业务 dev server HMR |
| **C. 看代码 / 调用栈定位** | 业务项目里点进 sync 来的文件，header 注释直接给出 canonical 路径 | `bill-detail open <path>` 把光标跳到 shared 仓库源文件                                                                        |

绝大多数业务迭代是 A，少量 B（涉及账单事实修改），几乎不应出现"在业务项目里改 shared/"。

#### 7.5.2 sharedLocalPath：本地联调主路径

`bill-detail.config.local.ts`（git-ignored）允许指向同事或自己 clone 在本地的 shared 仓库：

```ts
// bill-detail.config.local.ts (git-ignored)
export default {
  dev: {
    sharedLocalPath: "../bill-detail-shared",
    watch: true,
  },
};
```

CLI 在 `bill-detail dev` 模式下优先读这个 local 配置，跳过 git clone，直接 chokidar watch 本地路径。开发布局推荐 sibling directory：

```text
~/workspace/
├─ bill-detail-shared/        ← canonical source
├─ admin-frontend/
├─ ppio-home/
├─ novita-home/
├─ jiekou-home/
└─ ppio-admin / novita-admin/
```

任何业务项目跑 `pnpm bill-detail dev` 都能 watch 同一个 shared 仓库，shared 改动一次、N 个业务 dev server 同时收到 HMR。

每个业务项目仓库 git-track 一份 `bill-detail.config.local.ts.example`（模板），开发者 clone 后复制为 `bill-detail.config.local.ts` 并按本地 workspace 路径填 `sharedLocalPath`；真实 local 配置进 `.gitignore`。

#### 7.5.3 source-of-truth 文件 header

每个 sync 来的文件头部写死 canonical 路径与 commit hash。Claude Code 看到这个 header 就知道：当前文件不可改，要去哪里改。

```ts
// @bill-detail-managed
// source: bill-detail-shared@a1b2c3d
// canonical: src/core/query/buildApiKeyParams.ts
// editPolicy: do-not-edit-here  → edit canonical, then run `pnpm bill-detail sync`
// to open canonical: pnpm bill-detail open src/modules/bill-detail/shared/core/query/buildApiKeyParams.ts
```

CLI sync 时由 codegen 自动写入。`generated/` 文件 header 则会标 `kind: generated`，强调它由 schema + preset 推导，不来自任何具体 canonical 文件，需要改 schema 或 preset。

#### 7.5.4 `bill-detail open` 命令

```text
$ pnpm bill-detail open src/modules/bill-detail/shared/core/query/buildApiKeyParams.ts
→ 解析文件 header 中的 canonical
→ 读 bill-detail.config.local.ts.dev.sharedLocalPath（无则报错让用户配置）
→ 拼出 ~/workspace/bill-detail-shared/src/core/query/buildApiKeyParams.ts
→ 调用 $EDITOR 打开（VS Code: code -g "<path>:<line>"）
```

Claude Code 内引导：业务项目 CLAUDE.md 加一条说明：

```md
若文件头部带 `@bill-detail-managed`，**不要直接修改**。改动应在 canonical 路径
进行，命令：`pnpm bill-detail open <file>`，或直接编辑
`<sharedLocalPath>/<canonical>`，然后 `pnpm bill-detail sync`。
```

#### 7.5.5 副本只读：物理防御误改

dev / sync 完成后，CLI 把同步出的目录设为只读（chmod 0444 文件 / 0555 目录），覆盖 `shared/` `generated/` 子树。Claude Code 或人类 IDE 试图 Edit/Write 这些文件时会立刻得到 EACCES：

```text
$ pnpm bill-detail sync
✓ Synced 47 files (read-only)
✓ Codegen: 12 files (read-only)

# 误编辑
$ vim src/modules/bill-detail/shared/core/query/buildApiKeyParams.ts
"buildApiKeyParams.ts" [readonly]
```

逃生口：`pnpm bill-detail unlock` 临时把目录恢复可写，用于排查；下一次 sync / dev 重新锁回。CI 不开 unlock，业务项目 PR 永远不会包含手改 sync 文件。

只读策略只在 sync / dev 模式下启用，可以通过 `bill-detail.config.ts` 的 `readOnly: false` 关闭（不推荐）。

#### 7.5.6 dev 模式启动横幅

`pnpm bill-detail dev` 启动时打印固定横幅，让开发者一眼知道 canonical 在哪、哪些目录是 mirror：

```text
[bill-detail dev]
  preset:    ppio-admin
  watching:  ../bill-detail-shared (CANONICAL — edit here)
  emit to:   src/modules/bill-detail/shared      (READ-ONLY MIRROR)
             src/modules/bill-detail/generated   (READ-ONLY)
  open canonical: pnpm bill-detail open <synced-file>
  unlock (rare):  pnpm bill-detail unlock
```

#### 7.5.7 组件来源：契约 + 业务实现，不需要打包

shared 不直接 import 任何 UI 组件库（antd / shadcn / radix）。codegen 产出的 tsx 只调用 `uiAdapter.renderTable(...)` 这类契约方法，类型是 shared 定义的 `TableColumnSpec<Row>` `TabsRenderProps` 等结构化数据：

```ts
// shared 内（react/）
export interface TableColumnSpec<Row> {
  id: string;
  title: string | (() => string);
  accessor: (row: Row) => unknown;
  align?: "left" | "right" | "center";
  width?: number;
}
export interface UiAdapter {
  renderTable<Row>(props: TableRenderProps<Row>): unknown;
  renderTabs(props: TabsRenderProps): unknown;
  renderPagination(props: PaginationRenderProps): unknown;
  // ...
}
```

业务项目 `adapters/ui.tsx` 实现这些方法，把契约描述映射成具体 antd 或 shadcn 调用：

```tsx
// 业务项目 src/modules/bill-detail/adapters/ui.tsx
import { Table } from "antd";
import type { UiAdapter } from "../shared/react/uiAdapter";

export const uiAdapter: UiAdapter = {
  renderTable({ rows, columns, rowKey, loading }) {
    return (
      <Table
        rowKey={rowKey}
        loading={loading}
        dataSource={rows}
        columns={columns.map((c) => ({
          key: c.id,
          title: typeof c.title === "function" ? c.title() : c.title,
          render: (_: unknown, row: (typeof rows)[number]) => c.accessor(row),
        }))}
        pagination={false}
      />
    );
  },
  // ...
};
```

由此带来三个直接结论：

1. **shared 不需要打包**：shared 产出的是源码 + emit 函数；产物落在业务项目 `src/modules/bill-detail/` 里，由业务项目自己的 vite/next build 编译。没有 chunk、没有 dist、没有 npm publish。
2. **业务项目用什么 UI 库都行**：admin-frontend 继续 antd，将来其他项目接入用 shadcn 也只是改 `adapters/ui.tsx` 与 `components.json`。shared 不感知。
3. **割裂感的本质处理在 dev 链路，不在打包链路**：开发时通过 sharedLocalPath + 读文件 header + `bill-detail open` + 副本只读，让"哪里是源、哪里是镜像"在每一个动作里都明确；不需要任何运行时统一假象。

## 8. 分发：bootstrap 脚本（带稳定性约束）

业务项目不依赖 `@xxx/bill-detail-cli` npm 包。每个项目仓库放一个 `scripts/bill-detail.mjs` bootstrap，但工程实现要满足三条稳定性约束：

1. **缓存按 `repo + ref + lockfile-hash` 寻址**：cache hit 时跳过 install；只有 ref 变更或 shared lockfile 变更时才重装。
2. **用 `spawnSync(args[])` 不用字符串拼接**：避免 ref / args 注入与 shell 转义问题。
3. **CI 离线模式 / vendored fallback**：CI 默认禁用 `git fetch`，从仓库内 vendored tarball 解压；网络环境再回退到正常 git 流程。

```js
// scripts/bill-detail.mjs
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import os from "node:os";

const SHARED_REPO = "git@github.com:org/bill-detail-shared.git";
const ref = process.env.BILL_DETAIL_REF || readRefFromConfig() || "main";
const offline =
  process.env.BILL_DETAIL_OFFLINE === "1" || process.env.CI_OFFLINE === "1";
const vendoredTarball = path.resolve("vendor/bill-detail-shared.tar.gz");

const cacheRoot = path.join(os.homedir(), ".cache", "bill-detail-shared");
const cacheKey = createHash("sha1")
  .update(`${SHARED_REPO}|${ref}`)
  .digest("hex")
  .slice(0, 12);
const cacheDir = path.join(cacheRoot, cacheKey);

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function ensureCache() {
  if (existsSync(cacheDir)) return;
  mkdirSync(cacheDir, { recursive: true });
  if (offline) {
    if (!existsSync(vendoredTarball)) {
      console.error(`offline mode requires ${vendoredTarball}`);
      process.exit(1);
    }
    run("tar", [
      "-xzf",
      vendoredTarball,
      "-C",
      cacheDir,
      "--strip-components=1",
    ]);
  } else {
    run("git", ["clone", "--quiet", SHARED_REPO, cacheDir]);
    run("git", ["-C", cacheDir, "checkout", "--quiet", ref]);
  }
}

function ensureInstall() {
  const lockHash = createHash("sha1")
    .update(readFileSync(path.join(cacheDir, "pnpm-lock.yaml")))
    .digest("hex")
    .slice(0, 12);
  const stamp = path.join(cacheDir, ".install.stamp");
  if (existsSync(stamp) && readFileSync(stamp, "utf8") === lockHash) return;
  run("pnpm", [
    "-C",
    cacheDir,
    "install",
    "--frozen-lockfile",
    "--prefer-offline",
  ]);
  require("node:fs").writeFileSync(stamp, lockHash);
}

ensureCache();
ensureInstall();

const args = process.argv.slice(2);
run("pnpm", ["-C", cacheDir, "tsx", "tools/cli/bill-detail.ts", ...args], {
  cwd: process.cwd(), // CLI 在业务项目目录下执行，读业务项目的 config
  env: { ...process.env },
});
```

业务项目 `package.json`：

```json
{
  "scripts": {
    "bill-detail": "node scripts/bill-detail.mjs",
    "bill-detail:sync": "node scripts/bill-detail.mjs sync",
    "bill-detail:dev": "node scripts/bill-detail.mjs dev",
    "bill-detail:diff:check": "node scripts/bill-detail.mjs diff --check"
  }
}
```

升级 shared 版本：改 `bill-detail.config.ts` 里的 `ref`（commit hash 或 tag）；CI 中也可临时 `BILL_DETAIL_REF=v0.3.0` 覆盖。CI 强烈建议跑 `BILL_DETAIL_OFFLINE=1`，仓库 vendor 一份固定 ref 的 tarball，由脚本统一刷新。

未来如有需要，可以把 bootstrap 脚本本身打成"工具 npm"（仅工具能力），但运行时业务包永远不发 npm。

## 9. CI 与安全网

### 9.1 业务项目 CI

```yaml
- run: pnpm bill-detail:diff --check # 失败：开发者忘了 pnpm sync
- run: pnpm typecheck
- run: pnpm lint # oxlint + eslint
- run: pnpm build
- run: pnpm test # 项目自身测试
```

PR 中如果只动了 `generated/` 但 `shared/` commit 没动，diff --check 会拦下。

### 9.2 shared 仓库 CI

```yaml
- run: pnpm typecheck # 含 core/react 两份 tsconfig
- run: pnpm lint # oxlint 强制 core 不引 react / UI
- run: pnpm test # capability schema / formatter / query builder 单测
- run: pnpm test:codegen # 对每个 preset 跑一次 codegen，验证 ts-morph 通过、prettier 不报错
- run: pnpm test:fixtures # 4 类快照（详见 §9.2.1）
- run: pnpm test:scanner # novita-home seed 文件被扫描器识别（在 playground 中跑）
```

shared 仓库自己也跑 oxlint，规则与业务项目一致以避免生成产物在业务项目里报 lint。

#### 9.2.1 capability fixture：四类必备快照

每个 capability（每个 product）至少落 4 份 fixture，作为契约测试。任何 capability / formatter / query / export 改动都要带 fixture 更新，PR review 看 fixture diff 是判断回归的最直接手段。

| Fixture                  | 文件                                              | 断言                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **params snapshot**      | `fixtures/{capability}/params.snapshot.json`      | 给定 `QueryInput`（含日期边界、分页、filter 组合），断言 `buildXxxParams` 输出的 API 参数完全一致。验证 timezone policy、endTime 日末包含、dateLowerBound、maxRangeDays。                     |
| **columns snapshot**     | `fixtures/{capability}/columns.snapshot.json`     | 给定 preset + i18nMode，断言 codegen 产出的列结构（id / messageId / accessor / kind / order）逐项一致。验证 columnOverrides / 启用集合 / 顺序。                                               |
| **export snapshot**      | `fixtures/{capability}/export.snapshot.xlsx.json` | 给定 row 数据集（含 null / 大数 / 多语言文案 / 负数），断言 `buildWorkbookRows` 产出的工作表内容（headers / 行序 / cell 值 / 数字精度）一致。以 JSON 表达，避免 xlsx 二进制 diff。            |
| **formatter edge cases** | `fixtures/{capability}/formatter.edge-cases.json` | 列出该 capability 涉及的 formatter（money / token / period / storage）所有边界输入（0 / 极大值 / 缺字段 / undefined / 极端币种 / 浮点尾数 / prompt cache 命中率边界），断言每个 case 的输出。 |

fixture 跑法：

```ts
// shared/tests/capabilities/apiKey.fixtures.test.ts
import params from "../../fixtures/api_key/params.snapshot.json";

for (const c of params.cases) {
  test(`apiKey params: ${c.name}`, () => {
    const got = buildApiKeyParams(c.input, mockTimezones[c.tz]);
    expect(got).toEqual(c.expected);
  });
}
```

新增 capability 时必须同时提交 4 类 fixture；缺一会被 `test:fixtures` 拦下。codegen 改动若导致 fixture 差异，PR 必须显式更新 snapshot 文件并人工 review。

### 9.3 安全网清单

| 风险                                  | 防御                                                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 业务项目手改 generated/               | 文件 header `@bill-detail-managed do-not-edit-here`；镜像目录 chmod 0444 物理拒写；CI diff --check 拦                         |
| 业务项目手改 sync 来的 shared/        | 同上：header + 只读 + diff --check                                                                                            |
| sync 半成品                           | 原子写入（.tmp + rename）+ 全 batch 失败回滚                                                                                  |
| shared 改坏字典                       | messages-manifest 只填新 key，永不覆盖现有                                                                                    |
| dead key 漂移                         | CLI 报告 dead key，prune 始终手动                                                                                             |
| novita-home 字面量被破坏              | `literal-seed` 模式 UI 走 `resolveMessage`，literal 只在独立 seed 文件；`test:scanner` 跑 novita-home 扫描器断言所有 key 命中 |
| 跨 preset 串生成                      | admin-frontend 每个 preset 物理目录隔离 + vite alias 把 active module 固定为单一目录（`VITE_BRAND` 控制）                     |
| shared ref 漂移                       | manifest header 写死 commit hash，PR 中可见                                                                                   |
| 业务 react / zod 版本与 shared 不兼容 | `peerDependencies` 契约；CLI sync 前置依赖检查违约即退出；shared CI 跑 react 18/19 矩阵 typecheck                             |

## 10. 实施范围（一次性接入）

不分阶段、不分批次。一次性把 shared 仓库基础设施 + 全部账单能力（Aggregated / LLM / Monthly / Enterprise）建起来，5 个 git 仓库同步接入。

### 10.1 shared 仓库工作项

- 仓库骨架 + 工具链（tsx / zod / ts-morph / prettier / chokidar / oxlint + eslint plugin）
- `package.json` 声明 `peerDependencies: { react: "^18 || ^19", zod: "^3.22+" }`，devDependencies 取最低可运行版本
- 源码两层拆分：`core/`（纯 TS）/ `react/`（允许 useState 等，禁 JSX）；lint 强制 `core/` 不引 react / UI / i18n
- 9 个 adapter contract：ui / api / i18n / money / timezone / toast / permission / member / featureFlag
- CLI 五命令：sync / dev / diff / open / unlock（带 cache key + spawnSync + offline mode + 镜像只读）
- codegen 三模：runtime-t + dict-object + literal-seed
- 每个 sync 来的文件 header 自动写入 canonical 路径与 commit hash
- bootstrap 脚本模板（仓库 vendored tarball 兜底）
- capability 全量定义：
  - modes：OnDemand / Monthly / MultiDimension / Enterprise
  - OnDemand 产品：summary / llm / llm_dedicated_endpoint / gen_api / gpu / serverless / cloud_storage / cloud_sandbox / web_search
  - Monthly 产品：summary / gpu / local_storage / bare_metal / image
  - MultiDimension 产品：creator / api_key
  - Enterprise 产品：token_saving_plan
- 全部 query builder：billDetailList / monthly / apiKey / member / enterprise
- 全部 formatter：money / billingPeriod / llmTokenFields（含 prompt cache、multimodal、tiered price）/ storageUsage
- 全部 export schema：workbook builder
- 5 个 preset：ppio-home / novita-home / jiekou-home / ppio-admin / novita-admin
- 每个 capability 4 类 fixture：params.snapshot / columns.snapshot / export.snapshot.xlsx-json / formatter.edge-cases
- shared 仓库自身 CI：typecheck（core + react 两份 tsconfig，react 18/19 矩阵）/ lint / unit test / codegen 快照 / fixture 快照 / novita scanner 验证

### 10.2 业务项目工作项（5 个仓库各自一次到位）

每个仓库一次性提交一个接入 PR，包含：

- `scripts/bill-detail.mjs` bootstrap
- `bill-detail.config.ts`（admin-frontend 双 preset；其余单 preset）
- `bill-detail.config.local.ts.example`（git-tracked 示例，开发者本地复制为 `.local.ts` 并填 `sharedLocalPath`，详见 §7.5.2）
- `bill-detail.components.json`（admin-frontend 两份）
- `src/modules/bill-detail/` 完整目录（shared + generated + adapters + overrides）
  - `shared/` 与 `generated/`：CLI 一次 sync 产出（产物自动只读）
  - `adapters/`：手写 9 个 adapter + `index.ts` 统一 re-export（详见 §5.1）
  - `overrides/`：手写项目特例
  - `index.tsx`：装配入口
- 路由替换：业务页面 import 切到新 module（admin-frontend 用 vite alias `@/modules/bill-detail-active` + `VITE_BRAND` 环境变量按 brand 出包，路由侧只 import 单一 active 目录）
- 字典：CLI 一次 merge messages-manifest 到项目字典；翻译走项目自身流程
- CI 加 `bill-detail:diff --check`
- `package.json` 中 react / zod 版本满足 shared `peerDependencies`（详见 §3.1.2）
- `CLAUDE.md` 加 `@bill-detail-managed` 文件不可直接改的提示，并指向 `bill-detail open` 跳源
- 删除旧 `bill-detail` / `customer-bill-new` 拷贝代码

### 10.3 跨项目对齐工作项

- 5 项目接入完成后跑一次"shared 改一行 → 5 项目同步"的演练，验证：
  - sync 在 5 个项目都能产出空 diff（codegen 与磁盘一致）
  - dev 模式 watch 能触达 HMR
  - novita-home 字面量被扫描器正确提取
  - 其余 4 个 preset 的字典 merge 不污染既有翻译
  - admin-frontend 双 brand 分别 `VITE_BRAND=ppio` / `VITE_BRAND=novita` 出包，产物分别只含一侧 module
- 文档：每个业务项目 README 加"如何升级 shared ref"小节（指向 bootstrap）

### 10.4 范围边界

不在本次范围：

- shared 仓库 release 版本化（采用 commit-based ref）
- 自动化 PR bot（业务项目手动 pull）
- AI 翻译协作（翻译走各项目原流程）
- shared 业务包发布到 npm
- 跨项目 design-token 一致性（颜色 / 间距 / 圆角 / 字体）：属于另一项独立工作流，shared 当前不持有视觉值，业务项目各自维持现状
- UI 组件 props 形状统一：shared 只传语义化描述，具体 props 映射由业务 adapter 按当时实际 UI 库（antd / shadcn / 自研）现场对待

## 11. 开放议题

- shared 仓库的 release 节奏：按 commit 还是按 tag？倾向 commit-based，PR 中 `ref` 字段写 commit hash。
- jiekou-home 是否需要 `enabledModes` 删减到只有 OnDemand？由 preset 决定，不影响架构。
- 当 shared 引入对宿主能力的新需求（例如新增 `analytics` adapter），如何平滑要求 5 项目补 adapter？提案：CLI sync 时校验 `components.json` 必须声明所有 capability 用到的 adapter 入口，缺失则失败并打印缺哪个 + 在 shared 哪个文件首次引入。
- shared 自身的 i18n 测试 fixture：是否需要在 shared 仓库 playground 里跑一次 novita-home 风格 + 一次 ppio-admin 风格的代码生成快照？倾向需要，作为 shared 基础设施的子任务。

## 12. 决策摘要

- 不打 npm 业务包，业务源代码靠 CLI sync 进入业务项目 `src/modules/bill-detail/`。
- shared 源码拆 `core/`（纯 TS）+ `react/`（允许 state primitive 禁 JSX），lint 强制隔离；同步源码不依赖 shared tsconfig path / 无 Node-only API / 跨 React 版本无害。
- shared ↔ 业务项目用 `peerDependencies` 显式契约（react ^18 || ^19、zod ^3.22+），CLI sync 前置依赖检查不满足直接拒写；shared CI 跑 react 18 / 19 矩阵 typecheck，sync 末段在业务项目内再跑一次 `tsc --noEmit` 兜底。
- 工具链：tsx + zod + ts-morph + prettier + chokidar，主 lint 用 oxlint，eslint 用 @oxlint plugin 兜底。
- `components.json` 仅承载 UI / icons 的 import 映射；transport / i18n / money / timezone / toast / permission / member / featureFlag 全部走业务项目 `adapters/index.ts` 统一 re-export。
- shared 不 import 任何 UI 库；codegen 产出 tsx 只调用 `uiAdapter.renderTable(...)` 等契约方法，业务项目用 antd / shadcn 自由实现。shared 不需要打包，业务项目自身 vite/next build 即编译产物。
- UI 组件 adapter 区分必选 / 可选两类：必选（Tabs / Table / Pagination / DateRangePicker / Select / Empty / Button / Tooltip / Spinner）缺失即 sync 失败；可选（Skeleton / Modal / Drawer / Card / 未来新增）缺失走 `PlaceholderRenderer` 兜底，配 `bill-detail scaffold-adapter` 一行补 stub。具体 props 形状不在 shared 强制统一，留给业务 adapter 按当时 UI 库现场对待。
- design-token（颜色 / 间距 / 圆角 / 字体）一致性属于另一项独立工作流，本次 shared 不持有视觉值。
- i18n 三模：novita-home `literal-seed`、ppio-home / jiekou-home `dict-object`、admin-frontend 双 preset `runtime-t`，由 preset 决定。`literal-seed` 模式 UI 走 `resolveMessage`、literal 单独沉到 seed 文件供扫描器识别。
- AI 不参与翻译；messages-manifest 只填新 key、永不覆盖。
- admin-frontend 双 preset 物理拆 `bill-detail-ppio` / `bill-detail-novita`，路由通过 vite alias `@/modules/bill-detail-active` + `VITE_BRAND` 按 brand 出包，部署产物只含一侧。
- 开发链路四件套防割裂：`sharedLocalPath` 指向 sibling 目录的 canonical 仓库 + 同步文件 header 标 canonical 路径与 commit hash + `bill-detail open` 跳到 canonical + sync/dev 把镜像目录设为只读（chmod 0444），手改 sync 文件直接 EACCES。dev 启动横幅显式标注 watching 与 mirror。
- 一次性接入 5 个仓库（6 个 preset），同 PR 删除旧 `bill-detail` / `customer-bill-new` 拷贝代码。
- HMR 复用业务项目自身 dev server，CLI dev 模式 chokidar watch + 原子写入。
- bootstrap 脚本（scripts/bill-detail.mjs）替代 npm 包安装；cache 按 `repo + ref + lockfile-hash` 寻址，命令走 `spawnSync(args[])`，CI 默认 offline + vendored tarball。
- 每个 capability 落 4 类 fixture 快照：params / columns / export / formatter edge cases。
- CI 用 `bill-detail diff --check` 拦截手改 generated 文件 + 漏 sync。
- 一次性接入（不分阶段）的前提条件：旧 `bill-detail` / `customer-bill-new` 拷贝代码同 PR 删除，避免他人继续往旧代码塞功能。
