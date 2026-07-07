---
name: novita-base-component-style
description: >
  Novita `src/components/ui`：索引 + 按需加载 `component-novita/<组件>.md`（全小写文件名）；
  各文件含圆角、边框、背景、阴影、z-index 与真实源码路径；全局 token、字体、spacing、radius、阴影规则见 global-novita。
  触发：改 shadcn 封装、表单与对话框、Popover/Dropdown、token 与源码对账、Figma 转类名。
---

# Novita UI 基础组件 — 索引与按需加载

**文档定位**：`src/components/ui` 与 `src/components/ui/standard` 的组件入口、类名惯例和源码对账。全局 Tailwind、design token、场景、字体和 magic value 规则以 [`global-novita.md`](./global-novita.md)、[`novita-design-tokens.md`](./novita-design-tokens.md) 与真实 `novita-home` 源码为准。

**用法**：先读本索引；实现或审查某一组件时，只打开下表中对应的 [`component-novita/`](./component-novita/) 分文件，避免整包上下文浪费。浮层层级特例见 [`z-index.md`](./component-novita/z-index.md)，业务封装见 [`standard.md`](./component-novita/standard.md)。

---

## 按需加载（按场景选文件）

路径均为 `references/component-novita/<name>.md`（相对本 skill：`./component-novita/<name>.md`）。

### 表单与控件

| 场景                               | 加载                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Button / ButtonArrow               | [`button.md`](./component-novita/button.md)                                        |
| Input / SearchInput                | [`input.md`](./component-novita/input.md)                                          |
| Textarea                           | [`textarea.md`](./component-novita/textarea.md)                                    |
| Select（Trigger / Content / Item） | [`select.md`](./component-novita/select.md)                                        |
| Checkbox                           | [`checkbox.md`](./component-novita/checkbox.md)                                    |
| Radio Group                        | [`radio-group.md`](./component-novita/radio-group.md)                              |
| Switch                             | [`switch.md`](./component-novita/switch.md)                                        |
| Toggle / ToggleGroup               | [`toggle.md`](./component-novita/toggle.md)                                        |
| Slider                             | [`slider.md`](./component-novita/slider.md)                                        |
| Tabs                               | [`tabs.md`](./component-novita/tabs.md)                                            |
| Form / Label                       | [`form.md`](./component-novita/form.md)、[`label.md`](./component-novita/label.md) |
| PasswordStrengthInput              | [`password-strength-input.md`](./component-novita/password-strength-input.md)      |

### 展示与布局

| 场景                    | 加载                                                  |
| ----------------------- | ----------------------------------------------------- |
| Card                    | [`card.md`](./component-novita/card.md)               |
| Badge                   | [`badge.md`](./component-novita/badge.md)             |
| Alert                   | [`alert.md`](./component-novita/alert.md)             |
| Separator               | [`separator.md`](./component-novita/separator.md)     |
| Skeleton                | [`skeleton.md`](./component-novita/skeleton.md)       |
| ScrollArea              | [`scroll-area.md`](./component-novita/scroll-area.md) |
| Collapsible             | [`collapsible.md`](./component-novita/collapsible.md) |
| Avatar                  | [`avatar.md`](./component-novita/avatar.md)           |
| Table                   | [`table.md`](./component-novita/table.md)             |
| Calendar / Calendar UTC | [`calendar.md`](./component-novita/calendar.md)       |

### 复合、导航与反馈

| 场景                     | 加载                                                    |
| ------------------------ | ------------------------------------------------------- |
| Carousel                 | [`carousel.md`](./component-novita/carousel.md)         |
| Pagination               | [`pagination.md`](./component-novita/pagination.md)     |
| ButtonGroup              | [`button-group.md`](./component-novita/button-group.md) |
| Toast / Sonner / message | [`toast.md`](./component-novita/toast.md)               |
| Command（cmdk）          | [`command.md`](./component-novita/command.md)           |

### 日期、筛选与 standard 业务封装

| 场景                                                  | 加载                                                              |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| DateRangePicker / UTC / Dayjs                         | [`date-range-picker.md`](./component-novita/date-range-picker.md) |
| SelectFilter / CascadeFilter / SelectItems            | [`select-filter.md`](./component-novita/select-filter.md)         |
| NoData / EmptyPageLoading / Loading / Progress / Copy | [`standard.md`](./component-novita/standard.md)                   |

### 浮层与对话框

| 场景                     | 加载                                                          |
| ------------------------ | ------------------------------------------------------------- |
| Dialog                   | [`dialog.md`](./component-novita/dialog.md)                   |
| AlertDialog              | [`alert-dialog.md`](./component-novita/alert-dialog.md)       |
| Sheet                    | [`sheet.md`](./component-novita/sheet.md)                     |
| Drawer                   | [`drawer.md`](./component-novita/drawer.md)                   |
| Popover                  | [`popover.md`](./component-novita/popover.md)                 |
| HoverCard                | [`hover-card.md`](./component-novita/hover-card.md)           |
| Tooltip / AppTooltip     | [`tooltip.md`](./component-novita/tooltip.md)                 |
| DropdownMenu             | [`dropdown-menu.md`](./component-novita/dropdown-menu.md)     |
| NavigationMenu           | [`navigation-menu.md`](./component-novita/navigation-menu.md) |
| z-index 硬编码与浮层层级 | [`z-index.md`](./component-novita/z-index.md)                 |

---

## 速查（链到分文件）

| 组件          | 圆角要点                                                         | 边框 / 表面要点                                                                           | 详情                                                    |
| ------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Button        | 基础类 `rounded-full`；console size 通过 `page=console` 覆盖高度 | default `bg-[var(--dark-1)]`；secondary `border-[var(--border-strong)] bg-white`          | [`button.md`](./component-novita/button.md)             |
| Input         | `rounded-md`                                                     | `border bg-background`；hover/focus `border-input-hover`                                  | [`input.md`](./component-novita/input.md)               |
| Select        | Trigger `rounded-[6px]`；Content `rounded-md`                    | Trigger `border-[var(--gray-2)]`；Content `bg-popover shadow-md` + inline `zIndex: 10002` | [`select.md`](./component-novita/select.md)             |
| Dialog        | `sm:rounded-lg`                                                  | Overlay `bg-black/50`；Content `border bg-background p-6 shadow-lg`；`z-[1001]`           | [`dialog.md`](./component-novita/dialog.md)             |
| AlertDialog   | `sm:rounded-lg`                                                  | Overlay `bg-black/40`；Content `shadow-lg`；`z-[10003]/[10004]`                           | [`alert-dialog.md`](./component-novita/alert-dialog.md) |
| Table         | 无外层卡片圆角                                                   | wrapper `overflow-auto`；Head/Cell 内置 `font-table-*`                                    | [`table.md`](./component-novita/table.md)               |
| Standard 封装 | 多数使用 `rounded-[6px]` / `rounded-[var(--radius-dialog)]`      | 真实业务入口、NoData、Notify、Filter、DateRange                                           | [`standard.md`](./component-novita/standard.md)         |

---

## 组件库优先级

1. **shadcn/ui first**：`@/components/ui/` 是默认选择。
2. **antd fallback**：仅在 shadcn 不足时使用复杂排序 Table、`InputNumber`、`Upload`、`Image preview`、`Cascader`、`DatePicker`、`Slider` 等；toast/message 优先用项目 `standard/notify`。
3. **项目 wrapper**：业务按钮优先用 `@/app/components/button/Button`；维护 shadcn 基础按钮时用 `@/components/ui/button`。

## 真实组件入口

| 场景            | 优先入口                                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button          | `import Button from "@/app/components/button/Button"`；基础 variant 用 `import { Button } from "@/components/ui/button"`                                                                                                                    |
| Card            | `import { Card, CardContent } from "@/components/ui/card"`                                                                                                                                                                                  |
| Dialog          | `@/components/ui/dialog`；确认/提示弹窗用 `@/components/ui/standard/confirm-dialog`、`info-dialog`、`warning-dialog`                                                                                                                        |
| Toast / message | `import { message, notify, notification } from "@/components/ui/standard/notify"`                                                                                                                                                           |
| Empty state     | `import { NoData } from "@/components/ui/standard/no-data"`；sandbox 用 `import { SandboxNoData } from "@/components/ui/standard/sandbox-no-data"`；整页加载用 `import EmptyPageLoading from "@/components/ui/standard/empty-page-loading"` |
| Table           | `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"`                                                                                                                                     |
| Pagination      | 基础 `@/components/ui/pagination`；业务分页默认导入 `@/components/ui/standard/pagination` 或 `import StandardPagination from "@/components/ui/standard/pagination-control"`                                                                 |
| Date range      | 默认导入 `@/components/ui/standard/date-range-picker`；UTC 场景默认导入 `date-range-picker-utc` 或 `date-range-picker-utc-common`；Dayjs 场景用 `import { DayjsRangePicker } from "@/components/ui/standard/dayjs-range-picker"`            |
| Select / filter | 基础 `@/components/ui/select`；可搜索筛选用 `import { SelectFilter } from "@/components/ui/standard/selectFilter"`；简单枚举用 `import { SelectItems } from "@/components/ui/standard/select-items"`                                        |
| Tooltip         | 基础 `@/components/ui/tooltip`；业务 wrapper 用 `import { AppTooltip } from "@/components/ui/standard/tooltip"`                                                                                                                             |
| Form error      | `@/components/ui/standard/form-error-text`                                                                                                                                                                                                  |
| Number / slider | `import { NumberInput } from "@/components/ui/standard/number-input"`、`import { ValueSlider } from "@/components/ui/standard/value-slider"`                                                                                                |
| Code copy       | `@/components/ui/standard/code-copy-btn` 或 `code-with-btn`                                                                                                                                                                                 |

`@/components/ui/standard/empty` 在当前 `novita-home` 中不存在，不要生成这个 import。

---

## 跨组件约定（禁用）

- 禁止 `import { Button } from "antd"`。
- 禁止 native `<select>`，优先 shadcn Select。
- 禁止 native `<table>`，优先项目 Table 或明确封装后的表格组件。
- 禁止手写 lucide SVG path；从 `lucide-react` import 图标。
- 禁止 `useSelector` / `useDispatch`，使用 `useAppSelector` / `useAppDispatch`。
- 新 UI 优先 Tailwind utilities + token；避免为了普通布局新增 SCSS Module。维护既有 `.module.scss` 组件时遵循原文件模式。
- 新建浮层前先查 [`z-index.md`](./component-novita/z-index.md)，不要新增随意 `z-[9999]`。

## 表单与交互

- 所有 clickable 元素必须有 `cursor-pointer` 和可见 hover/focus 状态。
- async button 需要 loading/disabled，防重复提交。
- 删除、危险操作需要确认弹窗。
- 表单错误显示在字段附近，不能只靠 toast。
- icon-only button 必须有 `aria-label`。

## 布局与响应式

- Website 使用 `max_width_container`，Console 使用 `console-card`。
- Console sidebar 在 `lg` 以下按项目已有模式隐藏或折叠。
- 移动端不允许页面级横向滚动；表格和宽内容局部包裹横向滚动容器。
- hover 状态不能通过 scale 造成布局抖动。

## Sidebar 规则

- 菜单项必须来自项目现有 sidebar 数据或代码，不要根据页面主题臆造。
- 如果 sidebar 数据没有为某项定义 icon，不要自行补 icon。
- 公司 logo 使用项目指定 SVG、路径和尺寸，不要猜测或替换。
- Console sidebar 保持 3 区结构：固定顶部、可滚动中部、固定底部。

## 状态与权限

- Redux 从 `@/store` 引入 `useAppSelector` / `useAppDispatch`。
- 权限、team、user 信息优先查 `src/store`、`src/hooks/usePermission.tsx`、`src/app/components/Permission/` 的既有模式。
- Header、sidebar、navigation 项来自 `src/app/components/header/` 和相关 hooks，不要根据页面主题臆造菜单或 icon。

## 视觉与可访问性

- 不使用 emoji 作为 UI icon。
- 正文移动端最小可读字号按项目 typography token，不用裸 `text-xs` 填充正文。
- 有意义图片必须有 `alt`；装饰图片用空 alt 或项目约定。
- 色彩不是唯一状态指示，错误/警告/成功要配文案或图标。

---

## 实施检查清单

本节只覆盖 Novita UI 组件级对齐。通用质量自检见 [`checklist.md`](./checklist.md)。

- [ ] 命中 Novita 项目时已按场景加载对应 `component-novita/<name>.md`。
- [ ] 新业务 UI 优先项目现有组件入口，没有生成不存在的 `@/components/ui/standard/empty`。
- [ ] Button、Table、Select、DateRangePicker、Pagination、Tooltip、Notify 使用真实导出名。
- [ ] 浮层 z-index 与 Dialog 1001、AlertDialog 10003/10004、Select 10002 的关系明确。
- [ ] 颜色使用 token class 或 `var(--*)`；没有 hardcoded hex/rgb。
- [ ] 新增 SCSS Module 仅限复杂组件或既有 module 延续，普通布局使用 Tailwind utilities。
- [ ] Console 场景使用 `console-card`、`font-h6` 等既有模式；Website 场景使用 `max_width_container`。
- [ ] 状态色、错误提示、loading/disabled、防重复提交符合对应分文件。

## 参考路径

| 文件                                                                            | 内容                                                |
| ------------------------------------------------------------------------------- | --------------------------------------------------- |
| `src/components/ui/*.tsx`                                                       | shadcn/Radix 基础组件                               |
| `src/components/ui/standard/*.tsx`                                              | Console/业务封装、NoData、Notify、DateRange、Filter |
| `src/components/ui/button.module.scss`、`table.module.scss`、`tabs.module.scss` | 基础组件补充样式                                    |
| `src/styles/_design-tokens.scss`                                                | token 原始变量                                      |
| `src/styles/theme.scss`                                                         | legacy 与 console 变量                              |
| `src/app/globals.scss`                                                          | 全局字体类、容器类、console-card 与样式加载顺序     |
