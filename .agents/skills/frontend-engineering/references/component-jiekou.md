---
name: jiekou-base-component-style
description: >
  JieKou `src/components/ui`、`src/components/ui/standard` 与 `@/components/ai-elements`：索引 + 按需加载
  `component-jiekou/<组件>.md`（全小写文件名）；各文件含真实入口、关键类名、z-index 与源码对账。
  全局 token、字体、spacing、radius、阴影规则见 global-jiekou。
  触发：改 shadcn 封装、standard 业务组件、AI chat 组件、表单与对话框、Popover/Dropdown、token 与源码对账、Figma 转类名。
---

# JieKou UI 基础组件 — 索引与按需加载

**文档定位**：`src/components/ui`、`src/components/ui/standard` 与 `src/components/ai-elements` 的组件入口、类名惯例和源码对账。全局 Tailwind、design token、字体、双场景规则与 magic value 规则以 [`global-jiekou.md`](./global-jiekou.md)、`tailwind.config.ts` 和真实 `jiekou-home-github` 源码为准。

**用法**：先读本索引；实现或审查某一组件时，只打开下表中对应的 [`component-jiekou/`](./component-jiekou/) 分文件，避免整包上下文浪费。浮层层级特例见 [`z-index.md`](./component-jiekou/z-index.md)，业务封装见 [`standard.md`](./component-jiekou/standard.md)，AI 组件见 [`ai-elements.md`](./component-jiekou/ai-elements.md)。

---

## 按需加载（按场景选文件）

路径均为 `references/component-jiekou/<name>.md`（相对本 skill：`./component-jiekou/<name>.md`）。

### 表单与控件

| 场景                                       | 加载                                                                               |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| Button / ButtonArrow / 业务 Button wrapper | [`button.md`](./component-jiekou/button.md)                                        |
| Input / SearchInput                        | [`input.md`](./component-jiekou/input.md)                                          |
| Textarea                                   | [`textarea.md`](./component-jiekou/textarea.md)                                    |
| Select（Trigger / Content / Item）         | [`select.md`](./component-jiekou/select.md)                                        |
| Checkbox                                   | [`checkbox.md`](./component-jiekou/checkbox.md)                                    |
| Radio Group                                | [`radio-group.md`](./component-jiekou/radio-group.md)                              |
| Switch                                     | [`switch.md`](./component-jiekou/switch.md)                                        |
| Toggle / ToggleGroup                       | [`toggle.md`](./component-jiekou/toggle.md)                                        |
| Slider                                     | [`slider.md`](./component-jiekou/slider.md)                                        |
| Tabs                                       | [`tabs.md`](./component-jiekou/tabs.md)                                            |
| Form / Label                               | [`form.md`](./component-jiekou/form.md)、[`label.md`](./component-jiekou/label.md) |
| PasswordStrengthInput                      | [`password-strength-input.md`](./component-jiekou/password-strength-input.md)      |

### 展示与布局

| 场景                    | 加载                                                  |
| ----------------------- | ----------------------------------------------------- |
| Card                    | [`card.md`](./component-jiekou/card.md)               |
| Badge                   | [`badge.md`](./component-jiekou/badge.md)             |
| Alert                   | [`alert.md`](./component-jiekou/alert.md)             |
| Separator               | [`separator.md`](./component-jiekou/separator.md)     |
| Skeleton                | [`skeleton.md`](./component-jiekou/skeleton.md)       |
| ScrollArea              | [`scroll-area.md`](./component-jiekou/scroll-area.md) |
| Collapsible             | [`collapsible.md`](./component-jiekou/collapsible.md) |
| Avatar                  | [`avatar.md`](./component-jiekou/avatar.md)           |
| Table                   | [`table.md`](./component-jiekou/table.md)             |
| Calendar / Calendar UTC | [`calendar.md`](./component-jiekou/calendar.md)       |

### 复合、导航与反馈

| 场景                                       | 加载                                                    |
| ------------------------------------------ | ------------------------------------------------------- |
| Carousel                                   | [`carousel.md`](./component-jiekou/carousel.md)         |
| Pagination                                 | [`pagination.md`](./component-jiekou/pagination.md)     |
| ButtonGroup                                | [`button-group.md`](./component-jiekou/button-group.md) |
| Toast / Sonner / message / notification    | [`toast.md`](./component-jiekou/toast.md)               |
| Command（cmdk）                            | [`command.md`](./component-jiekou/command.md)           |
| AI chat / streaming / tool call / citation | [`ai-elements.md`](./component-jiekou/ai-elements.md)   |

### 日期、筛选与 standard 业务封装

| 场景                                                                  | 加载                                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| DateRangePicker / UTC / Dayjs                                         | [`date-range-picker.md`](./component-jiekou/date-range-picker.md) |
| SelectFilter / CascadeFilter / SelectItems                            | [`select-filter.md`](./component-jiekou/select-filter.md)         |
| NoData / SandboxNoData / EmptyPageLoading / Loading / Progress / Copy | [`standard.md`](./component-jiekou/standard.md)                   |

### 浮层与对话框

| 场景                     | 加载                                                          |
| ------------------------ | ------------------------------------------------------------- |
| Dialog                   | [`dialog.md`](./component-jiekou/dialog.md)                   |
| AlertDialog              | [`alert-dialog.md`](./component-jiekou/alert-dialog.md)       |
| Sheet                    | [`sheet.md`](./component-jiekou/sheet.md)                     |
| Drawer                   | [`drawer.md`](./component-jiekou/drawer.md)                   |
| Popover                  | [`popover.md`](./component-jiekou/popover.md)                 |
| HoverCard                | [`hover-card.md`](./component-jiekou/hover-card.md)           |
| Tooltip / AppTooltip     | [`tooltip.md`](./component-jiekou/tooltip.md)                 |
| DropdownMenu             | [`dropdown-menu.md`](./component-jiekou/dropdown-menu.md)     |
| NavigationMenu           | [`navigation-menu.md`](./component-jiekou/navigation-menu.md) |
| z-index 硬编码与浮层层级 | [`z-index.md`](./component-jiekou/z-index.md)                 |

---

## 速查（链到分文件）

| 组件          | 圆角要点                                      | 边框 / 表面要点                                                                           | 详情                                                    |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Button        | 基础类 `rounded-lg`                           | default `bg-primary text-background`；outline/ghost 源码仍有 `#BBB9B6` legacy 边框        | [`button.md`](./component-jiekou/button.md)             |
| Input         | `rounded-md`                                  | `border bg-background`；hover/focus `border-input-hover`                                  | [`input.md`](./component-jiekou/input.md)               |
| Select        | Trigger `rounded-[6px]`；Content `rounded-md` | Trigger `border-[var(--gray-2)]`；Content `bg-popover shadow-md` + inline `zIndex: 10002` | [`select.md`](./component-jiekou/select.md)             |
| Dialog        | `sm:rounded-lg`                               | Overlay `bg-black/50`；Content `border bg-background p-6 shadow-lg`；`z-[1001]`           | [`dialog.md`](./component-jiekou/dialog.md)             |
| AlertDialog   | `sm:rounded-lg`                               | Overlay `bg-black/40`；Overlay `z-999` / Content `z-1000`                                 | [`alert-dialog.md`](./component-jiekou/alert-dialog.md) |
| Table         | 无外层卡片圆角                                | wrapper `overflow-auto scrollBar_container`；Cell `px-4 py-2 font-table-item`             | [`table.md`](./component-jiekou/table.md)               |
| Standard 封装 | 多数使用 `rounded-[6px]` 或 shadcn 基础圆角   | 真实业务入口、NoData、Notify、Filter、DateRange                                           | [`standard.md`](./component-jiekou/standard.md)         |

---

## 组件库优先级

1. **shadcn/ui first**：`@/components/ui/` 是默认选择。
2. **antd fallback**：仅在 shadcn 不足时使用复杂排序 Table、`InputNumber`、`Upload`、`Image preview`、`DatePicker`、`Cascader` 等；toast/message 优先用项目 `standard/notify`。
3. **项目 wrapper**：业务按钮优先用 `@/app/components/button/Button`；维护 shadcn 基础按钮时用 `@/components/ui/button`。
4. **AI 专属场景**：聊天、流式回答、引用、工具调用、代码块、预览等优先用 `@/components/ai-elements`。

## 真实组件入口

| 场景            | 优先入口                                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button          | `import Button from "@/app/components/button/Button"`；基础 variant 用 `import { Button } from "@/components/ui/button"`                                                                                                                    |
| Card            | `import { Card, CardContent } from "@/components/ui/card"`                                                                                                                                                                                  |
| Dialog          | `@/components/ui/dialog`；确认/提示弹窗用 `@/components/ui/standard/confirm-dialog`、`info-dialog`、`warning-dialog`                                                                                                                        |
| Toast / message | `import { message, notify, notification } from "@/components/ui/standard/notify"`                                                                                                                                                           |
| Empty state     | `import { NoData } from "@/components/ui/standard/no-data"`；sandbox 用 `import { SandboxNoData } from "@/components/ui/standard/sandbox-no-data"`；整页加载用 `import EmptyPageLoading from "@/components/ui/standard/empty-page-loading"` |
| Table           | `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"`                                                                                                                                     |
| Pagination      | 基础 `@/components/ui/pagination`；业务分页默认导入 `@/components/ui/standard/pagination`                                                                                                                                                   |
| Date range      | 默认导入 `@/components/ui/standard/date-range-picker`；UTC 场景默认导入 `date-range-picker-utc` 或 `date-range-picker-utc-common`；Dayjs 场景用 `import { DayjsRangePicker } from "@/components/ui/standard/dayjs-range-picker"`            |
| Select / filter | 基础 `@/components/ui/select`；可搜索筛选用 `import { SelectFilter } from "@/components/ui/standard/selectFilter"`；简单枚举用 `import { SelectItems } from "@/components/ui/standard/select-items"`                                        |
| Tooltip         | 基础 `@/components/ui/tooltip`；业务 wrapper 用 `import { AppTooltip } from "@/components/ui/standard/tooltip"`                                                                                                                             |
| Form error      | `@/components/ui/standard/form-error-text`                                                                                                                                                                                                  |
| Number / slider | `import { NumberInput } from "@/components/ui/standard/number-input"`、`import { ValueSlider } from "@/components/ui/standard/value-slider"`                                                                                                |
| Code copy       | `@/components/ui/standard/code-copy-btn` 或 `code-with-btn`                                                                                                                                                                                 |
| AI elements     | `@/components/ai-elements/<name>`，详见 [`ai-elements.md`](./component-jiekou/ai-elements.md)                                                                                                                                               |

`@/components/ui/standard/empty` 在当前 JieKou 源码中不存在，不要生成这个 import。

---

## 跨组件约定（禁用）

- 禁止 `import { Button } from "antd"`。
- 禁止 native `<select>`，优先 shadcn Select。
- 禁止 native `<table>`，优先项目 Table 或明确封装后的表格组件。
- 禁止 emoji icon。
- 禁止手写 lucide SVG path；从 `lucide-react` import 图标。
- 禁止 `useSelector` / `useDispatch`，使用 typed hooks。
- 新 UI 优先 Tailwind utilities + token；避免为了普通布局新增 SCSS Module。维护既有 `.module.scss` 组件时遵循原文件模式。
- 新建浮层前先查 [`z-index.md`](./component-jiekou/z-index.md)，不要新增随意 `z-[9999]`。

## 表单与交互

- 所有 clickable 元素必须有 `cursor-pointer` 和可见 hover/focus 状态。
- async button 需要 loading/disabled，防重复提交。
- 删除、危险操作需要确认弹窗。
- 表单错误显示在字段附近，不能只靠 toast。
- icon-only button 必须有 `aria-label`。
- loading/streaming 状态需要明确占位或状态反馈。

## 布局与响应式

- Website 与 Console 场景先查 `global-jiekou.md` 和现有 page/container 类，不要臆造 sidebar/header。
- 移动端不允许页面级横向滚动；表格和宽内容局部包裹横向滚动容器。
- hover/focus 状态不能通过 scale 或边框新增造成布局抖动。

## 实施检查清单

- [ ] 命中 JieKou 项目时已按场景加载对应 `component-jiekou/<name>.md`。
- [ ] 新业务 UI 优先项目现有组件入口，没有生成不存在的 `@/components/ui/standard/empty`。
- [ ] Button、Table、Select、DateRangePicker、Pagination、Tooltip、Notify 使用真实导出名。
- [ ] AI chat/streaming/tool/citation 场景优先查 `@/components/ai-elements`。
- [ ] 浮层 z-index 与 Dialog 1001、AlertDialog 999/1000、Drawer 1000、Select 10002 的关系明确。
- [ ] 颜色优先使用 token class 或 `var(--*)`；不要新增 hardcoded hex/rgb。
- [ ] 新增 SCSS Module 仅限复杂组件或既有 module 延续，普通布局使用 Tailwind utilities。
- [ ] 状态色、错误提示、loading/disabled、防重复提交符合对应分文件。

## 参考路径

| 文件                                                                              | 内容                                                                 |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `src/components/ui/*.tsx`                                                         | shadcn/Radix 基础组件                                                |
| `src/components/ui/standard/*.tsx`                                                | Console/业务封装、NoData、Notify、DateRange、Filter                  |
| `src/components/ai-elements/*.tsx`                                                | AI chat、streaming response、tool call、citation、preview 等专属组件 |
| `src/components/ui/button.module.scss`、`table.module.scss`、`tabs.module.scss`   | 基础组件补充样式                                                     |
| `src/styles/_design-tokens.scss`、`src/styles/theme.scss`、`src/app/globals.scss` | token、legacy 变量、全局字体与容器                                   |
| `tailwind.config.ts`                                                              | Tailwind token、颜色、字体、radius、shadow、z-index                  |
