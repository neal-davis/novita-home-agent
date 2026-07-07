# Novita Home

Bill Detail Module Audit

This document records the current `bill-detail` module in this project and provides a reusable collection method for comparing the same module across other sites/admin projects.

## 1. Scope

Current route entry:

- Route switch: `src/app/billing/page.tsx`
- Bill detail entry: `src/app/billing/billing-details/index.tsx`
- Main orchestration: `src/app/billing/billing-details/components/DetailContent.tsx`
- Top-level billing tabs: `src/app/billing/billing-details/components/CategoryTabs.tsx`
- API layer: `src/api/billing.ts`
- Global billing state: `src/store/slice/billingSlice.ts`

The module is a client-side billing detail page. It includes route/permission gating, billing mode tabs, product/dimension sub-tabs, table rendering, filters, request cancellation, client pagination, Excel export, i18n extraction, analytics tracking, and enterprise/team visibility rules.

## 2. Business Capability Map

### Top-Level Tabs

| Business tab        | Internal value   | Visibility                                              | Main responsibility                                 |
| ------------------- | ---------------- | ------------------------------------------------------- | --------------------------------------------------- |
| Usage-based Billing | `OnDemand`       | Always visible                                          | Shows usage-based bill details by product category. |
| Fixed-term Billing  | `Monthly`        | Always visible                                          | Shows monthly/fixed-term bill details.              |
| Aggregated Billing  | `MultiDimension` | Always visible in current code                          | Shows aggregated details by creator or API key.     |
| Enterprise Billing  | `Enterprise`     | Visible when `billing.billingInfo.isEnterprise` is true | Shows LLM Saving Plan enterprise bill rows.         |

`CategoryTabs` fetches `billingInfo` through `fetchBillingInfo()` if it is not already in Redux. Enterprise tab visibility is coupled to `/v1/billing/info`.

### Secondary Tabs

| Top-level tab       | Secondary tab            | Component                     | Data source                                                                          |
| ------------------- | ------------------------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| Usage-based Billing | Summary                  | `SummaryTable`                | `getBillList` -> `/v1/billing/bill/list`, `productCategory=summary`                  |
| Usage-based Billing | LLM Serverless Endpoints | `LLMTable`                    | `getBillList`, `productCategory=llm`                                                 |
| Usage-based Billing | LLM Dedicated Endpoints  | `LLMDedicatedEndpointTable`   | `getBillList`, LLM dedicated category mapping                                        |
| Usage-based Billing | Image/Video              | `GenAPITable`                 | `getBillList`, `productCategory=gen_api`                                             |
| Usage-based Billing | GPU Instances            | `GPUInstanceTable`            | `getBillList`, `productCategory=gpu`                                                 |
| Usage-based Billing | GPU Serverless           | `ServerlessTable`             | `getBillList`, `productCategory=serverless`                                          |
| Usage-based Billing | Storage                  | `NetworkStorageTable`         | `getBillList`, `productCategory=cloud_storage`; category list from `getBillCategory` |
| Usage-based Billing | Agent Sandbox            | `SandboxTable`                | `getBillList`, `productCategory=cloud_sandbox`                                       |
| Fixed-term Billing  | Summary                  | `SummaryTableMonthly`         | `getBillListMonthly` -> `/v1/billing/bill/monthly/list`                              |
| Fixed-term Billing  | GPU Instance             | `GPUInstanceTableMonthly`     | `getBillListMonthly`, monthly GPU category                                           |
| Fixed-term Billing  | Storage                  | `NetworkStorageTableMonthly`  | `getBillListMonthly`, monthly storage category                                       |
| Fixed-term Billing  | Image Dedicated Endpoint | `ImageDedicatedEndpointTable` | `getBillListMonthly`, monthly image category                                         |
| Aggregated Billing  | By Creator               | `PurcherTable`                | `getBillListByMember` -> `/v1/billing/member/bill/list`                              |
| Aggregated Billing  | By API Key               | `APIKeyTable`                 | `getBillListByAPIKey` -> `/v1/billing/apikey/bill/list`                              |
| Enterprise Billing  | Single table             | `EnterpriseTable`             | `getEnterpriseBillList` -> `/v1/billing/enterprise/bill/list`                        |

Aggregated Billing has an extra team rule: `By Creator` is rendered only when `user.currentTeam` exists. The default sub-tab is `creator` for team users and `api_key` otherwise.

## 3. Component Function Inventory

| Component                     | Business function                   | Main filters                                                                  | Display/export characteristics                                                                                                         | Coupling notes                                                                                 |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `SummaryTable`                | Usage-based summary totals          | Time range, Group By: Hour/Day/Week/Month                                     | Billing Period, Subtotal, Voucher Discount, Total Due; exports `Summary-Ondemand-Billing.xlsx`                                         | Repeats local fetch, pagination, export logic.                                                 |
| `LLMTable`                    | LLM serverless bill details         | Time range, Group By, model search                                            | Token usage, prompt cache token details, multimodal token details, unit price details, request count, money columns; exports LLM Excel | Shares token/unit price renderers with API key table.                                          |
| `LLMDedicatedEndpointTable`   | LLM dedicated endpoint usage        | Time range, Group By, endpoint/owner filter                                   | Similar billing amount table with endpoint-specific fields                                                                             | Product category and display labels are component-local.                                       |
| `GenAPITable`                 | Image/video API usage               | Time range, Group By                                                          | API name, usage/request/money fields; exports image/video Excel                                                                        | Uses common bill list endpoint with category-specific columns.                                 |
| `GPUInstanceTable`            | Usage-based GPU instance usage      | Time range, Group By, instance/product filters                                | GPU resource usage and money fields; Excel export                                                                                      | Uses global team/member data for creator/member display in some paths.                         |
| `ServerlessTable`             | GPU serverless usage                | Time range, Group By, owner/product search                                    | GPU type, usage, owner, money fields; Excel export                                                                                     | Filter/query construction duplicated with other usage tables.                                  |
| `NetworkStorageTable`         | Usage-based storage                 | Time range, Group By: Day/Week/Month, product type select                     | GB-hour/GB-day usage, storage owner, pricing model, unit price; exports storage Excel                                                  | Fetches category options through `getBillCategory`; contains storage-specific unit conversion. |
| `SandboxTable`                | Agent Sandbox usage                 | Time range, Group By                                                          | Sandbox usage and amount columns; Excel export                                                                                         | Product-specific calculation is local to table.                                                |
| `SummaryTableMonthly`         | Fixed-term monthly summary          | Time range; month cycle                                                       | Monthly summary totals; Excel export                                                                                                   | Uses monthly endpoint and monthly date semantics.                                              |
| `GPUInstanceTableMonthly`     | Fixed-term GPU instance             | Time range; month cycle, product filters                                      | Monthly product, trade, member/creator and amount fields; Excel export                                                                 | Coupled to member list and monthly response fields.                                            |
| `NetworkStorageTableMonthly`  | Fixed-term storage                  | Time range; month cycle                                                       | Monthly storage columns and amount fields; Excel export                                                                                | Similar monthly pattern duplicated.                                                            |
| `ImageDedicatedEndpointTable` | Fixed-term image dedicated endpoint | Time range; month cycle                                                       | Monthly image endpoint amount fields; Excel export                                                                                     | File name currently resembles storage export naming, worth checking before reuse.              |
| `PurcherTable`                | Aggregated Billing by creator       | Time range, Group By: Day/Week/Month                                          | Creator Account, Billing Period, Product Name, money fields; exports `Creator-Ondemand-Billing.xlsx`                                   | Creator display depends on `user.allTeamMembers` and current user fallback.                    |
| `APIKeyTable`                 | Aggregated Billing by API key       | Time range, Group By: Day/Week/Month, product category select, product search | Key name, API key mask, model name, token/unit price details, request count, money fields; exports `API_Key-Billing.xlsx`              | API wrapper deletes `productCategory`; supports only specific products per tooltip.            |
| `EnterpriseTable`             | Enterprise LLM Saving Plan          | Time range                                                                    | Daily saving plan rows, committed usage, billable usage, money fields; no Excel export in current implementation                       | Visibility depends on billing info; daily model is hardcoded.                                  |

## 4. Data And Request Flow

Common table flow:

1. Component owns `filterOptions` in local React state.
2. Date defaults to current UTC month: start of month to end of month.
3. Changing date/group/search/category resets `currentPage` to `1`.
4. `useEffect` builds query params from `filterOptions`.
5. Previous request is aborted through `AbortController`.
6. Repeated requests are skipped by comparing `prevFilterOptions` with `isEqual`.
7. Data is stored as the full `billList` in component state.
8. `StandardPagination` slices the local list on the client. Page changes do not refetch; they briefly set loading for pseudo pagination.
9. Export maps the current in-memory list to XLSX rows.

Main API contracts:

| Function                | Endpoint                               | Used by                  | Query notes                                                                                                                                     |
| ----------------------- | -------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `getBillList`           | `GET /v1/billing/bill/list`            | Usage-based tables       | `cycleType`, `productCategory`, `startTime`, `endTime`, optional `productName`, `category`, `ownerId`                                           |
| `getBillListByAPIKey`   | `GET /v1/billing/apikey/bill/list`     | Aggregated By API Key    | Deletes `productCategory` before request; supports `cycleType`, date range, product/category filters                                            |
| `getBillListMonthly`    | `GET /v1/billing/bill/monthly/list`    | Fixed-term tables        | Similar shape but monthly semantics; some components pass product category as `category`                                                        |
| `getBillListByMember`   | `GET /v1/billing/member/bill/list`     | Aggregated By Creator    | Current wrapper type only sends `cycleType`, `startTime`, `endTime`; component has extra filter fields but does not pass them to the final call |
| `getBillCategory`       | `GET /v1/billing/bill/category`        | Storage/category filters | Fetches category options for select controls                                                                                                    |
| `queryBillingInfo`      | `GET /v1/billing/info`                 | `CategoryTabs`           | Determines Enterprise tab visibility                                                                                                            |
| `getEnterpriseBillList` | `GET /v1/billing/enterprise/bill/list` | `EnterpriseTable`        | Uses `productCategory=token_saving_plan`                                                                                                        |

Response shapes are represented by `Bill` and `BillByMember` in `src/api/billing.ts`. `Bill` is a broad shared record for many product categories, so product-specific fields such as `billNum0..12`, `billingMethod`, `multimodalPricing`, `tieredConfig`, `committedUsage`, `ownerID`, and `productId` are interpreted inside individual components.

## 5. Shared UI And Internal Utilities

Project UI components used by the module:

- Layout/tabs/cards: `Card`, `CardContent`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- Table primitives: `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`, `TableSpinner`
- Empty/loading/pagination: `NoData`, `StandardPagination`
- Filters: `DateRangePicker`, `DateToggleGroup`, `SearchInput`, `Select`
- Actions: `ConsoleButton`
- Permission: `PermissionWrapper`
- Member display: `MemberCell`
- Details popover: `BillingFieldDetails`, `BillingFieldDetailsOutput`, `HoverCard`

Internal utility dependencies:

- Date conversion/display: `getUTCTimestampByTimezoneToDate`, `getDateRangeDisplay`, `getDateDisplay`
- Money display: `balanceFormat`, `dealMoneyWithPrecision`
- Excel money header marker: `EXCEL_MONEY_HEADER_SUFFIX`
- Token/price rendering: `billTokenPriceFieldRenderers.tsx`
- Styles: `src/app/billing/billing-details/page.module.scss`

## 6. State, Permissions, Routing, Analytics

Global Redux dependencies:

- `state.user.currentTeam`: controls Aggregated Billing default sub-tab and whether `By Creator` is shown.
- `state.user.allTeamMembers`: used to render/export creator/member identity.
- `state.user.uuid` and `state.user.email`: fallback for creator export.
- `state.billing.billingInfo`: controls Enterprise Billing tab.
- `fetchBillingInfo`: loaded by `CategoryTabs`.

Permission dependency:

- `PermissionWrapper` requires `PERMISSION.RESOURCE_GROUP.billing`, `PERMISSION.RESOURCE.details`, and `PERMISSION.ACTION.read`.
- Bill detail content is also gated by `isClient`, so the page renders only after client mount.

Analytics dependency:

- Many tab/filter/export interactions use `CLICK_BTN_IDs.BILLING.*`.
- `analytics.trackClick` is called for date picking and group selection in several tables.
- Tracking IDs are embedded in UI components, which couples analytics naming to the current tab layout.

## 7. i18n And Text

The project uses a custom i18n scan/compile pipeline rather than colocated `useTranslation` calls in these table components.

Observed pattern:

- Source components contain string literals such as `"Group By"`, `"Export"`, tab labels, column headers, and tooltip text.
- Message files are generated under `locales/en/messages/...`.
- Compiled outputs include `src/i18n/generated/messages.ts` and public dictionaries under `locales/*/public/i18n/*.json`.
- The `copy` prop is still passed through many billing components and appears in memo dependencies, but most current table text is rendered directly from literals and handled by compile-time extraction.

For cross-project sharing, text is a strong integration point. A shared bill-detail core should avoid importing this project's generated message files directly. Prefer either stable message IDs or a host-provided translation adapter such as `t(key, defaultText, values)`.

## 8. External Dependencies

Runtime libraries directly relevant to bill detail:

- React and Next.js App Router client components
- `@reduxjs/toolkit` for slices/thunks, `react-redux` through project `useAppSelector`/`useAppDispatch`
- `dayjs` with UTC usage for date defaults and conversion
- `xlsx` for Excel export
- `lodash` / `lodash-es/isEqual` for filter equality checks
- `antd` for `Alert` and `message`
- `lucide-react` for icons such as `InfoIcon` and `ChartPie`
- `big.js` for precise money/unit-price conversion

Project-level dependencies:

- API client wrapper: `request` from `src/api/api.ts`
- UI system under `src/components/ui/*`
- Console button under `src/app/user/components/console-button`
- Permission constants under `src/constants/constants`
- Analytics constants and client under `src/app/components/analytics/*`

## 9. Business And Technical Coupling

| Coupling area               | Current state                                         | Cross-project risk                                                                            |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Tab structure               | Hardcoded in `DetailContent` and `CategoryTabs`       | Adding/removing one business capability requires code changes per project.                    |
| API endpoints               | Directly imported in every table                      | Backend route or query changes must be repeated in each implementation.                       |
| Query construction          | Repeated in table `useEffect` blocks                  | Easy for filters to diverge, as seen in By Creator extra fields not passed to final API call. |
| Date handling               | UTC defaults and end-date adjustment repeated         | Timezone and period bugs can differ between sites.                                            |
| Pagination                  | Full list is fetched and client-sliced                | Large data volume risk; server pagination cannot be introduced centrally.                     |
| Excel export                | Each table maps rows manually                         | Export headers, money suffixes, and field formatting drift easily.                            |
| Product-specific formatting | Stored in table components and token renderers        | LLM/cache/multimodal/storage logic is hard to reuse in other UI libraries.                    |
| Member display              | Depends on global `user` slice and `MemberCell`       | Admin sites or different user stores need adapters.                                           |
| Permissions                 | Page entry uses project-specific permission constants | Shared module cannot be dropped into another project unchanged.                               |
| i18n                        | Compile-time extraction is project-specific           | Shared repo needs text contract or generated resources per host.                              |
| Analytics                   | IDs live inside UI components                         | Different analytics systems need wrappers or config.                                          |
| UI library                  | Uses local shadcn-like components plus antd           | Other sites/admin projects with different UI kits need adapter components.                    |

## 10. Recommended Shared Architecture

To make one bill-detail feature change effective across multiple projects, split the module into a headless shared core and project-specific adapters.

Shared core candidates:

- Business tab registry: top tabs, sub-tabs, visibility predicates, default selections.
- Query schema and period handling: `BillDetailFilter`, `cycleType`, date normalization, API params builder.
- API contract types: `Bill`, `BillByMember`, enterprise bill types, category options.
- Product/table column definitions as data: column IDs, headers/message keys, accessors, formatters, export formatters.
- Domain formatters: money, token cache, multimodal usage, storage usage conversion, billing period display.
- Export builder: `buildBillingWorkbook(tableConfig, rows, context)`.
- Request orchestration hook: cancellation, equality check, loading state, optional server/client pagination mode.

Project adapter candidates:

- UI components: table, tabs, date range picker, toggle group, select, search input, button, empty state, popover.
- Translation: `t(key, defaultText, params)`.
- Analytics: `track(eventId, payload)`.
- Permission/team/enterprise providers.
- API transport: `request` implementation, base URL, auth, error handling.
- Member resolver: `resolveMemberName(memberId, userId)`.
- Money symbol and locale formatting.

Suggested shape:

```ts
createBillDetailModule({
  apiAdapter,
  uiAdapter,
  i18nAdapter,
  analyticsAdapter,
  permissionAdapter,
  memberAdapter,
  featureFlags,
});
```

This keeps business rules and table definitions in one place while allowing each project to keep its own UI library, request wrapper, Redux/store model, permission system, and deployment pipeline.

## 11. Incremental Migration Plan

1. Freeze current behavior by documenting tab/component/API/filter/export mappings in each project.
2. Extract pure helpers first: date params, billing period display, money/token/storage formatters, Excel row builders.
3. Extract a shared table registry for Aggregated Billing first, because `By Creator` and `By API Key` are already close to a reusable dimension model.
4. Add host adapters in this project while keeping existing UI components.
5. Move one low-risk table to the shared core and compare rendered columns, API params, and export output.
6. Repeat table by table, keeping old components behind a feature flag until parity is verified.
7. Once all projects use the shared core, future bill-detail changes should land in shared registry/helpers plus, only when needed, a narrow host adapter change.

## 12. Checklist Template For Other Projects

Use this template to collect the same facts in other sites/admin projects.

### Module Boundary

- Route/path:
- Entry component:
- Main orchestrator:
- Permission/auth wrapper:
- Layout/shell dependencies:
- Client/server rendering boundary:

### Business Structure

- Top-level tabs:
- Top-level visibility rules:
- Secondary tabs:
- Default active tab rules:
- Team/enterprise/admin-only behavior:

### Component Matrix

| Business area | Component | API | Filters | Columns | Export | Special rules |
| ------------- | --------- | --- | ------- | ------- | ------ | ------------- |
|               |           |     |         |         |        |               |

### Data Contract

- Endpoint list:
- Query params:
- Response fields:
- Money precision rules:
- Date/timezone rules:
- Product category enum:
- Billing method enum:
- Error/loading/empty behavior:
- Pagination mode:

### Technical System

- State management:
- API request wrapper:
- UI library:
- i18n strategy:
- Permission model:
- Analytics/tracking:
- Export library:
- Date library:
- Money/decimal library:
- Shared utility imports:

### Reuse Classification

Mark each part as one of:

- Shared core: business rule or pure data transform that should be identical across projects.
- Host adapter: UI, request, auth, store, analytics, or i18n integration.
- Project-specific: truly different behavior that should stay outside the shared module.

### Risk Review

- Does this project support all top-level tabs?
- Are tab names and product category enums identical?
- Are query params identical?
- Does API return the same field names and precision?
- Is pagination server-side or client-side?
- Is export expected to match UI columns exactly?
- Are team/member/creator identities resolved the same way?
- Are enterprise rules the same?
- Are translations compile-time extracted or runtime looked up?
- Are analytics IDs required by business reporting?

## PPIO-home

以下内容追加记录当前 `ppinfra-home` / `PPIO-home` 项目的真实 `billing-details` 代码现状，作为同一审计模板下的项目实例。

### PPIO-home 1. 模块边界

| 维度          | 当前项目事实                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| 路由入口      | `src/app/billing/page.tsx` 根据 `section === "billing-details"` 渲染账单详情                           |
| 页面入口      | `src/app/billing/billing-details/index.tsx`                                                            |
| 主编排组件    | `src/app/billing/billing-details/components/DetailContent.tsx`                                         |
| 一级 tab 组件 | `src/app/billing/billing-details/components/CategoryTabs.tsx`                                          |
| API 封装      | `src/api/billing.ts`                                                                                   |
| 字典文件      | `locales/zh/dictionaries/billing-details.json`，构建产物同步到 `src/dictionaries/billing-details.json` |
| 样式文件      | `src/app/billing/billing-details/page.module.scss`                                                     |
| 权限入口      | `PermissionWrapper`，资源为 `billing/details/read`                                                     |
| 渲染边界      | 页面入口与表格组件均为 client component                                                                |

`billing/page.tsx` 是 billing 大模块的 section switch，不是直接的 Next route page。bill detail 自身没有独立路由参数解析，依赖上层把 `dict` 注入到 `BillingDetails`。

### PPIO-home 2. 业务结构

#### PPIO-home 2.1 一级 Tab

| 一级业务 tab   | 内部值           | 来源组件       | 展示规则                                           | 业务含义                                      |
| -------------- | ---------------- | -------------- | -------------------------------------------------- | --------------------------------------------- |
| 按量账单       | `OnDemand`       | `CategoryTabs` | 固定展示                                           | 按实际用量出账的账单明细                      |
| 包年包月账单   | `Monthly`        | `CategoryTabs` | 固定展示                                           | 固定周期/订阅类账单明细                       |
| 多维度汇总账单 | `MultiDimension` | `CategoryTabs` | 固定展示                                           | 非计费模式维度的汇总账单，例如创建人、API Key |
| 企业账单       | `Enterprise`     | `CategoryTabs` | `billing.billingInfo.isEnterprise === true` 时展示 | LLM 节省计划相关企业账单                      |

一级 tab 的展示和顺序写死在 `CategoryTabs.tsx`。`CategoryTabs` 首次渲染时会检查 Redux 中的 `billing.billingInfo`，为空则 dispatch `fetchBillingInfo()`，最终由 `/v1/billing/info` 返回的 `isEnterprise` 决定企业账单是否出现。

#### PPIO-home 2.2 二级 Tab 与表格组件

| 一级 tab       | 二级 tab   | 内部值          | 组件                         | API                                       |
| -------------- | ---------- | --------------- | ---------------------------- | ----------------------------------------- |
| 按量账单       | 总账单     | `summary`       | `SummaryTable`               | `getBillList`                             |
| 按量账单       | LLM        | `llm`           | `LLMTable`                   | `getBillList`                             |
| 按量账单       | 图片/视频  | `gen_api`       | `GenAPITable`                | `getBillList`                             |
| 按量账单       | Agent 沙箱 | `cloud_sandbox` | `SandboxTable`               | `getBillList`                             |
| 按量账单       | GPU 实例   | `gpu`           | `GPUInstanceTable`           | `getBillList`，分类来自 `getBillCategory` |
| 按量账单       | Serverless | `serverless`    | `ServerlessTable`            | `getBillList`                             |
| 按量账单       | 存储       | `cloud_storage` | `NetworkStorageTable`        | `getBillList`，分类来自 `getBillCategory` |
| 按量账单       | 联网搜索   | `web_search`    | `WebSearchTable`             | `getBillList`                             |
| 包年包月账单   | 总账单     | `summary`       | `SummaryTableMonthly`        | `getBillListMonthly`                      |
| 包年包月账单   | GPU 实例   | `gpu`           | `GPUInstanceTableMonthly`    | `getBillListMonthly`                      |
| 包年包月账单   | 存储       | `cloud_storage` | `NetworkStorageTableMonthly` | `getBillListMonthly`                      |
| 包年包月账单   | 裸金属     | `bare_metal`    | `BareMetalMonthly`           | `getBillListMonthly`                      |
| 多维度汇总账单 | 按创建人   | `creator`       | `PurcherTable`               | `getBillListByMember`                     |
| 多维度汇总账单 | 按 API Key | `api_key`       | `APIKeyTable`                | `getBillListByAPIKey`                     |
| 企业账单       | 单表格     | 无二级 tab      | `EnterpriseTable`            | `getEnterpriseBillList`                   |

多维度汇总账单有团队规则：`DetailContent` 通过 `state.user.currentTeam` 判断是否展示 `按创建人`。团队上下文存在时默认二级 tab 是 `creator`，否则默认 `api_key`。

### PPIO-home 3. 功能与组件矩阵

| 组件                         | 业务能力                | 主要筛选条件                                                           | 表格/展示特点                                                    | 导出                        | 特殊耦合点                                                                    |
| ---------------------------- | ----------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `SummaryTable`               | 按量总账单汇总          | 时间范围，汇总粒度 Hour/Day/Week/Month                                 | 周期、总价、代金券、现金支付                                     | `按量总账单.xlsx`           | 通用按量查询模板                                                              |
| `LLMTable`                   | LLM 按量明细            | 时间范围，汇总粒度，模型名称搜索                                       | token 用量、Prompt Cache、阶梯价、多模态输入输出、请求次数、金额 | `LLM-按量账单.xlsx`         | LLM 字段解释大量内聚在组件内，与 `APIKeyTable` 有重复逻辑                     |
| `GenAPITable`                | 图片/视频按量明细       | 时间范围，汇总粒度                                                     | API 名称、账单周期、金额                                         | `图片-视频-按量账单.xlsx`   | 产品类别固定为 `gen_api`                                                      |
| `SandboxTable`               | Agent 沙箱按量明细      | 时间范围，汇总粒度                                                     | 沙箱产品、使用量、金额                                           | `Agent沙箱-按量账单.xlsx`   | 文件名、tab 名有硬编码中文                                                    |
| `GPUInstanceTable`           | GPU 实例按量明细        | 时间范围，汇总粒度，产品名称搜索，产品类型下拉                         | 产品类型、计费模式、单价、金额                                   | `GPU实例-按量账单.xlsx`     | `getBillCategory({ productCategory: "gpu" })` 动态取类型                      |
| `ServerlessTable`            | GPU Serverless 按量明细 | 时间范围，汇总粒度，Endpoint 搜索，GPU 类型搜索                        | Endpoint、GPU 类型、使用时长、单价和金额，使用时长说明 hover     | `Serverless-按量账单.xlsx`  | 同时有两个 `SearchInput`，字段语义在组件内                                    |
| `NetworkStorageTable`        | 存储按量明细            | 时间范围，汇总粒度 Day/Week/Month，产品名搜索，产品类型下拉            | 存储用量、计费模式、单价、金额                                   | `存储-按量账单.xlsx`        | 使用 `big.js` 处理存储单位换算                                                |
| `WebSearchTable`             | 联网搜索按量明细        | 时间范围，汇总粒度                                                     | 联网搜索产品、周期、金额                                         | `联网搜索-按量账单.xlsx`    | tab 文案硬编码                                                                |
| `SummaryTableMonthly`        | 包年包月总账单          | 时间范围                                                               | 月度周期、金额                                                   | `包年包月总账单.xlsx`       | 月度账单不展示 `DateToggleGroup`                                              |
| `GPUInstanceTableMonthly`    | GPU 实例包年包月        | 时间范围                                                               | 操作者账号、交易类型、产品、金额                                 | `GPU实例-包年包月账单.xlsx` | 依赖 `Creator`、`getCreator`、`tradeTypes`                                    |
| `NetworkStorageTableMonthly` | 存储包年包月            | 时间范围                                                               | 操作者账号、交易类型、存储产品、金额                             | `存储-包年包月账单.xlsx`    | 依赖团队成员和交易类型常量                                                    |
| `BareMetalMonthly`           | 裸金属包年包月          | 时间范围                                                               | 操作者账号、交易类型、裸金属产品、金额                           | `裸金属-包年包月账单.xlsx`  | 与 monthly GPU/Storage 结构相近，可抽公共配置                                 |
| `PurcherTable`               | 按创建人聚合            | 时间范围，汇总粒度 Day/Week/Month                                      | 创建人账号、周期、产品、金额                                     | `创建人-按量账单.xlsx`      | 依赖 `state.user.allTeamMembers`，当前命名为 Purcher 有拼写历史包袱           |
| `APIKeyTable`                | 按 API Key 聚合         | 时间范围，汇总粒度 Day/Week/Month，产品名称搜索，产品类型 LLM/图片视频 | Key 名称、API Key、模型/API、token/单价明细、请求次数、金额      | `API_Key-账单.xlsx`         | 2026-01-01 之前不可查，查询范围限制 31 天；API wrapper 删除 `productCategory` |
| `EnterpriseTable`            | 企业 LLM 节省计划       | 时间范围                                                               | 节省计划/承诺用量/超额用量/金额                                  | 当前无 XLSX 导出            | 只在企业账号展示，`productCategory=token_saving_plan`                         |

### PPIO-home 4. 数据流与请求模式

多数表格遵循同一模式：

1. 组件内部维护 `filterOptions`、`loading`、`billList`。
2. 默认时间一般为当月开始到当月结束。
3. 筛选条件变化时重置 `currentPage: 1`。
4. `useEffect` 从 `filterOptions` 构造 query。
5. 新请求开始前通过 `AbortController` 取消旧请求。
6. 使用 `lodash-es/isEqual` 或 `lodash/isEqual` 比较 `prevFilterOptions`，避免重复请求。
7. 接口返回完整列表后存入本地 state。
8. `StandardPagination` 只做本地 slice，不做服务端分页；切换页码时部分组件会短暂设置 loading。
9. 导出使用当前内存中的全量 `billList`，不是只导出当前页。

#### PPIO-home 4.1 API 合同

| API 函数                | Endpoint                               | 使用方                                    | Query 重点                                                                                        |
| ----------------------- | -------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `getBillList`           | `GET /v1/billing/bill/list`            | 所有按量产品表                            | `cycleType`、`productCategory`、`startTime`、`endTime`、可选 `productName`、`category`、`ownerId` |
| `getBillListMonthly`    | `GET /v1/billing/bill/monthly/list`    | 包年包月表                                | 月度账单语义，仍复用部分 `GetBillListParams` 字段                                                 |
| `getBillListByMember`   | `GET /v1/billing/member/bill/list`     | `PurcherTable`                            | `cycleType`、`startTime`、`endTime`                                                               |
| `getBillListByAPIKey`   | `GET /v1/billing/apikey/bill/list`     | `APIKeyTable`                             | 接收任意 query 后删除 `productCategory`，保留 `cycleType`、日期和筛选                             |
| `getBillCategory`       | `GET /v1/billing/bill/category`        | `GPUInstanceTable`、`NetworkStorageTable` | 按产品大类获取分类下拉                                                                            |
| `queryBillingInfo`      | `GET /v1/billing/info`                 | `CategoryTabs`/Redux                      | 目前使用 `isEnterprise`                                                                           |
| `getEnterpriseBillList` | `GET /v1/billing/enterprise/bill/list` | `EnterpriseTable`                         | 企业账单，`productCategory=token_saving_plan`                                                     |

#### PPIO-home 4.2 时间与金额规则

| 维度       | 当前实现                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 时间库     | `dayjs`                                                                                                                                                                            |
| 时间戳转换 | `getTimestampByTimezone(8, date)`，把本地日期转为 UTC+8 语义下的秒级时间戳                                                                                                         |
| 结束时间   | 多数表格用 `endTime.add(1, "day").subtract(1, "second")` 取日末                                                                                                                    |
| 周期展示   | `getDateRangeDisplay(cycleType, startTime, endTime)` 或月度组件中的 `getDateDisplay`                                                                                               |
| 汇总粒度   | 通用 `dict.dateGroupOptions`: Hour/Day/Week/Month；API Key/Creator 使用 `dict.dateGroupOptionsAPIKey`: Day/Week/Month；Storage 使用 `dict.dateGroupOptionsStorage`: Day/Week/Month |
| 金额单位   | 后端金额字段按万分制处理，展示常用 `balanceFormat(v)`，输出 `v / 10000` 且保留 4 位                                                                                                |
| 精度处理   | LLM 单价和存储换算中使用 `big.js`，公共 money 工具有 `dealMoneyWithPrecision`                                                                                                      |

### PPIO-home 5. 公共组件与内部工具

#### PPIO-home 5.1 本模块公共组件

| 组件/工具                   | 位置                                 | 职责                                                  |
| --------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `CategoryTabs`              | `components/CategoryTabs.tsx`        | 一级业务 tab 和企业 tab 可见性                        |
| `DateToggleGroup`           | `components/DateToggleGroup.tsx`     | Hour/Day/Week/Month 等汇总粒度切换                    |
| `BillingFieldDetails`       | `components/BillingFieldDetails.tsx` | 输入 token、输出 token、单价明细 hover 展示           |
| `BillingFieldDetailsOutput` | `components/BillingFieldDetails.tsx` | 输出相关明细 hover 展示                               |
| `getCreator`                | `components/getCreator.ts`           | 根据成员列表、memberId、uuid 和当前用户兜底生成展示名 |
| `purcherTableUtils`         | `components/purcherTableUtils.ts`    | 创建人汇总查询参数构造                                |
| `contant.ts`                | `components/contant.ts`              | 月度交易模式/交易类型文案映射                         |

#### PPIO-home 5.2 项目 UI 组件

| 类别       | 组件                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 容器与 tab | `Card`、`CardContent`、`Tabs`、`TabsList`、`TabsTrigger`、`TabsContent`                   |
| 表格       | `Table`、`TableHeader`、`TableRow`、`TableHead`、`TableBody`、`TableCell`、`TableSpinner` |
| 空态与分页 | `NoData`、`StandardPagination`                                                            |
| 筛选       | `DateRangePicker`、`date-range-picker-common`、`DateToggleGroup`、`SearchInput`、`Select` |
| 操作       | `Button`                                                                                  |
| 权限       | `PermissionWrapper`                                                                       |
| 成员展示   | `Creator`、`getCreator`                                                                   |
| 浮层       | `HoverCard`、`HoverCardTrigger`、`HoverCardContent`，以及 `antd` 的 `Alert`、`message`    |

当前 UI 是本项目 `src/components/ui/*` 封装、Radix primitives、Ant Design 混用。跨项目复用时，UI 组件不宜放入共享业务内核，应抽成 host adapter。

### PPIO-home 6. 状态管理、权限与项目技术体系

| 维度          | 当前项目实现                                                                               | 跨项目关注点                                    |
| ------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 框架          | Next.js 14 App Router，React 18                                                            | 其他项目是否 App Router、是否 SSR/CSR 混用      |
| 状态管理      | Redux Toolkit slice + `useAppSelector`/`useAppDispatch`                                    | 共享模块不能直接依赖此项目 store shape          |
| Billing 状态  | `state.billing.billingInfo.isEnterprise`                                                   | 企业 tab 是否可见应抽成能力开关或 provider      |
| 用户/团队状态 | `state.user.currentTeam`、`state.user.allTeamMembers`、`state.user.uuid/mobilePhone/email` | 创建人维度依赖团队模型和成员解析                |
| 权限          | `PermissionWrapper` + `PERMISSION.RESOURCE_GROUP.billing/details/read`                     | 权限系统应作为 host adapter                     |
| API 请求      | `request` 封装 `fetch`，自动带 cookie token，处理 401/403/message/mock                     | 共享核心只应定义 API contract，不应固定请求实现 |
| 多语言        | `getBillingDetailsDict()` 读取 JSON 字典，组件通过 `dict` prop 使用                        | 还有不少硬编码中文，跨项目需要统一 message key  |
| 样式          | CSS Module `page.module.scss` + Tailwind utility class                                     | UI 迁移需要保留结构语义，样式由宿主接管         |
| 导出          | `xlsx` 在浏览器端生成工作簿                                                                | 导出列定义适合沉淀成纯配置                      |
| 异步控制      | `AbortController` + `prevFilterOptions`                                                    | 可沉成共享 hook                                 |
| 分页          | 客户端全量列表 slice                                                                       | 多项目需要确认是否支持服务端分页                |

### PPIO-home 7. 外部依赖

| 依赖                                  | 当前用途                                        |
| ------------------------------------- | ----------------------------------------------- |
| `next` / `react`                      | App Router 页面和 client component              |
| `@reduxjs/toolkit` / `react-redux`    | billing/user 全局状态                           |
| `dayjs`                               | 日期默认值、日期选择器值、查询范围计算          |
| `xlsx`                                | Excel 导出                                      |
| `lodash-es/isEqual`、`lodash/isEqual` | filterOptions 深比较                            |
| `antd`                                | `Alert` 提示条、`message` toast                 |
| `lucide-react`                        | 明细 hover 图标等                               |
| `big.js`                              | 金额、单价、存储单位精度计算                    |
| Radix 相关包                          | Tabs、Select、ToggleGroup、HoverCard 等底层交互 |

### PPIO-home 8. 多语言与文案现状

当前模块是字典注入模式，入口从 `getBillingDetailsDict()` 获取 `billing-details.json`，再把 `dict` 传给各表格。字典覆盖了页面标题、通用筛选、汇总粒度、主要列名和部分产品名称。

仍存在的硬编码文案包括：

- 一级 tab 文案：`按量账单`、`包年包月账单`、`多维度汇总账单`、`企业账单`
- 二级 tab 部分文案：`Agent 沙箱`、`联网搜索`、`裸金属`、`按创建人`、`按 API Key`
- tooltip 文案：`DetailContent` 中各一级 tab 的说明
- 导出文件名：各表格组件内中文文件名
- toast 文案：`当前无账单数据`、API Key 查询日期限制等
- API Key 表中的产品类型：`全部`、`图片/视频` 等

如果要跨项目统一，应优先把这些文案收敛为稳定 key，例如：

- `billing.tabs.onDemand`
- `billing.tabs.monthly`
- `billing.tabs.aggregated`
- `billing.tabs.enterprise`
- `billing.products.cloudSandbox`
- `billing.export.empty`
- `billing.apiKey.dateRange.tooEarly`

### PPIO-home 9. 业务和技术粘连点

| 粘连区域     | 当前表现                                                          | 工程风险                               |
| ------------ | ----------------------------------------------------------------- | -------------------------------------- |
| Tab 配置     | 一级、二级 tab 在组件 JSX 中硬编码                                | 多项目新增/删除业务时重复改代码        |
| 可见性规则   | 企业 tab 依赖 Redux billingInfo，创建人 tab 依赖 user.currentTeam | 其他项目的用户/组织模型不同会卡住复用  |
| API 参数构造 | 每个表格自己拼 query                                              | 容易出现同一筛选条件跨表不一致         |
| 日期规则     | UTC+8、结束日扩展、API Key 2026 限制散落在组件中                  | 规则变更难一次性覆盖                   |
| 表格列定义   | 列名、render、导出列分散在每个组件中                              | UI 列和导出列容易漂移                  |
| LLM 计费解释 | Prompt Cache、多模态、阶梯价格逻辑写在 `LLMTable`/`APIKeyTable`   | 最有必要沉为公共 domain formatter      |
| 导出         | 每张表手写 XLSX mapping 和文件名                                  | 跨项目难保证导出一致                   |
| 成员展示     | `Creator`、`getCreator` 依赖本项目 user slice                     | 管理后台或移动端需要不同成员适配       |
| 错误提示     | `request` 和组件都调用 `antd message`                             | 业务错误、权限错误、查询限制混在 UI 中 |
| 多语言       | 字典和硬编码文案混用                                              | 多端国际化无法统一扫描                 |
| UI 库        | shadcn/Radix 风格组件与 antd 混用                                 | 共享模块不能直接带 UI 依赖             |
| 分页         | 前端全量分页                                                      | 数据量上来后无法只靠 UI 层修复         |

### PPIO-home 10. 可复用拆分建议

#### PPIO-home 10.1 可沉到共享核心的能力

- 业务 tab registry：一级 tab、二级 tab、默认选中、可见性谓词。
- 查询 schema：`BillDetailFilter`、`cycleType`、产品类别枚举、日期范围校验。
- 查询参数构造：按量、包年包月、按创建人、按 API Key、企业账单。
- 领域格式化：金额、账单周期、token 用量、Prompt Cache、多模态、存储单位、交易类型。
- 表格列配置：列 ID、文案 key、数据 accessor、UI render 描述、导出 formatter。
- 导出构造：根据列配置和数据生成 workbook rows。
- 请求状态 hook：取消请求、跳过重复请求、loading/empty/error、客户端/服务端分页策略。
- 业务限制：API Key 2026-01-01 最早日期、31 天查询范围等。

#### PPIO-home 10.2 应由宿主项目适配的能力

- UI adapter：Tabs、Table、DateRangePicker、Select、Search、Button、Popover、Empty、Pagination。
- API adapter：请求库、base URL、鉴权、错误结构、mock 机制。
- i18n adapter：`t(key, defaultText, values)` 或字典对象。
- permission adapter：账单详情读权限、企业账单能力。
- user/team adapter：当前团队、成员列表、成员名解析。
- analytics adapter：点击、筛选、导出埋点。
- theme/style adapter：CSS Module、Tailwind、设计 token。

#### PPIO-home 10.3 建议目标结构

```ts
createBillDetailModule({
  api,
  ui,
  i18n,
  permissions,
  userTeam,
  analytics,
  featureFlags,
});
```

共享包输出业务配置、hook 和 formatter；宿主项目提供 UI、请求、权限、用户、翻译和埋点适配。这样同一个 bill detail 功能变更可以在共享核心中完成，多端只处理各自壳层差异。

### PPIO-home 11. 当前项目优先治理建议

1. 先把 tab registry 从 `DetailContent`/`CategoryTabs` 中抽成纯配置，建立统一业务结构来源。
2. 把日期查询参数构造抽成公共工具，覆盖按量、月度、API Key、Creator、Enterprise。
3. 把 LLM 和 API Key 表重复的 token/单价明细 formatter 抽出。
4. 把导出列定义和 UI 列定义放到同一配置，避免导出和页面漂移。
5. 把硬编码中文补进 `billing-details.json`，再考虑跨项目 message key。
6. 给 `PurcherTable` 重命名或建立 alias，处理 `Purcher` 拼写历史问题。
7. 明确客户端分页是否能承受真实数据量；若不能，先统一分页 contract。
8. 为共享模块设计 adapter 接口，而不是直接搬运当前 UI 组件。

### PPIO-home 12. 当前审计注意事项

- 本节按当前代码目录采集，未把其他项目或历史分支中的组件当作当前事实。
- `BILL_DETAIL_MODULE_AUDIT.md` 当前是根目录新增文档，不属于构建产物。
- `PurcherTable`、`purcherTableUtils` 当前在工作区也有未提交改动；如果后续要做代码治理，需要把文档审计和功能改动分开提交。
- 未运行全量构建，因为本次是文档整理；前一轮 `tsc` 已知会被项目缺失依赖如 `ppio-sandbox`、`ioredis`、`ansis` 阻塞。

## jiekou-home 当前代码核验补充（2026-05-22）

本节基于当前工作区 `src/app/billing/billing-details` 目录逐文件核验，作为上方审计内容的修订补充。重点区分“当前页面实际渲染链路”和“代码中存在但当前未接入的能力”，方便后续用同一方法横向采集其他项目。

### 1. 当前实际页面链路

| 维度                 | 当前事实                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| 路由入口             | `/billing/details`，由 `src/app/billing/[section]/page.tsx` 读取 `section` 后复用 `BillingContent`        |
| billing 模块分发     | `src/app/billing/page.tsx` 中 `case "details"` 渲染 `BillingDetails`                                      |
| bill-detail 页面入口 | `src/app/billing/billing-details/index.tsx`                                                               |
| 主编排组件           | `src/app/billing/billing-details/components/DetailContent.tsx`                                            |
| 当前实际二级 tab     | `summary`、`llm`、`gen_api`                                                                               |
| 当前实际表格         | `SummaryTable`、`LLMTable`、`GenApiTable`                                                                 |
| 权限                 | `PermissionWrapper` 包裹，要求 `billing/details/read`                                                     |
| 客户端边界           | `index.tsx` 先 `setIsClient(true)`，再渲染 `DetailContent`，避免服务端渲染该模块内容                      |
| 字典来源             | `src/dictionaries/index.ts` 的 `getBillingDetailsDict()` 动态加载 `src/dictionaries/billing-details.json` |
| 样式来源             | `src/app/billing/billing-details/page.module.scss` + Tailwind className                                   |

当前 `DetailContent.tsx` 中 `billingMethod` 被固定为 `"OnDemand"`，没有接入一级 tab 切换。因此当前页面实际只展示“按量账单”下的三个业务表：总账单、LLM、图像/音频/视频。

### 2. 业务层级核验

#### 2.1 当前可达业务层级

| 层级 | 展示项         | 内部值     | 组件                     | 数据来源        |
| ---- | -------------- | ---------- | ------------------------ | --------------- |
| 一级 | 按量账单       | `OnDemand` | `DetailContent` 固定状态 | 无一级 tab 请求 |
| 二级 | 总账单         | `summary`  | `SummaryTable`           | `getBillList`   |
| 二级 | LLM            | `llm`      | `LLMTable`               | `getBillList`   |
| 二级 | 图像/音频/视频 | `gen_api`  | `GenApiTable`            | `getBillList`   |

#### 2.2 当前存在但未接入主页面的能力

| 文件/能力                         | 当前状态                                            | 说明                                                                                                        |
| --------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `CategoryTabs.tsx`                | 文件存在，但 `DetailContent.tsx` 未 import / 未渲染 | 组件内定义了 `OnDemand`、`Monthly`、`MultiDimension`，且团队用户才展示 `MultiDimension`；当前页面链路不可达 |
| `ImageDedicatedEndpointTable.tsx` | 文件存在，但主编排未接入                            | 使用 `getBillListMonthly` 查询 `category: "image"` 的月度账单，当前页面无 tab 能到达                        |
| `getBillListMonthly`              | API 封装存在                                        | 仅被未接入的 `ImageDedicatedEndpointTable` 使用                                                             |
| `getBillListByMember`             | API 封装存在                                        | 当前 `billing-details` 目录无组件使用                                                                       |
| `getBillCategory`                 | API 封装存在                                        | 当前 `billing-details` 目录无组件使用                                                                       |
| `contant.ts`                      | 文件存在                                            | 只被未接入的 `ImageDedicatedEndpointTable` 使用，用于月度交易模式/交易类型文案                              |

### 3. 功能与组件矩阵（当前可达）

| 业务功能               | 组件           | 筛选条件                                 | 表格列                                                                                         | 导出                           | 关键耦合                                                                                  |
| ---------------------- | -------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------- |
| 按量总账单             | `SummaryTable` | 时间范围、汇总粒度 `Hour/Day/Week/Month` | 账单周期、总价、体验券抵扣、现金支付                                                           | `总账单.xlsx`                  | 本地维护筛选、请求、分页、导出；金额用 `balanceFormat`                                    |
| LLM 按量明细           | `LLMTable`     | 时间范围、汇总粒度、模型名称搜索         | 账单周期、模型名称、Input/Output 用量、Input/Output 单价、请求次数、总价、体验券抵扣、现金支付 | `LLM-按量账单.xlsx`            | Prompt Cache、多模态、batch、阶梯价判断都写在组件内；hover 明细依赖 `BillingFieldDetails` |
| 图像/音频/视频按量明细 | `GenApiTable`  | 时间范围、汇总粒度                       | 账单周期、API 名称、请求次数、总价、体验券抵扣、现金支付                                       | `图像-音频-视频-按量账单.xlsx` | 请求逻辑与另外两个表不完全一致；导出按钮文案有硬编码“导出”                                |

### 4. 当前数据流与请求模式

| 环节            | 当前实现                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| API client      | `src/api/billing.ts` 中使用项目通用 `request`                                                              |
| 当前可达 API    | `getBillList` -> `GET /v1/billing/bill/list`                                                               |
| 当前未接入 API  | `getBillListMonthly`、`getBillListByMember`、`getBillCategory`                                             |
| Query 参数      | `cycleType`、`productCategory`、`startTime`、`endTime`，可选 `productName`、`category`、`ownerId`          |
| productCategory | 当前可达值为 `summary`、`llm`、`gen_api`                                                                   |
| 时间默认值      | 三个可达表均默认 `dayjs().startOf("month")` 到 `dayjs().endOf("month")`                                    |
| 时间戳转换      | 当前可达表使用 `getTimestampByTimezone(0, date)`，结束时间为 `endTime.add(1, "day").subtract(1, "second")` |
| 请求取消        | `SummaryTable`、`LLMTable` 使用 `AbortController`；`GenApiTable` 当前没有传 `AbortSignal`                  |
| 重复请求规避    | `SummaryTable`、`LLMTable` 使用 `prevFilterOptions` + `lodash-es/isEqual`；`GenApiTable` 当前没有这个逻辑  |
| 分页            | 三个可达表均取全量列表后前端 slice，`currentPage !== 1` 时不重新请求                                       |
| 空态            | `NoData`                                                                                                   |
| loading         | `Table` 的 `loading` prop 或 `TableSpinner`                                                                |
| 错误提示        | `antd message`，例如 `暂无数据！`、`当前无账单数据`、`获取数据失败`                                        |

当前 `Bill` 类型是一个宽表模型，LLM、图像/音频/视频、月度账单等字段都混在同一个 interface 中。LLM 表还依赖 `billNum0..12`、`billingMethod`、`basePrice*`、`discountPrice*`、`pricePrecision`、`tieredConfig`、`multimodalPricing` 等字段解释具体计费含义。

### 5. 公共组件与内部工具

| 分类       | 名称                                                                                      | 当前职责                               |
| ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| 模块内组件 | `DateToggleGroup`                                                                         | 汇总粒度单选切换，底层用 `ToggleGroup` |
| 模块内组件 | `BillingFieldDetails`                                                                     | LLM 输入 token / 输入单价 hover 明细   |
| 模块内组件 | `BillingFieldDetailsOutput`                                                               | LLM 输出单价 hover 明细                |
| 模块内常量 | `contant.ts`                                                                              | 月度交易文案；当前只被未接入表格使用   |
| 项目 UI    | `Card`、`CardContent`                                                                     | bill-detail 内容容器                   |
| 项目 UI    | `Tabs`、`TabsList`、`TabsTrigger`、`TabsContent`                                          | 当前二级 tab                           |
| 项目 UI    | `Table`、`TableHeader`、`TableRow`、`TableHead`、`TableBody`、`TableCell`、`TableSpinner` | 表格基础能力                           |
| 项目 UI    | `DateRangePicker`、`SearchInput`、`ConsoleButton` / `Button`                              | 筛选与导出操作                         |
| 项目 UI    | `NoData`、`StandardPagination`、`HoverCard`                                               | 空态、分页、hover 明细                 |
| 项目工具   | `getDateRangeDisplay`、`getTimestampByTimezone`                                           | 周期展示和查询时间戳                   |
| 项目工具   | `balanceFormat`                                                                           | 金额展示和导出金额格式                 |
| 项目能力   | `analytics.trackClick` + `CLICK_BTN_IDs.BILLING.*`                                        | 日期、汇总粒度、导出、tab 点击埋点     |
| 项目能力   | `PermissionWrapper` + `PERMISSION`                                                        | 页面访问权限                           |

### 6. 多语言与文案现状

| 类型         | 当前情况                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 字典文件     | `src/dictionaries/billing-details.json`                                                                                                 |
| 已字典化内容 | 页面 title、billing tips、时间范围、汇总粒度、导出按钮、三个当前可达 tab 的大部分列名                                                   |
| 混合语言现象 | 文件路径在 `src/dictionaries` 下，但大量值是中文；例如 `groupBy: "汇总粒度"`、`summary.displayName: "总账单"`                           |
| 硬编码中文   | `DetailContent` 的按量说明、`SummaryTable`/`LLMTable`/`GenApiTable` 的 toast、导出文件名、LLM 明细里的“文本/图像/音频/视频/原价/详情”等 |
| 跨项目风险   | 如果其他项目走运行时 i18n 或英文默认文案，这里需要抽稳定 key，不能直接复用当前中文字符串                                                |

建议后续横向采集时，把文案拆成三类：业务术语、错误/提示、导出文件名。导出文件名经常被遗漏，但它属于用户可见内容，也会影响跨项目一致性。

### 7. 状态管理、权限、埋点

| 维度           | 当前可达链路                                                              | 当前未接入/潜在链路                                                                                               |
| -------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| React 本地状态 | 每张表维护自己的 `filterOptions`、`billList`、`loading`、分页状态         | 可抽为 `useBillingTableQuery`                                                                                     |
| Redux          | 当前可达三张表不依赖 Redux                                                | `CategoryTabs` 依赖 `state.user.currentTeam`；`ImageDedicatedEndpointTable` 依赖 `state.user` 和 `allTeamMembers` |
| 权限           | `index.tsx` 统一包 `PermissionWrapper`                                    | 如果未来接入企业/月度/多维度 tab，仍会共享同一页面权限                                                            |
| 埋点           | 当前二级 tab、Summary/GenApi 日期/粒度/导出有埋点                         | `LLMTable` 搜索和日期/粒度当前没有 trackClick；`CategoryTabs` 的一级 tab id 当前不可达                            |
| 页面宽度       | `DetailContent` 读取 DOM class `console-side-navigation` 来计算 Card 宽度 | 这是项目布局耦合点，跨端迁移应由宿主 layout adapter 处理                                                          |

### 8. 外部依赖与项目技术体系

| 依赖/体系                   | 当前用途                                                |
| --------------------------- | ------------------------------------------------------- |
| Next.js App Router          | `/billing` 与 `/billing/[section]` 页面分发             |
| React client components     | bill-detail 整体是 client-side table/filter/export 模块 |
| Redux Toolkit / react-redux | 当前可达链路不直接依赖，但未接入组件中存在团队/成员依赖 |
| `dayjs`                     | 日期默认值、查询范围、月度表时间展示                    |
| `xlsx`                      | 浏览器端 Excel 导出                                     |
| `lodash-es/isEqual`         | 部分表格避免重复请求                                    |
| `antd`                      | `Alert` 与 `message`                                    |
| `lucide-react`              | `BillingFieldDetails` 的 `ChartPie` 图标                |
| Radix UI                    | Tabs、ToggleGroup、HoverCard 等项目 UI 底层能力         |
| Tailwind + CSS Module       | 局部布局、间距、颜色和表格样式                          |

`big.js` 在项目依赖中存在，但当前 `billing-details` 目录核验未发现直接使用。若其他项目的账单详情使用 `big.js` 做金额/单位换算，应单独记录，不能默认算入当前模块事实。

### 9. 业务与技术粘连点（当前代码）

| 粘连点                   | 当前表现                                                                  | 横向治理价值                                         |
| ------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| 业务 tab 与 JSX 绑定     | 二级 tab 直接写在 `DetailContent.tsx` JSX 中                              | 应抽 `billDetailTabs` registry，作为所有项目对账基准 |
| 页面能力与未接入文件并存 | `CategoryTabs`、`ImageDedicatedEndpointTable`、月度/成员 API 存在但不可达 | 横向统计时必须区分“代码存在”和“页面可达”             |
| 表格查询逻辑重复         | 每张表自己维护筛选、请求、分页、导出                                      | 可抽统一 query hook 和 table controller              |
| 请求行为不一致           | `SummaryTable`/`LLMTable` 有 abort/equality，`GenApiTable` 没有           | 容易造成同类表的 loading、重复请求、竞态表现不同     |
| LLM 领域逻辑过重         | Prompt Cache、多模态、阶梯价、batch 全在 `LLMTable` 内                    | 最适合沉为共享 domain formatter                      |
| UI 列与导出列分散        | 页面列和 XLSX header 分别手写                                             | 后续加列/改名容易页面和导出不一致                    |
| 文案来源混合             | 字典、硬编码中文、英文字段混在一起                                        | 多项目多语言统一时会成为第一批阻塞                   |
| 埋点散落                 | id 直接放在 tab/按钮/筛选控件上                                           | 需要 analytics adapter，避免共享核心绑定埋点命名     |
| 权限与页面入口绑定       | 整个 bill-detail 只有一层 read 权限                                       | 如果未来不同 tab 权限不同，需要能力级权限模型        |
| 布局读取 DOM             | `DetailContent` 通过 DOM 查询侧边栏宽度                                   | 共享模块不应感知宿主 layout DOM                      |

### 10. 其他项目采集时建议增加的维度

为了统一收集其他项目的 bill detail，建议每个项目都额外补这些字段：

| 维度         | 采集问题                                            | 为什么重要                          |
| ------------ | --------------------------------------------------- | ----------------------------------- |
| 可达性       | 功能是页面可达、feature flag 可达，还是仅代码残留？ | 避免把历史代码误判为当前业务        |
| 账单模式     | 支持按量、包年包月、多维度、企业账单中的哪些？      | 决定共享核心的 tab registry         |
| 产品类别枚举 | `productCategory`/`category` 的枚举和值是否一致？   | 决定 API adapter 是否需要映射       |
| 查询时间语义 | UTC、UTC+8、用户时区、自然日结束时间如何处理？      | 账单问题最容易出现在边界日期        |
| 分页策略     | 前端全量分页还是服务端分页？                        | 影响 API contract 和性能上限        |
| 导出策略     | 导出当前页、当前查询全量、还是后端异步导出？        | 影响共享导出能力设计                |
| 金额精度     | 后端金额单位、展示精度、导出精度是否一致？          | 跨项目金额不能靠 UI 字符串对齐      |
| 成员/组织    | 是否有团队、创建人、操作者、API Key 维度？          | 决定 user/team adapter              |
| 权限粒度     | 页面权限还是 tab/产品级权限？                       | 决定共享模块暴露的 permission hooks |
| i18n 模式    | 编译期字典、运行时 `t`、纯硬编码？                  | 决定文案迁移成本                    |
| 埋点模型     | 事件 id 是否业务强依赖？                            | 决定是否需要 analytics adapter      |
| 错误处理     | request 层统一 toast，还是组件自行 toast？          | 决定错误可定制性                    |
| UI 框架      | Antd、Radix/shadcn、移动端组件、原生表格？          | 决定 UI adapter 粒度                |
| 历史残留     | 有哪些未接入组件/API/字典 key？                     | 清理前先避免误复用                  |

### 11. 当前项目建议的优先抽象顺序

1. 先建立当前可达范围的 `bill-detail` 事实表：`OnDemand -> summary/llm/gen_api`。
2. 把 `SummaryTable`、`LLMTable`、`GenApiTable` 共同的筛选状态、日期参数、客户端分页、loading/empty 抽成 hook。
3. 把 `LLMTable` 中 Prompt Cache、多模态、阶梯价、batch 展示和导出 formatter 抽成纯函数。
4. 把页面列和导出列合并为同一份 column config，导出从 config 生成。
5. 把硬编码文案补齐进 `billing-details.json`，尤其是 toast、导出文件名、hover 明细、tooltip。
6. 再决定是否恢复或删除 `CategoryTabs`、`ImageDedicatedEndpointTable` 等未接入能力；不要在共享化时直接把不可达代码当作目标业务范围。

### 12. 当前项目对比模板（可复制到其他项目）

| 项目        | 路由               | 实际可达一级 tab | 实际可达二级 tab            | 未接入残留                                                            | API 数量                     | 前端/后端分页 | 导出方式      | i18n 完整度       | 权限粒度       | 主要耦合风险                        |
| ----------- | ------------------ | ---------------- | --------------------------- | --------------------------------------------------------------------- | ---------------------------- | ------------- | ------------- | ----------------- | -------------- | ----------------------------------- |
| jiekou-home | `/billing/details` | `OnDemand` 固定  | `summary`、`llm`、`gen_api` | `CategoryTabs`、`ImageDedicatedEndpointTable`、月度/成员/category API | 当前可达 1 个，封装存在 4 个 | 前端全量分页  | 浏览器 `xlsx` | 字典 + 硬编码混合 | 页面 read 权限 | LLM 逻辑重、查询重复、可达/残留混杂 |

---

## PPIO-admin: `customer-bill-new` Module Audit

本节统计当前仓库内 `src/views/pricing/customer-bill-new`，按项目口径归类为 **PPIO-admin**。该模块与 `customer-bill-new-en` 共用路由入口，但运行时由 `import.meta.env.isZh` 决定加载中文/PPIO 版本。

### 1. Module Boundary

- Route path: `/pricing/customer-bill-new`
- Route registration: `src/routes/index.tsx`
- Route component switch: `component: isZh ? CustomerBillNew : CustomerBillNewEN`
- Project entry: `src/views/pricing/customer-bill-new/index.tsx`
- Main orchestrator: `src/views/pricing/customer-bill-new/components/DetailContent.tsx`
- Top-level billing tab component: `src/views/pricing/customer-bill-new/components/CategoryTabs.tsx`
- API layer: `src/api/billing.ts`
- Locale source: `src/i18n/locales/zh-CN/billing-details.json`
- Styling: `src/views/pricing/customer-bill-new/page.module.scss`

### 2. Business Structure

#### Top-Level Tabs

| 一级业务 tab   | Internal value   | Component owner                  | Visibility / rule               | Responsibility                           |
| -------------- | ---------------- | -------------------------------- | ------------------------------- | ---------------------------------------- |
| 按量账单       | `OnDemand`       | `CategoryTabs` + `DetailContent` | Always included by current code | 按产品维度查看按量账单明细。             |
| 包年包月账单   | `Monthly`        | `CategoryTabs` + `DetailContent` | Always included by current code | 查看固定周期/包年包月账单。              |
| 多维度汇总账单 | `MultiDimension` | `CategoryTabs` + `DetailContent` | Always included by current code | 按创建人、API Key 等非计费模式维度汇总。 |
| 企业账单       | `Enterprise`     | `CategoryTabs` + `DetailContent` | Always included by current code | LLM 节省计划/企业账单。                  |

当前 PPIO-admin 版本没有在前端用团队/企业信息动态控制 tab 可见性；`CategoryTabs` 固定返回四个一级 tab。

#### Secondary Tabs

| 一级 tab       | 二级 tab   | Component                    | Product/category value                                                   | Main API                                                                | Export                      |
| -------------- | ---------- | ---------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | --------------------------- |
| 按量账单       | 总账单     | `SummaryTable`               | `summary`                                                                | `getBillDetailList`                                                     | `按量总账单.xlsx`           |
| 按量账单       | LLM        | `LLMTable`                   | `llm`                                                                    | `getBillDetailList`                                                     | `LLM-按量账单.xlsx`         |
| 按量账单       | 图片/视频  | `GenAPITable`                | `gen_api`                                                                | `getBillDetailList`                                                     | `图片-视频-按量账单.xlsx`   |
| 按量账单       | Agent 沙箱 | `SandboxTable`               | `cloud_sandbox`                                                          | `getBillDetailList`                                                     | `Agent沙箱-按量账单.xlsx`   |
| 按量账单       | GPU 实例   | `GPUInstanceTable`           | `gpu`                                                                    | `getBillDetailList`; category options from `getBillDetailCategory`      | `GPU实例-按量账单.xlsx`     |
| 按量账单       | Serverless | `ServerlessTable`            | `serverless`                                                             | `getBillDetailList`                                                     | `Serverless-按量账单.xlsx`  |
| 按量账单       | 存储       | `NetworkStorageTable`        | `cloud_storage`                                                          | `getBillDetailList`; category options from `getBillDetailCategory`      | `存储-按量账单.xlsx`        |
| 按量账单       | 联网搜索   | `WebSearchTable`             | `web_search`                                                             | `getBillDetailList`                                                     | `联网搜索-按量账单.xlsx`    |
| 包年包月账单   | 总账单     | `SummaryTableMonthly`        | `summary`                                                                | `getBillDetailMonthlyList`                                              | `包年包月总账单.xlsx`       |
| 包年包月账单   | GPU 实例   | `GPUInstanceTableMonthly`    | `gpu`                                                                    | `getBillDetailMonthlyList`; members from `getBillDetailTeamMembersList` | `GPU实例-包年包月账单.xlsx` |
| 包年包月账单   | 存储       | `NetworkStorageTableMonthly` | `local_storage`                                                          | `getBillDetailMonthlyList`; members from `getBillDetailTeamMembersList` | `存储-包年包月账单.xlsx`    |
| 包年包月账单   | 裸金属     | `BareMetalMonthly`           | `bare_metal`                                                             | `getBillDetailMonthlyList`; members from `getBillDetailTeamMembersList` | `裸金属-包年包月账单.xlsx`  |
| 多维度汇总账单 | 按创建人   | `PurcherTable`               | no product category in final request                                     | `getBillDetailMemberList`; members from `getBillDetailTeamMembersList`  | `创建人-按量账单.xlsx`      |
| 多维度汇总账单 | 按 API Key | `APIKeyTable`                | request wrapper deletes `productCategory`; UI category defaults to `all` | `getBillDetailApiKeyList`                                               | `API_Key-账单.xlsx`         |
| 企业账单       | 单表       | `EnterpriseTable`            | `token_saving_plan`                                                      | `getBillDetailEnterpriseList`                                           | No XLSX export found        |

### 3. Component Function Inventory

| Component                    | Business function                                                                    | Main filters                                                                        | Notable display logic                                                                 | Coupling notes                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `DetailContent`              | Page orchestration, user identifier search, top-level tab state, secondary tab state | User identifier input                                                               | Uses `Card`, `Alert`, `Tabs`; passes `userIdentifier` into every table                | Top-level tab definition and tooltip copy are hardcoded in component.                                         |
| `CategoryTabs`               | Custom first-level tab switch                                                        | None                                                                                | CSS module tab UI, not AntD Tabs                                                      | Fixed tab list; no backend feature flag or permission gating.                                                 |
| `SummaryTable`               | On-demand summary totals                                                             | User info, time range, group by Hour/Day/Week/Month                                 | Summary amount columns; client pagination                                             | Repeats request/equality/pagination/export pattern.                                                           |
| `LLMTable`                   | On-demand LLM detail                                                                 | User info, time range, group by, model search                                       | Token usage, prompt cache, multimodal input/output fields, unit price detail popovers | Contains a large amount of product-specific table/export logic.                                               |
| `GenAPITable`                | Image/video API usage detail                                                         | User info, time range, group by                                                     | API name, request count, amount columns                                               | Product-specific column set in component.                                                                     |
| `SandboxTable`               | Agent sandbox usage detail                                                           | User info, time range, group by                                                     | Sandbox usage, duration/amount columns                                                | Product-specific copy and export local to table.                                                              |
| `GPUInstanceTable`           | On-demand GPU instance usage                                                         | User info, time range, group by, product search, product type select                | GPU instance/product/category, unit price and amount columns                          | Fetches category options from backend.                                                                        |
| `ServerlessTable`            | GPU Serverless usage                                                                 | User info, time range, group by, endpoint/product fields                            | Endpoint/GPU usage and amount columns                                                 | Multiple search inputs are component-local.                                                                   |
| `NetworkStorageTable`        | On-demand storage usage                                                              | User info, time range, group by Day/Week/Month, product search, storage type select | Uses storage-specific unit and amount formatting                                      | Imports `big.js`; fetches category options.                                                                   |
| `WebSearchTable`             | Web search on-demand usage                                                           | User info, time range, group by                                                     | Search usage and amount columns                                                       | PPIO-only in this module pair.                                                                                |
| `SummaryTableMonthly`        | Monthly summary                                                                      | User info, time range                                                               | Monthly amount totals                                                                 | Uses monthly endpoint, category passed as `summary`.                                                          |
| `GPUInstanceTableMonthly`    | Monthly GPU                                                                          | User info, time range, optional member lookup                                       | Creator/member display and monthly trade fields                                       | Depends on team members endpoint.                                                                             |
| `NetworkStorageTableMonthly` | Monthly storage                                                                      | User info, time range, optional member lookup                                       | Storage monthly amount fields                                                         | Product category is `local_storage`, not `cloud_storage`.                                                     |
| `BareMetalMonthly`           | Monthly bare metal                                                                   | User info, time range, optional member lookup                                       | Bare metal monthly amount fields                                                      | PPIO-only in this module pair.                                                                                |
| `PurcherTable`               | Multi-dimensional bill by creator                                                    | User info, time range, group by Day/Week/Month                                      | Creator account, billing period, product name, amount columns                         | Creator display uses local `getCreator` / `getAccount`; recently aligned group-by options with API Key table. |
| `APIKeyTable`                | Multi-dimensional bill by API Key                                                    | User info, time range, group by Day/Week/Month, product search, product type select | API key mask/name, product, token/multimodal/cache fields, amount columns             | API has 2026-01-01 lower-bound validation and 31-day range check.                                             |
| `EnterpriseTable`            | Enterprise / LLM saving plan bill                                                    | User info, time range, product name search                                          | Saving-plan usage and amount table                                                    | Always rendered when Enterprise tab selected; no separate visibility gate found.                              |

### 4. API And Data Flow

| API function                   | Endpoint                                | Main consumers                   | Query shape                                                                                                                |
| ------------------------------ | --------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `getBillDetailList`            | `/v1/admin/bill/detail/list`            | On-demand product tables         | `cycleType`, `productCategory`, `userIdentifier`, `startTime`, `endTime`, optional `productName`, `category`, `ownerId`    |
| `getBillDetailCategory`        | `/v1/admin/bill/detail/category`        | GPU/storage category filters     | `productCategory`                                                                                                          |
| `getBillDetailMonthlyList`     | `/v1/admin/bill/detail/monthly/list`    | Monthly tables                   | `category`, `userIdentifier`, `startTime`, `endTime`, optional product filters                                             |
| `getBillDetailMemberList`      | `/v1/admin/bill/detail/member/list`     | `PurcherTable`                   | `cycleType`, `userIdentifier`, `startTime`, `endTime`                                                                      |
| `getBillDetailApiKeyList`      | `/v1/admin/bill/detail/apikey/list`     | `APIKeyTable`                    | Deletes `productCategory`; passes `cycleType`, `userIdentifier`, date range, optional `productName`, `category`, `ownerId` |
| `getBillDetailEnterpriseList`  | `/v1/admin/bill/detail/enterprise/list` | `EnterpriseTable`                | `productCategory=token_saving_plan`, date range, user info, optional filters                                               |
| `getBillDetailTeamMembersList` | `/v1/admin/bill/detail/team/members`    | Monthly tables and creator table | `userIdentifier`                                                                                                           |

Common PPIO-admin request pattern:

1. Parent page owns `userIdentifier`; tables do not fetch until it is set.
2. Each table owns local `filterOptions`, `billList`, `loading`, and `hasTriggeredQuery`.
3. Default date range is current month using local `dayjs().startOf("month")` and `dayjs().endOf("month")`.
4. Date query params use `getTimestampByTimezone(8, date.toDate())`.
5. End time is generally normalized to `endTime.add(1, "day").subtract(1, "second")`.
6. PPIO tables use `fetchSeq` + `isEqual(prevFilterOptions.current, filterOptions)` to avoid stale updates and duplicate fetches.
7. Pagination is client-side: the component stores the full response list and slices it by `currentPage` / `pageSize`.
8. Export uses the current in-memory list, not a fresh backend export endpoint.

### 5. Shared UI, Utilities, And Internal Components

Internal module components:

- `BillingFieldDetails`, `BillingFieldDetailsOutput`: hover-card detail renderer for complex billing fields.
- `DateToggleGroup`: AntD `Tabs`-based toggle wrapper; currently not used by most tables, which use AntD `Segmented` directly.
- `getCreator`, `getAccount`: PPIO member display helpers, switch phone/email based on `import.meta.env.isZh`.
- `contant.ts`: trade mode/type maps.
- `utils/money.ts`: `balanceFormat`.

Project/shared components:

- `Card`, `CardContent` from `@/components/ui/card`
- `HoverCard*` from `@/components/ui/hover-card`
- AntD: `Alert`, `Button`, `DatePicker`, `Empty`, `Input`, `Pagination`, `Segmented`, `Select`, `Space`, `Table`, `Tabs`, `Typography`, `message`
- Icons: `ChartPie` from `lucide-react`

Utility dependencies:

- Date display: `@/utils/date`, `@/utils/date-zh`
- Timestamp conversion: `getTimestampByTimezone` from `@/utils`
- Equality guard: `lodash/isEqual`
- Money precision: module `balanceFormat`; storage uses `big.js`
- Excel: `xlsx`

### 6. Project Technical System And Coupling

| Dimension        | Current state                                                                               | Reuse implication                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Routing          | Shared route `/pricing/customer-bill-new`, selected by `isZh`                               | Host must expose env/brand selector or route adapter.                  |
| i18n             | Runtime `react-i18next`; `t("billingDetails", { returnObjects: true })` returns dict object | Shared module can accept a `dict` object adapter.                      |
| State management | Local React state only for this module; no Redux dependency found                           | Easier to extract to headless hook, but state is duplicated per table. |
| UI kit           | AntD plus local shadcn-like card/hover-card                                                 | Needs UI adapter for other projects.                                   |
| API transport    | `request` from `src/api/fetch.ts` through `src/api/billing.ts`                              | API adapter should isolate endpoint names and query mutation.          |
| Date/timezone    | PPIO uses UTC+8 conversion via `getTimestampByTimezone(8, ...)`                             | Timezone policy must be explicit in shared core.                       |
| Export           | Per-table manual XLSX mapping                                                               | Export builder is a strong extraction candidate.                       |
| Permissions      | Route has `permission: "/pricing/customer-bill-new"`; no inner permission gates             | Permission remains route-level host concern.                           |
| Analytics        | No analytics calls found in this module                                                     | Shared core should keep analytics optional.                            |
| Brand/language   | `import.meta.env.isZh` appears in table/date/member helpers                                 | Brand-locale decisions should move behind adapters.                    |

### 7. PPIO-admin Reuse And Risk Notes

- `customer-bill-new` has more PPIO-specific categories than Novita: `web_search` and `bare_metal`.
- On-demand and monthly table logic is highly duplicated: filters, request guards, local pagination, XLSX export, empty/loading states.
- `APIKeyTable` has stricter date constraints: cannot query before `2026-01-01`, and range cannot exceed 31 days.
- `getBillDetailApiKeyList` mutates input by deleting `productCategory`; this is a hidden API coupling.
- `getBillDetailMemberList` by-creator final request does not pass product filters; only date/cycle/user are sent.
- `CategoryTabs` hardcodes all top-level tabs, including Enterprise; visibility is not tied to billing info or permission state.
- PPIO Chinese text is partly in `billing-details.json`, partly hardcoded in components and export filenames.

---

## novita-admin: `customer-bill-new-en` Module Audit

本节统计当前仓库内 `src/views/pricing/customer-bill-new-en`，按项目口径归类为 **novita-admin**。它与 PPIO-admin 共享路由 `/pricing/customer-bill-new`，但由 `isZh === false` 时加载。

### 1. Module Boundary

- Route path: `/pricing/customer-bill-new`
- Route registration: `src/routes/index.tsx`
- Runtime component: `CustomerBillNewEN`
- Project entry: `src/views/pricing/customer-bill-new-en/index.tsx`
- Main orchestrator: `src/views/pricing/customer-bill-new-en/components/DetailContent.tsx`
- Top-level billing tab component: `src/views/pricing/customer-bill-new-en/components/CategoryTabs.tsx`
- API layer: `src/api/billing.ts`
- Locale source: `src/i18n/locales/en-US/billing-details.json`
- Styling: `src/views/pricing/customer-bill-new-en/page.module.scss`

### 2. Business Structure

#### Top-Level Tabs

| Business tab        | Internal value   | Component owner                  | Visibility / rule                                                  | Responsibility                      |
| ------------------- | ---------------- | -------------------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Usage-based Billing | `OnDemand`       | `CategoryTabs` + `DetailContent` | Always included; click is blocked when `i18n.language === "zh-CN"` | On-demand product bill details.     |
| Fixed-term Billing  | `Monthly`        | `CategoryTabs` + `DetailContent` | Same as above                                                      | Monthly/fixed-term billing details. |
| Aggregated Billing  | `MultiDimension` | `CategoryTabs` + `DetailContent` | Same as above                                                      | Aggregated by creator or API Key.   |
| Enterprise Billing  | `Enterprise`     | `CategoryTabs` + `DetailContent` | Same as above                                                      | LLM Saving Plan enterprise bills.   |

novita-admin adds an explicit language guard in `CategoryTabs`: if current i18n language is `zh-CN`, it shows `请切换至英文环境` and refuses tab switching.

#### Secondary Tabs

| 一级 tab            | 二级 tab                 | Component                     | Product/category value                                                   | Main API                                                                | Export                                          |
| ------------------- | ------------------------ | ----------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------- |
| Usage-based Billing | Summary                  | `SummaryTable`                | `summary`                                                                | `getBillDetailList`                                                     | `Summary-Ondemand-Billing.xlsx`                 |
| Usage-based Billing | LLM Serverless Endpoints | `LLMTable`                    | `llm`                                                                    | `getBillDetailList`                                                     | `LLM-Serverless-Endpoints-Billing.xlsx`         |
| Usage-based Billing | LLM Dedicated Endpoints  | `LLMDedicatedEndpointTable`   | `llm_dedicated_endpoint`                                                 | `getBillDetailList`                                                     | `LLM-Dedicated-Endpoints-Billing.xlsx`          |
| Usage-based Billing | Image/Video              | `GenAPITable`                 | `gen_api`                                                                | `getBillDetailList`                                                     | `Image-Video-Ondemand-Billing.xlsx`             |
| Usage-based Billing | GPU Instances            | `GPUInstanceTable`            | `gpu`                                                                    | `getBillDetailList`; category options from `getBillDetailCategory`      | `GPU-Instances-Ondemand-Billing.xlsx`           |
| Usage-based Billing | GPU Serverless           | `ServerlessTable`             | `serverless`                                                             | `getBillDetailList`                                                     | `GPU-Serverless-Ondemand-Billing.xlsx`          |
| Usage-based Billing | Storage                  | `NetworkStorageTable`         | `cloud_storage`                                                          | `getBillDetailList`; category options from `getBillDetailCategory`      | `Storage-Ondemand-Billing.xlsx`                 |
| Usage-based Billing | Agent Sandbox            | `SandboxTable`                | `cloud_sandbox`                                                          | `getBillDetailList`                                                     | `Agent-Sandbox-Ondemand-Billing.xlsx`           |
| Fixed-term Billing  | Summary                  | `SummaryTableMonthly`         | `summary`                                                                | `getBillDetailMonthlyList`                                              | `Summary-Monthly-Billing.xlsx`                  |
| Fixed-term Billing  | GPU Instance             | `GPUInstanceTableMonthly`     | `gpu`                                                                    | `getBillDetailMonthlyList`; members from `getBillDetailTeamMembersList` | `GPU-Instance-Monthly-Billing.xlsx`             |
| Fixed-term Billing  | Storage                  | `NetworkStorageTableMonthly`  | `local_storage`                                                          | `getBillDetailMonthlyList`; members from `getBillDetailTeamMembersList` | `Storage-Monthly-Billing.xlsx`                  |
| Fixed-term Billing  | Image Dedicated Endpoint | `ImageDedicatedEndpointTable` | `image`                                                                  | `getBillDetailMonthlyList`; members from `getBillDetailTeamMembersList` | `Image-Dedicated-Endpoint-Monthly-Billing.xlsx` |
| Aggregated Billing  | Group by creator         | `PurcherTable`                | no product category in final request                                     | `getBillDetailMemberList`; members from `getBillDetailTeamMembersList`  | `Creator-Ondemand-Billing.xlsx`                 |
| Aggregated Billing  | By API Key               | `APIKeyTable`                 | request wrapper deletes `productCategory`; UI category defaults to `all` | `getBillDetailApiKeyList`                                               | `API_Key-Billing.xlsx`                          |
| Enterprise Billing  | Single table             | `EnterpriseTable`             | `token_saving_plan`                                                      | `getBillDetailEnterpriseList`                                           | No XLSX export found                            |

### 3. Component Function Inventory

| Component                     | Business function                                                              | Main filters                                                                        | Notable display logic                                                           | Coupling notes                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `DetailContent`               | Orchestrates user identifier, top-level tabs, secondary tabs, and tab tooltips | User identifier input                                                               | Uses English tooltip JSX blocks with line breaks                                | Product category unions differ from PPIO; table props include `dict` centrally. |
| `CategoryTabs`                | Custom first-level tabs                                                        | None                                                                                | Blocks clicks under `zh-CN` language                                            | Language guard is project-specific UI behavior.                                 |
| `SummaryTable`                | On-demand summary                                                              | User info, time range, group by                                                     | English column/export labels                                                    | Uses `AbortController` instead of `fetchSeq`.                                   |
| `LLMTable`                    | LLM serverless detail                                                          | User info, time range, group by, model search                                       | Shares token/multimodal/cache renderers from `billTokenPriceFieldRenderers.tsx` | Cleaner split than PPIO for token price rendering.                              |
| `LLMDedicatedEndpointTable`   | LLM dedicated endpoint detail                                                  | User info, time range, group by, endpoint search                                    | Dedicated endpoint fields                                                       | Novita-only in this module pair.                                                |
| `GenAPITable`                 | Image/video on-demand detail                                                   | User info, time range, group by                                                     | English API usage fields                                                        | Uses common request pattern.                                                    |
| `GPUInstanceTable`            | On-demand GPU instance usage                                                   | User info, time range, group by, product search, product type select                | GPU instance/product/category amount fields                                     | Fetches category options.                                                       |
| `ServerlessTable`             | GPU serverless usage                                                           | User info, time range, group by, endpoint/product filters                           | GPU serverless fields                                                           | Uses product/owner search fields locally.                                       |
| `NetworkStorageTable`         | On-demand storage                                                              | User info, time range, group by Day/Week/Month, product search, storage type select | Uses storage usage/unit-price formatting                                        | Uses `big.js`; category endpoint.                                               |
| `SandboxTable`                | Agent sandbox usage                                                            | User info, time range, group by                                                     | Sandbox usage, duration, amount                                                 | Novita English naming.                                                          |
| `SummaryTableMonthly`         | Monthly summary                                                                | User info, time range                                                               | Monthly totals                                                                  | Monthly date semantics.                                                         |
| `GPUInstanceTableMonthly`     | Monthly GPU                                                                    | User info, time range, members                                                      | Creator/member display                                                          | Depends on team members endpoint.                                               |
| `NetworkStorageTableMonthly`  | Monthly storage                                                                | User info, time range, members                                                      | Storage monthly amount fields                                                   | Product category is `local_storage`.                                            |
| `ImageDedicatedEndpointTable` | Monthly image dedicated endpoint                                               | User info, time range, members                                                      | Image dedicated monthly fields                                                  | Novita-only in this module pair.                                                |
| `PurcherTable`                | Aggregated billing by creator                                                  | User info, time range, group by Day/Week/Month                                      | Creator account and amount fields                                               | Uses local member resolver; group-by aligned to API Key options.                |
| `APIKeyTable`                 | Aggregated billing by API Key                                                  | User info, time range, group by Day/Week/Month, product search, product type select | API key, product, token/cache/multimodal fields                                 | Has 2026 lower-bound and 31-day range validation.                               |
| `EnterpriseTable`             | Enterprise saving plan bill                                                    | User info, time range, product name search                                          | Committed/billable usage and amount fields                                      | Always reachable through Enterprise tab.                                        |

### 4. API And Data Flow

novita-admin uses the same `src/api/billing.ts` API functions and endpoints as PPIO-admin. The differences are mainly date/timezone handling, request cancellation, category coverage, and export labels.

Common novita-admin request pattern:

1. Parent page owns `userIdentifier`; tables trigger after user confirms an identifier.
2. Table-local state owns `filterOptions`, `billList`, `loading`, and `hasTriggeredQuery`.
3. Default date range uses UTC dayjs: `dayjs().utc().startOf("month")` to `dayjs().utc().endOf("month").subtract(1, "day").add(1, "second")`.
4. Query params use helpers from `customer-bill-new-en/utils/date.ts`, especially `getUTCTimestampByTimezoneToDate`.
5. Most tables use `AbortController` plus `isEqual(prevFilterOptions.current, filterOptions)` to cancel stale requests and skip duplicates.
6. Pagination is local/client-side by slicing `billList`.
7. Export is generated client-side with `xlsx`.

Notable API behavior:

- `getBillDetailApiKeyList` mutates the input params by deleting `productCategory`.
- Monthly tables pass `category: productCategory` rather than `productCategory` in the final request.
- API Key table validates query start/end date against `2026-01-01` and blocks date ranges over 31 days.

### 5. Shared UI, Utilities, And Internal Components

Internal module components:

- `BillingFieldDetails`, `BillingFieldDetailsOutput`
- `DateToggleGroup`: AntD `Tabs` wrapper with `zh-CN` language guard; mostly superseded by `Segmented` in table filters.
- `billTokenPriceFieldRenderers.tsx`: shared LLM/API Key token, prompt-cache, multimodal, and unit-price render helpers.
- `contant.ts`: trade mode/type maps.
- `excelMoneyHeader.ts`: `EXCEL_MONEY_HEADER_SUFFIX = "($)"`.
- `utils/date.ts`: UTC date display, timestamp conversion, relative/usage duration helpers.
- `utils/money.ts`: `balanceFormat`, `balanceFormatReal`.

Project/shared components:

- `Card`, `CardContent` from `@/components/ui/card`
- `HoverCard*` from `@/components/ui/hover-card`
- AntD: `Alert`, `Button`, `DatePicker`, `Empty`, `Input`, `Pagination`, `Segmented`, `Select`, `Space`, `Table`, `Tabs`, `Typography`, `message`
- Icons: `ChartPie` from `lucide-react`

### 6. Project Technical System And Coupling

| Dimension        | Current state                                                            | Reuse implication                                                            |
| ---------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Routing          | Same route as PPIO, selected by `isZh` false                             | Shared routing needs a brand/env switch.                                     |
| i18n             | Runtime `react-i18next`; English JSON dict plus hardcoded English labels | Shared module needs a message-key contract and fallback text rules.          |
| State management | Local React state; no Redux dependency found                             | Headless hooks are feasible, but current logic is duplicated in every table. |
| UI kit           | AntD plus local card/hover-card                                          | Needs UI adapter if reused in other admin projects.                          |
| API transport    | Same `src/api/billing.ts` wrapper                                        | API adapter can be shared with PPIO if endpoint contract remains stable.     |
| Date/timezone    | UTC-oriented dayjs helpers and `dayjs.extend(utc)`                       | Timezone policy differs from PPIO and must be a host config.                 |
| Export           | Per-table manual XLSX rows and English filenames                         | Export schema should be centralized to prevent drift.                        |
| Permissions      | Route permission only; no inner permission gates found                   | Host controls access outside module.                                         |
| Analytics        | No analytics calls found                                                 | Analytics can remain optional.                                               |
| Language guard   | Blocks tab/toggle under `zh-CN` in `CategoryTabs` and `DateToggleGroup`  | Project-specific behavior; should not live in shared business core.          |

### 7. novita-admin Reuse And Risk Notes

- novita-admin has product categories not present in PPIO-admin: `llm-dedicated-endpoint` / `llm_dedicated_endpoint` and monthly `image`.
- PPIO-admin has product categories not present here: `web_search` and monthly `bare_metal`.
- novita-admin separates LLM token renderers into `billTokenPriceFieldRenderers.tsx`, making it a better candidate source for shared LLM formatting logic.
- UTC date behavior differs from PPIO-admin's UTC+8 timestamp behavior.
- Language guard is UI-level and should be treated as host behavior, not domain behavior.
- English text is still partly hardcoded in components and filenames despite using `billing-details.json`.

---

## Cross-Project Comparison: PPIO-admin vs novita-admin

### 1. Business Capability Differences

| Area                  | PPIO-admin `customer-bill-new`                                     | novita-admin `customer-bill-new-en` | Shared-module implication                                 |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------- |
| Route                 | `/pricing/customer-bill-new`                                       | `/pricing/customer-bill-new`        | Same route can host brand-specific module via env switch. |
| Top-level tabs        | OnDemand, Monthly, MultiDimension, Enterprise                      | Same                                | Top-level registry can be shared.                         |
| On-demand common tabs | Summary, LLM, Image/Video, GPU, Serverless, Storage, Agent Sandbox | Same core set                       | Shared registry with project feature flags.               |
| PPIO-only on-demand   | Web Search                                                         | None                                | Feature flag/category plugin.                             |
| Novita-only on-demand | None                                                               | LLM Dedicated Endpoint              | Feature flag/category plugin.                             |
| PPIO-only monthly     | Bare Metal                                                         | None                                | Feature flag/category plugin.                             |
| Novita-only monthly   | None                                                               | Image Dedicated Endpoint            | Feature flag/category plugin.                             |
| Aggregated tabs       | By Creator, By API Key                                             | By Creator, By API Key              | Strong candidate for shared dimension module.             |
| Enterprise tab        | Always reachable                                                   | Always reachable                    | Visibility policy should be externalized.                 |

### 2. Technical Differences

| Dimension               | PPIO-admin                                                            | novita-admin                                                      | Risk                                                  |
| ----------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| Date base               | Local month + UTC+8 conversion                                        | UTC month + UTC helper conversion                                 | Same date range can produce different backend params. |
| Request race handling   | Mostly `fetchSeq` sequence guard                                      | Mostly `AbortController`                                          | Behavior differs under fast filter changes.           |
| Member display          | Shared `getCreator` / `getAccount`, uses `isZh` to choose phone/email | Local resolver functions, email-oriented                          | Creator identity display can diverge.                 |
| Money suffix            | Often hardcoded `¥` in export headers                                 | `EXCEL_MONEY_HEADER_SUFFIX = "($)"`                               | Export headers can drift from money symbol.           |
| Token rendering         | Large logic inside `LLMTable` / `APIKeyTable`                         | Extracted `billTokenPriceFieldRenderers.tsx`                      | Prefer Novita split for shared formatter extraction.  |
| i18n                    | zh-CN dict plus Chinese hardcoded labels                              | en-US dict plus English hardcoded labels                          | Need inventory of hardcoded text before unification.  |
| Product category naming | `web_search`, `bare_metal`, `local_storage` monthly                   | `llm_dedicated_endpoint`, `image`, `local_storage` monthly        | Need canonical category enum and project mapping.     |
| UI behavior             | No language blocking                                                  | Blocks when `i18n.language === "zh-CN"` in top tab/toggle helpers | Host-level behavior must be adapter-driven.           |

### 3. Repeated Patterns Worth Extracting

| Candidate shared unit                | Currently duplicated in                       | Extraction target                                           |
| ------------------------------------ | --------------------------------------------- | ----------------------------------------------------------- |
| Top-level tab registry               | Both `CategoryTabs` and `DetailContent` files | `billingModeRegistry` with visibility predicates.           |
| Product tab registry                 | On-demand/monthly/multi-dimensional arrays    | `billDetailProductRegistry` keyed by project feature flags. |
| Filter state shape                   | Every table's `filterOptions`                 | `useBillDetailFilters(defaults)` hook.                      |
| Request orchestration                | Every table's `useEffect`                     | `useBillDetailQuery({ api, buildParams, enabled })`.        |
| Date normalization                   | Every table                                   | `dateAdapter` with PPIO/Novita timezone policy.             |
| Client pagination                    | Every table                                   | `useClientPagination(list, pageSize)`.                      |
| XLSX export                          | Every table                                   | `buildBillingWorkbook({ columns, rows, filename })`.        |
| Money formatting                     | module utils and repeated suffixes            | `moneyAdapter` with currency symbol and precision.          |
| Member resolving                     | Monthly tables and creator tables             | `memberAdapter.resolveDisplay(memberId, userId)`.           |
| LLM token/cache/multimodal rendering | PPIO LLM/APIKey; Novita renderers             | Shared LLM billing field formatter.                         |
| API Key validation                   | API Key tables                                | Shared validation rule for date lower-bound and max range.  |

### 4. Suggested Collection Dimensions For Other Projects

Use these dimensions when auditing the same billdetail feature in other codebases:

1. **Route and runtime selection**
   - Route path, project/brand selector, lazy imports, permission key.
   - Whether one route hosts multiple brand implementations.

2. **Business capability registry**
   - Top-level tabs, secondary tabs, default active tab.
   - Visibility rules for team, enterprise, region, language, permission, feature flag.
   - Product category enum values and display labels.

3. **Component ownership**
   - Orchestrator component, tab components, each table component.
   - Which component owns user identifier, date range, group by, product filters, pagination.

4. **API contract**
   - Endpoint names, query params, query mutation, response field names.
   - Whether server supports pagination/export or frontend does all slicing/export.
   - Product-category mappings and backend enum differences.

5. **Filter and validation rules**
   - Default date range, supported group-by values, date min/max rules, max range.
   - Product name/category/owner/member/API key filters.

6. **Date/timezone policy**
   - Local time vs UTC, backend timestamp unit, end-date inclusivity, month boundary behavior.
   - Region-specific timezone handling.

7. **Money and precision**
   - Currency symbol, amount storage unit, decimal precision, `big.js` usage.
   - Export header suffixes and whether values include currency symbols.

8. **Table and export schema**
   - UI columns, export columns, filename, sheet name, field order.
   - Whether export matches visible columns or includes hidden/subfield columns.

9. **Identity and team/member resolution**
   - Creator/member/team source, phone vs email choice, fallback fields, masking/desensitization.

10. **i18n/text strategy**
    - Runtime dictionary, compile-time extraction, hardcoded labels, filenames, validation messages.
    - Whether dict objects are passed down or each table calls `t`.

11. **UI adapter dependencies**
    - UI library, custom components, CSS modules, icons, loading/empty/pagination implementations.

12. **External libraries and project utilities**
    - Date library, decimal library, Excel/export library, lodash utilities, request client.

13. **Cross-cutting concerns**
    - Permission, analytics, feature flags, environment flags, error handling, request cancellation, logging.

14. **Reuse classification**
    - Shared core: tab/product registry, API schemas, date/query builders, column/export definitions, pure formatters.
    - Host adapter: UI components, request transport, auth/permission, i18n, analytics, member lookup, timezone/currency.
    - Project-specific: brand-only product categories, language blocking behavior, route/menu labels.

### 5. Engineering Problem Statement For Multi-Project Bill Detail

The current `customer-bill-new` implementations show a common product structure but duplicated technical execution. The biggest engineering problem is not one table or one API; it is that business concepts are coupled directly to host UI, host i18n, host date policy, host export mapping, and product-specific formatting inside each table.

To make future billdetail changes land once across multiple projects, the shared layer should start with:

- A canonical billing capability registry: top-level modes, product tabs, dimension tabs, feature flags.
- A canonical filter/query model: date range, cycle type, user identifier, product/category/owner filters.
- Per-project adapters for timezone, currency, translation, request transport, member identity, and UI widgets.
- Table definitions as data: column id, label key, UI renderer, export renderer, visibility predicates.
- Centralized Excel export builders and LLM/multimodal/prompt-cache formatters.

The recommended first extraction target is **MultiDimension / Aggregated Billing** (`PurcherTable` + `APIKeyTable`), because both projects already share the same business shape and the same backend API family. The next target should be LLM token/cache/multimodal formatting, using the novita-admin `billTokenPriceFieldRenderers.tsx` split as the stronger starting point.

---

# Admin Frontend customer-bill-new

以下内容记录当前仓库 `admin-frontend` 的 `customer-bill-new` 路由真实现状。标题编号从 1 重新开始，便于后续把其他项目的同类 billdetail 模块按同一口径追加对比。

## 1. 模块边界

| 维度                       | 当前项目事实                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 路由路径                   | `/pricing/customer-bill-new`                                                                                                                        |
| 路由配置                   | `src/routes/index.tsx` 中 `CustomerBillNew = lazyWithRetry(() => import("../views/pricing/customer-bill-new/index.tsx"))`                           |
| 菜单/权限                  | labelKey 为 `menu.pricingCustomerBillNew`；permission 为 `/pricing/customer-bill-new`；`requireAuth: true`                                          |
| 页面入口                   | `src/views/pricing/customer-bill-new/index.tsx`                                                                                                     |
| 主编排组件                 | `src/views/pricing/customer-bill-new/components/DetailContent.tsx`                                                                                  |
| 当前已渲染表格             | `SummaryTable`、`LLMTable`、`GenApiTable`                                                                                                           |
| 当前未接入但存在的模块文件 | `CategoryTabs`、`DateToggleGroup`、`BillingFieldDetails`、`contant.ts`；其中 `BillingFieldDetails` 被 `LLMTable` 使用，其余当前路由未接入主渲染链路 |
| API 封装                   | `src/api/billing.ts`                                                                                                                                |
| 字典文件                   | `src/i18n/locales/en-US/billing-details.json`、`src/i18n/locales/zh-CN/billing-details.json`                                                        |
| 样式文件                   | `src/views/pricing/customer-bill-new/page.module.scss`                                                                                              |
| 渲染形态                   | Vite + React SPA，路由懒加载；组件为客户端 React 组件                                                                                               |

当前 `DetailContent` 内部 `billingMethod` 固定为 `"OnDemand"`，没有一级 tab 切换入口，因此实际页面只展示按量账单下的三个二级 tab。`CategoryTabs` 文件里声明了 `OnDemand`、`Monthly`、`MultiDimension` 三个一级 tab，但当前没有被 `DetailContent` 使用。

## 2. 业务结构

### 2.1 一级业务 Tab

| 一级 tab            | 内部值           | 当前是否实际可用 | 来源                                              | 说明                                                 |
| ------------------- | ---------------- | ---------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Usage-based Billing | `OnDemand`       | 是               | `DetailContent` 固定状态；`CategoryTabs` 也有声明 | 当前唯一实际渲染的账单模式                           |
| Fixed-term Billing  | `Monthly`        | 否               | `CategoryTabs` 预留                               | API 和字典存在月度相关字段，但当前主页面未接入       |
| Aggregated Billing  | `MultiDimension` | 否               | `CategoryTabs` 预留                               | API 存在 member/API key 相关封装，但当前主页面未接入 |

当前没有企业账单一级 tab。`src/api/billing.ts` 里存在 `getBillDetailEnterpriseList`，但当前路由没有对应 tab、组件或可见性规则。

### 2.2 二级 Tab 与表格组件

| 一级 tab            | 二级 tab                        | 内部值                                        | 组件           | API                                                       | 当前状态                   |
| ------------------- | ------------------------------- | --------------------------------------------- | -------------- | --------------------------------------------------------- | -------------------------- |
| Usage-based Billing | Summary                         | `summary`                                     | `SummaryTable` | `getBillDetailList` -> `/v1/admin/bill/detail/list`       | 已接入                     |
| Usage-based Billing | LLM Serverless Endpoints / LLM  | `llm`                                         | `LLMTable`     | `getBillDetailList` -> `/v1/admin/bill/detail/list`       | 已接入                     |
| Usage-based Billing | Image/Audio/Video               | `gen_api`                                     | `GenApiTable`  | `getBillDetailList` -> `/v1/admin/bill/detail/list`       | 已接入                     |
| Usage-based Billing | GPU Instances                   | `gpu`                                         | 无当前组件     | API 字典/API 封装有相关字段                               | 字典与类型预留，未接入     |
| Usage-based Billing | GPU Serverless                  | `serverless`                                  | 无当前组件     | API 字典/API 封装有相关字段                               | 字典预留，未接入           |
| Usage-based Billing | Storage                         | `cloud_storage`                               | 无当前组件     | `getBillDetailCategory` 可支持分类                        | 字典预留，未接入           |
| Usage-based Billing | LLM Dedicated Endpoints         | `llm_dedicated_endpoint`                      | 无当前组件     | API 字典有相关字段                                        | 字典和类型预留，未接入     |
| Usage-based Billing | Agent Sandbox                   | `cloud_sandbox`                               | 无当前组件     | 类型预留                                                  | 未接入                     |
| Fixed-term Billing  | Summary / GPU / Storage / Image | `summary` / `gpu` / `local_storage` / `image` | 无当前组件     | `getBillDetailMonthlyList`                                | API 和字典部分预留，未接入 |
| Aggregated Billing  | By Creator                      | 无当前 UI key                                 | 无当前组件     | `getBillDetailMemberList`、`getBillDetailTeamMembersList` | API 预留，未接入           |
| Aggregated Billing  | By API Key                      | 无当前 UI key                                 | 无当前组件     | `getBillDetailApiKeyList`                                 | API 预留，未接入           |

## 3. 功能与组件矩阵

| 组件                  | 业务能力                                   | 主要筛选条件                                      | 表格/展示特点                                                                            | 导出                                                        | 技术粘连点                                                                          |
| --------------------- | ------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `DetailContent`       | 查询指定用户的客户账单，并组织按量二级 tab | 用户标识：uuid/email/phone                        | 顶部用户信息输入，确认后把 `userIdentifier` 下发到表格；展示计费说明 Alert               | 无                                                          | 一级账单模式固定为 `OnDemand`；容器宽度通过读取 `.console-side-navigation` DOM 计算 |
| `SummaryTable`        | 按量总账单汇总                             | 用户标识、时间范围、Group By: Hour/Day/Week/Month | 展示账单周期、Subtotal、Voucher Discount、Total Due                                      | `总账单.xlsx`，sheet 名为 `sheetName`                       | 与 LLM/GenApi 重复请求、分页、导出逻辑；`totalDue` 取 `dict.llm.totalDue`           |
| `LLMTable`            | LLM 按量明细                               | 用户标识、时间范围、Group By、模型名称搜索        | 展示 token 输入/输出、单价、请求数、金额；支持 prompt cache、batch、多模态、阶梯价格展示 | `LLM-按量账单.xlsx`                                         | LLM 业务解释逻辑大量内聚在表格中；hover 明细、导出列、价格折扣逻辑耦合              |
| `GenApiTable`         | 图像/音频/视频 API 按量明细                | 用户标识、时间范围、Group By                      | 展示 API 名称、请求次数、金额                                                            | `图像-音频-视频-按量账单.xlsx`，sheet 名为 `GenApi Billing` | 与 Summary 请求模式高度重复                                                         |
| `BillingFieldDetails` | LLM 明细 hover 展示                        | 无筛选                                            | 使用 `HoverCard` 展示输入/输出 token 或价格明细                                          | 无                                                          | 依赖本地 `HoverCard` 和 `lucide-react` 图标；文案由调用方硬编码                     |
| `CategoryTabs`        | 一级 tab 的自定义样式实现                  | 无                                                | 声明 OnDemand、Monthly、MultiDimension                                                   | 无                                                          | 当前未被主页面使用；tab 文案硬编码英文                                              |
| `DateToggleGroup`     | Group By 的 Tabs 风格切换                  | 传入 options                                      | AntD `Tabs` 包装                                                                         | 无                                                          | 当前表格实际使用 `Segmented`，此组件未接入主链路                                    |

## 4. 数据流与请求模式

当前已接入的三个表格基本遵循同一流程：

1. `DetailContent` 维护 `userIdentifierTmp` 和已确认的 `userIdentifier`。
2. 用户点击“确认”时，如果输入为空则 `message.warning(t("billingDetails.userInfoEmpty"))`，否则把用户标识下发给表格。
3. 每个表格内部维护 `filterOptions`、`billList`、`loading`、`hasTriggeredQuery`。
4. 表格默认时间范围为 `dayjs().startOf("month")` 到 `dayjs().endOf("month")`。
5. 日期、Group By、产品名筛选变化时设置 `hasTriggeredQuery = true`，并重置 `currentPage = 1`。
6. 查询参数由表格内部构造：`cycleType`、`productCategory`、`userIdentifier`、`startTime`、`endTime`，以及可选 `productName`、`category`、`ownerId`。
7. 时间戳通过 `getTimestampByTimezone(0, date)` 转为秒级时间戳；结束时间用 `endTime.add(1, "day").subtract(1, "second")` 取日末。
8. 使用 `lodash/isEqual` 比较 `prevFilterOptions.current` 和当前筛选条件，避免重复请求。
9. 接口返回后兼容读取 `res.bills` 或 `res.data`，保存为完整 `billList`。
10. AntD `Pagination` 做客户端分页，`currentPage` 切换不重新请求，只从 `billList` slice 当前页。
11. Excel 导出基于内存中的完整 `billList`，不是只导出当前页。

当前表格没有显式传入 `AbortController` 取消旧请求。底层 `request` 封装内部有超时用的 `AbortController`，但表格快速切换筛选条件时没有业务级请求取消，只依赖 `isEqual` 避免重复请求。

### 4.1 API 合同

| API 函数                       | Endpoint                                    | 当前路由使用情况                                 | Query/行为重点                                                           |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `getBillDetailList`            | `GET /v1/admin/bill/detail/list`            | `SummaryTable`、`LLMTable`、`GenApiTable` 已使用 | `cycleType`、`productCategory`、`userIdentifier`、`startTime`、`endTime` |
| `getBillDetailCategory`        | `GET /v1/admin/bill/detail/category`        | 当前未使用                                       | 预留给产品分类筛选                                                       |
| `getBillDetailMonthlyList`     | `GET /v1/admin/bill/detail/monthly/list`    | 当前未使用                                       | 预留给包年包月账单                                                       |
| `getBillDetailMemberList`      | `GET /v1/admin/bill/detail/member/list`     | 当前未使用                                       | 预留给按创建人聚合                                                       |
| `getBillDetailApiKeyList`      | `GET /v1/admin/bill/detail/apikey/list`     | 当前未使用                                       | 会直接 `delete params.productCategory`，存在入参副作用                   |
| `getBillDetailEnterpriseList`  | `GET /v1/admin/bill/detail/enterprise/list` | 当前未使用                                       | 预留给企业账单                                                           |
| `getBillDetailTeamMembersList` | `GET /v1/admin/bill/detail/team/members`    | 当前未使用                                       | 预留给团队成员/创建人展示                                                |

### 4.2 当前响应字段使用

| 业务表  | 使用字段                                                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Summary | `startTime`、`endTime`、`amount`、`voucherAmount`、`payAmount`                                                                                                                                                                        |
| LLM     | `startTime`、`endTime`、`productName`、`billingMethod`、`billNum0..12`、`basePrice0/1/2/3/5`、`discountPrice0/1/2/3/5`、`pricePrecision`、`tieredConfig`、`multimodalPricing`、`requestCount`、`amount`、`voucherAmount`、`payAmount` |
| GenApi  | `startTime`、`endTime`、`productName`、`requestCount`、`amount`、`voucherAmount`、`payAmount`                                                                                                                                         |

## 5. 公共组件与内部工具

### 5.1 模块内部组件/工具

| 文件                                 | 职责                                          | 当前使用情况       |
| ------------------------------------ | --------------------------------------------- | ------------------ |
| `components/DetailContent.tsx`       | 页面主编排、用户标识输入、二级 tab、页面说明  | 已使用             |
| `components/SummaryTable.tsx`        | 总账单表格、查询、分页、导出                  | 已使用             |
| `components/LLMTable.tsx`            | LLM 表格、token/单价明细、查询、分页、导出    | 已使用             |
| `components/GenApiTable.tsx`         | 图像/音频/视频表格、查询、分页、导出          | 已使用             |
| `components/BillingFieldDetails.tsx` | hover 明细展示                                | 被 `LLMTable` 使用 |
| `components/CategoryTabs.tsx`        | 自定义一级 tab                                | 当前未使用         |
| `components/DateToggleGroup.tsx`     | Group By tabs 切换                            | 当前未使用         |
| `components/contant.ts`              | `tradeModes`、`tradeTypes` 常量               | 当前未使用         |
| `utils/date.ts`                      | 时间戳转换、账单周期展示、秒数/相对时间格式化 | 已使用部分函数     |
| `utils/money.ts`                     | `balanceFormat`，金额按 `v / 10000` 保留 4 位 | 已使用             |

### 5.2 项目公共组件和 UI 依赖

| 类别       | 使用项                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 页面容器   | `Card`、`CardContent` from `@/components/ui/card`                                                                                           |
| 浮层       | `HoverCard`、`HoverCardTrigger`、`HoverCardContent` from `@/components/ui/hover-card`                                                       |
| Ant Design | `Alert`、`Button`、`DatePicker.RangePicker`、`Empty`、`Input`、`Pagination`、`Segmented`、`Space`、`Table`、`Tabs`、`Typography`、`message` |
| 图标       | `ChartPie` from `lucide-react`                                                                                                              |
| 样式       | CSS Module `page.module.scss`、Tailwind utility class、CSS 变量如 `--brand-0`、`--dark-2`                                                   |

## 6. 项目技术体系

| 维度     | 当前项目实现                                                                                                                    | 对多项目复用的含义                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 应用框架 | Vite + React 19 + React Router 配置式路由                                                                                       | 共享模块不能假设 Next/App Router                             |
| 路由加载 | `lazyWithRetry` 懒加载页面组件                                                                                                  | 共享入口需要适配各项目路由注册方式                           |
| 权限     | 路由配置上声明 `permission: "/pricing/customer-bill-new"` 和 `requireAuth: true`                                                | 权限应作为宿主路由/权限适配层，不进入业务 core               |
| 状态管理 | 项目有 Redux Toolkit，但当前模块只用组件本地 state                                                                              | 当前模块较适合抽 headless hook；无需绑定 Redux               |
| 请求封装 | `request` from `src/api/fetch.ts`，自动拼接 `import.meta.env.BACKEND_BASE_URL`、Authorization、401 跳转、错误 toast、超时 abort | API transport 应抽 adapter，避免共享模块直接依赖宿主请求封装 |
| 多语言   | `react-i18next`，`billingDetails` 作为命名空间对象通过 `t("billingDetails", { returnObjects: true })` 获取                      | 共享模块应统一 message key，而不是依赖整个 dict object shape |
| 语言选择 | localStorage `language` > `import.meta.env.isGlobal` > 默认；fallback 为 `zh-CN`                                                | 多端项目需要统一语言来源和默认语言策略                       |
| 日期     | `dayjs` 值对象 + 自定义 `getTimestampByTimezone(0)`                                                                             | 时区策略要外置配置，尤其和其他项目的 UTC+8/UTC 差异          |
| 金额     | 后端金额按万分制展示，`balanceFormat(v) = v / 10000`，0 返回数字 `0`                                                            | 金额单位、币种符号、精度应形成 money adapter                 |
| 导出     | 浏览器端 `xlsx` 手工生成 workbook                                                                                               | 表格列和导出列应从同一份 schema 派生                         |
| 表格分页 | 前端全量数据 client-side slice                                                                                                  | 大数据场景下需要确认服务端分页能力                           |
| 类型体系 | 行数据主要用 `Record<string, any>`；接口 params 也是 `any`                                                                      | 跨项目统一前需要补齐 API response 类型和产品枚举类型         |

## 7. 多语言与文案现状

当前模块同时存在字典文案和硬编码文案。

| 文案来源       | 示例                                                                                             | 风险                                         |
| -------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| i18n 字典      | `billingDetails.userInfo`、`billingDetails.summary.displayName`、`billingDetails.llm.inputUsage` | 字典对象 shape 被表格直接依赖                |
| 菜单字典       | `menu.pricingCustomerBillNew`                                                                    | 路由菜单与模块字典分离                       |
| 硬编码中文     | “确认”、`获取账单数据失败`、`当前无账单数据`、`总账单.xlsx`、`LLM-按量账单.xlsx`                 | 英文环境仍可能出现中文 toast/文件名/导出表头 |
| LLM 明细硬编码 | “文本输入”、“图像输入”、“详情”、“原价”、“折后价”                                                 | 多模态和价格明细无法直接跨语言复用           |
| 硬编码英文     | `CategoryTabs` 的 `Usage-based Billing` / `Fixed-term Billing` / `Aggregated Billing`            | 未接入主链路，但后续启用会绕过 i18n          |

建议后续统一的 key 维度：

- `billingDetail.actions.confirm`
- `billingDetail.errors.fetchFailed`
- `billingDetail.exports.summary.fileName`
- `billingDetail.exports.llm.fileName`
- `billingDetail.llm.modalities.text/image/audio/video`
- `billingDetail.llm.price.original`
- `billingDetail.llm.price.discounted`
- `billingDetail.tabs.onDemand/monthly/aggregated/enterprise`

## 8. 外部依赖清单

| 依赖                                                             | 当前用途                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------ |
| `react` / `react-dom`                                            | 页面组件、hooks、本地状态                              |
| `react-router-dom`                                               | 项目路由体系                                           |
| `antd`                                                           | 表格、分页、日期选择、输入、按钮、提示、Tabs/Segmented |
| `react-i18next` / `i18next` / `i18next-browser-languagedetector` | 运行时多语言                                           |
| `dayjs`                                                          | 日期选择器值、默认时间范围、时间计算                   |
| `xlsx`                                                           | Excel 导出                                             |
| `lodash/isEqual`                                                 | 筛选条件深比较                                         |
| `lucide-react`                                                   | hover 明细图标                                         |
| `@reduxjs/toolkit` / `react-redux`                               | 项目级存在，但当前模块未直接使用                       |
| `tailwindcss` / CSS Modules                                      | 样式组织                                               |

## 9. 业务与技术粘连点

| 粘连区域    | 当前表现                                                              | 工程风险                                        |
| ----------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| 业务 tab    | 实际只渲染 `OnDemand`；预留 tab 和 API 没有统一 registry              | 多项目对齐时容易把“预留能力”误认为“已上线能力”  |
| 用户查询    | 用户标识由父组件维护，表格内部也保留被注释的用户搜索 UI               | 交互职责边界不清，后续复制表格容易带出重复入口  |
| 查询逻辑    | 三个表格各自拼请求、管理 loading、分页、导出                          | 新增筛选/修复时间规则需要逐表修改               |
| 日期策略    | `dayjs` 本地默认值 + `getTimestampByTimezone(0)` + 日末扩展散落在表格 | 时区或边界规则变更容易漏改                      |
| LLM 展示    | prompt cache、多模态、折扣价、阶梯价都写在 `LLMTable`                 | 难复用于 API Key 聚合、其他项目或移动端         |
| 导出        | 每张表手写 XLSX header、sheetName、filename                           | UI 列和导出列容易不一致，文件名多语言容易漂移   |
| i18n        | 字典对象、硬编码中文、硬编码英文混用                                  | 同一模块在中英文或多项目下表现不稳定            |
| 类型        | `any` / `Record<string, any>` 覆盖 API 数据                           | 多端统一时缺少可验证的数据契约                  |
| API wrapper | `getBillDetailApiKeyList` 会 mutate 入参                              | 共享 query builder 复用时可能产生隐式副作用     |
| UI 组件     | AntD 与本地 shadcn-like Card/HoverCard 混用                           | 跨项目复用需要 UI adapter，不能直接共享视图组件 |

## 10. 可复用拆分建议

建议按“业务 core + 宿主 adapter + 项目特有层”三层收敛。

| 层级             | 可收敛内容                                                                                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared core      | billing mode registry、product tab registry、`BillDetailFilter`、产品 category enum、API response 类型、query params builder、date range normalization、money formatter、LLM token/cache/multimodal formatter、table/export column schema |
| Host adapter     | AntD/其他 UI 组件、路由注册、权限判断、request transport、i18n `t`、toast、currency/timezone、用户/团队身份解析、Excel 下载实现                                                                                                           |
| Project-specific | 是否只开放 OnDemand、是否启用 Monthly/MultiDimension/Enterprise、品牌专属产品品类、语言默认策略、后台权限 key、菜单位置                                                                                                                   |

优先抽取顺序：

1. 抽 `buildBillDetailListParams(filter, timezonePolicy)`，统一 `cycleType`、用户标识、时间戳和 endTime 包含规则。
2. 抽 `useBillDetailQuery`，统一 loading、重复请求判断、错误处理、响应 `bills/data` 兼容。
3. 抽 `useClientPagination`，减少每张表重复 slice。
4. 抽 table/export schema，让 Summary、GenApi 先共用一套列定义。
5. 抽 LLM formatter，把 prompt cache、多模态、阶梯价、折扣价从 `LLMTable` 拆为纯函数和渲染 adapter。
6. 补齐 `BillDetailRow`、`LLMBillRow`、`GenApiBillRow`、`SummaryBillRow` 类型，替代 `Record<string, any>`。

## 11. 统一采集模板补充

后续审计其他项目相同 billdetail/customer-bill-new 模块时，建议除了前文模板外，额外收集这些维度：

| 维度                  | 需要记录的问题                                                                 |
| --------------------- | ------------------------------------------------------------------------------ |
| 已上线 vs 预留        | 哪些 tab/API/字典/类型是真正渲染的，哪些只是预留或历史残留？                   |
| 用户查询入口          | 用户标识、团队、成员、API key 是父组件统一控制，还是每张表自己控制？           |
| Product category 映射 | 前端 tab key、API `productCategory`、后端 category、导出文件名是否一一对应？   |
| 时间策略              | 默认时间范围、时区、开始/结束是否闭区间、秒/毫秒单位、是否有最大查询跨度       |
| 请求取消/竞态         | 是否用 AbortController、fetchSeq、SWR/React Query，还是没有取消旧请求？        |
| 响应兼容              | 接口返回字段是 `bills`、`data`、`list` 还是分页对象？                          |
| 表格列来源            | UI 列和导出列是否共用 schema？是否存在导出独有动态列？                         |
| 复杂产品 formatter    | LLM prompt cache、多模态、阶梯价、batch、storage 单位等是否内聚在组件里？      |
| 多语言覆盖            | tab、按钮、toast、tooltip、文件名、sheetName、动态导出列是否全走 i18n？        |
| 权限边界              | 权限在路由层、页面层、tab 层还是按钮层？是否有企业/团队/语言/区域开关？        |
| 状态管理              | 本地 state、Redux、URL query、Context、React Query/SWR 的职责分别是什么？      |
| 外部依赖              | UI kit、Excel、date、decimal、lodash、icons、request client 是否可由宿主替换？ |

## 12. 当前模块工程问题判断

这个项目的 `customer-bill-new` 当前处于“按量账单三张表可用，其他账单能力预留但未接入”的阶段。它的主要问题不是单个 UI 组件，而是同一套账单表格模式在每张表里重复实现：筛选状态、请求参数、时间戳、分页、导出、错误提示都散落在组件中。

如果要解决多端多项目一个功能模块的工程问题，应先统一“账单能力 registry + query/filter core + table/export schema + host adapter”。当前项目适合作为轻量样本：先从 Summary 和 GenApi 这两张结构简单的表提取公共查询/分页/导出模式，再处理 LLM 这种复杂 formatter，最后再评估是否把 Monthly、MultiDimension、Enterprise 的预留 API 真正接入。
