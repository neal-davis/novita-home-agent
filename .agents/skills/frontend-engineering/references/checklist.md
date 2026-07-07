# 生成后自检清单

每轮代码完成后检查高风险结果项。**不检查"有没有加载 reference"，只检查结果是否符合规范。**

---

### 代码结构

- [ ] **文件归位** — 新增文件目录位置正确；无配置对象 / SVG / 校验规则内联在组件文件里
- [ ] **组件设计** — Props 已定义类型；状态管理方式与项目现有模式一致；无为单次使用而抽象的 hook 或组件
- [ ] **样式合规** — 无绕过项目体系的硬编码色值 / 间距 / 圆角；token 值来源遵循优先级：项目 `global-*` reference → `tailwind.config` → `theme.scss` → `_design-tokens.scss`；未命中品牌 reference 时不自行假设值；自定义 Tailwind 类和 `var(--xxx)` 引用的变量均已在项目中声明（见 `styling-system.md` Token 存在性约束）
- [ ] **逻辑一致性** — 修改了业务逻辑（状态枚举 / 条件判断 / 展示规则）时，项目中所有出现该概念的位置已同步更新，无遗漏

### 隔离与边界

- [ ] **非业务隔离** — `.preview` / `.mock` / `.demo` 等非业务文件未混入正式模块，正式代码未 import 它们
- [ ] **RSC 边界** — `'use client'` 仅用于确需客户端能力的组件；数据获取在 Server Component 完成；Client Component 未 import 服务端库
- [ ] **循环依赖** — 新增 import 未引入循环依赖链（A → B → C → A）

### 状态管理

- [ ] **归属合理** — 新增 state 已按决策链判断归属（组件本地 / Context / 全局 store / Query 缓存），无无理由升全局
- [ ] **无重复真相** — 同一资源未同时存在于全局 store 和 Query 缓存，两套长期维护同一列表
- [ ] **加载 / 错误态明确** — 未用全局布尔（`isLoading: true`）替代明确的加载态 / 错误态；异步操作有对应状态字段
- [ ] **刷新可用** — 依赖全局 state 的页面刷新后数据仍可恢复（URL 参数 / 持久化 / SSR 注水），无白屏或数据丢失

### API 层

- [ ] **接口归位** — 新接口落在正确的领域文件（`api/` / `services/`），未随机新建 `utils.ts`
- [ ] **baseURL 来源** — `baseURL` 来自环境变量或项目既有常量，未硬编码
- [ ] **鉴权一致** — 鉴权方式与同模块其他接口一致，无孤立的认证逻辑
- [ ] **密钥隔离** — 未在客户端直连需要保密的接口；服务端专用密钥未使用 `NEXT_PUBLIC_*` 暴露

### 类型与数据

- [ ] **类型完整性** — 所有数据流（API 响应 / Props / 状态）均有类型定义；无隐式 `any` 或 `as any` 强转
- [ ] **空值处理** — null / undefined 有合理处理，不假设数据一定存在
- [ ] **加载态** — 异步操作 / 数据获取有 loading skeleton 或 loading indicator，不在数据就绪前渲染空壳

### 边界与错误

- [ ] **空集合** — 列表为空时有 empty state，不渲染空壳
- [ ] **异常不吞没** — 无空 `catch {}`，错误至少上报或展示；关键 UI 区域有 Error Boundary

### 安全

- [ ] **凭证安全** — 无硬编码 Key / Token / Secret；客户端无非 `NEXT_PUBLIC_` 环境变量；隐私字段已脱敏
- [ ] **XSS** — 无 `dangerouslySetInnerHTML` 未转义内容、无拼接 HTML
- [ ] **注入** — URL / SQL / 命令参数做了校验和转义
- [ ] **SSRF** — 服务端请求的目标地址不由用户输入直接控制
- [ ] **竞态** — 并发请求 / 快速操作场景有防重处理（debounce / AbortController）
- [ ] **鉴权缺口** — 敏感操作和页面有权限守卫，不仅依赖前端路由

### 构建

- [ ] **类型检查** — `tsc --noEmit` 无报错；修改了共享类型 / 配置文件 / 大范围重构时已执行完整 `npm run build`
- [ ] **Lint** — 修改文件已通过 lint:fix + format，无残留 ESLint 报错

### 可维护性

- [ ] **死代码** — 搜索引用时覆盖别名路径（`@/`、`~/`、`tsconfig paths`），确认无未引用的 export、变量、注释代码块、遗留 preview / mock 文件
- [ ] **删除影响** — 本轮有删除文件 / export / 函数时：静态 import、动态 import（`import()`）、re-export 链（barrel `index.ts`）、类型引用（`typeof`）四类均已确认零残留，或已在同一次改动中同步清理
- [ ] **回滚安全** — 大范围改动前已建议用户 commit；未在同一次改动中混合功能开发与重构

---

## 项目条件自检

仅当当前工作区命中对应项目时检查。不要把 PPIO / Novita / JieKou 的 token、字体或组件规则交叉套用。

### PPIO / ppinfra

- [ ] **Token 合规** — 颜色、spacing、radius、shadow、height 使用 `global-ppio.md` / `ppio-design-tokens.md` 中的语义类或 `var(--*)`；新代码无 `gap-4`、`p-6`、`rounded-lg`、`shadow-sm`、`text-sm font-medium` 这类裸工具组合
- [ ] **特殊值标注** — 必需的一次性宽高、z-index、line-height 等任意值有 `special: reason` 或 PR 说明
- [ ] **组件优先** — Button、Select、SearchInput、Tabs、Pagination、DatePicker/DateRangePicker、Table 使用项目组件，不手写 native 控件
- [ ] **表格规则** — 新表格不用 native table tags；表头、操作列、状态色符合 `component-ppio/table.md`
- [ ] **筛选栏一致** — filter bar 控件高度、圆角、reset、必填星号、DateRangePicker 边框符合 `component-ppio/standard.md`
- [ ] **Logo** — ppinfra console 页面 header 保留官方 PPIO logo，不用文本或占位替代

### Novita

- [ ] **场景正确** — Website 使用 `max_width_container`；Console 使用 `console-card`；Console 不使用 website-only 大标题，Website 不使用 console-only 字体
- [ ] **Token 合规** — 不硬编码 `#23d57c` / `#fafafa` 等；Tailwind utility、spacing、radius、shadow、font/text 类符合 `global-novita.md` 的优先级；设计指定项目 token 时没有用 generic palette 或 arbitrary value 绕过
- [ ] **字体边界** — Miletus 用于人类可读 copy；TT Mono 只用于机器语义标签，单个文本节点不混用
- [ ] **组件优先** — shadcn/ui first；antd 仅作为明确 fallback；不直接 import antd Button
- [ ] **真实入口** — Empty/NoData、message、DateRangePicker、Pagination、Tooltip 等使用 `component-novita.md` 中当前 `novita-home` 存在的路径；没有生成 `@/components/ui/standard/empty`
- [ ] **SCSS 边界** — 新 UI 优先 Tailwind utilities + token；未为普通布局新增 SCSS Module，维护既有 module 时保持局部一致
- [ ] **Sidebar 不臆造** — Console sidebar 菜单、icon、logo、三段布局来自项目既有数据或代码
- [ ] **英文内容质量** — UI 文案拼写、大小写、术语、mock 数据质量符合 `global-novita.md`
- [ ] **Redux hooks** — 使用 `useAppSelector` / `useAppDispatch`
- [ ] **浮层层级** — Header、Dialog、Select/Dropdown 使用项目既有 z-index 规则，不新增任意大 z-index

### JieKou

- [ ] **场景正确** — Console 不使用 `font-h0/h1/h2/h3`；Website 使用 `max_width_container`；Console 使用 console layout / header 变量
- [ ] **Token 合规** — 颜色使用 `var(--brand-*)`、`var(--dark-*)`、`var(--gray-*)`、`var(--fill-*)` 等；不使用 `bg-violet-*`、`text-gray-*` 或 hardcoded hex
- [ ] **字体合规** — 每个可见文本元素使用一个语义 font class，不使用裸 `text-sm`、`font-semibold`
- [ ] **组件优先** — shadcn/ui first；antd 仅作为 fallback；不直接 import antd Button，不手写 native select/table
- [ ] **AI components** — 聊天、流式回答、工具调用、引用、代码块、预览等场景优先查 `@/components/ai-elements/`
- [ ] **权限域** — 涉及 RBAC、菜单或导航可见性时，权限组来自 `global-jiekou.md` 中列出的既有资源组
- [ ] **模块数据不臆造** — 业务模块、路由、sidebar 或组件能力优先来自项目既有数据/代码；不要凭页面主题补不存在的模块
