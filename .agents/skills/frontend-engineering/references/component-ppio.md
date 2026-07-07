---
name: ppinfra-base-component-style
description: >
  ppinfra（PPIO）`src/components/ui`：索引 + 按需加载 `component-ppio/<组件>.md`（全小写文件名）；
  各文件含圆角、边框、背景、阴影与源码路径；全局 token、魔法数字红线见 global-ppio。
  触发：改 shadcn 封装、表单与对话框、Popover/Dropdown、token 与源码对账、Figma 转类名。
  裸露 px/rem、任意值 […px]、内联像素等红线见 global-ppio §6。
---

# ppinfra UI 基础组件 — 索引与按需加载

**文档定位**：`src/components/ui`（及 `component-ppio/standard.md` 等）的**类名惯例与源码对账**。**全局** Tailwind、design token、色板、排版、间距、断点、阴影语义、语义 z-index、魔法数字红线 — 一律以 **[`global-ppio.md`](./global-ppio.md)** 与 **`tailwind.config.ts`** 为准。

**用法**：先读本索引；实现或审查某一组件时，**只打开**下表中对应的 [`component-ppio/`](./component-ppio/) 下的 `.md` 文件，避免整包上下文浪费。跨组件禁用约定见下文「跨组件约定」；浮层 z-index 特例见 [`component-ppio/z-index.md`](./component-ppio/z-index.md)。

---

## 按需加载（按场景选文件）

路径均为 **`references/component-ppio/<name>.md`**（相对本 skill：`./component-ppio/<name>.md`）。

### 表单与控件

| 场景                               | 加载                                                |
| ---------------------------------- | --------------------------------------------------- |
| Button / ProductPageButton         | [`button.md`](./component-ppio/button.md)           |
| Input                              | [`input.md`](./component-ppio/input.md)             |
| Textarea                           | [`textarea.md`](./component-ppio/textarea.md)       |
| Select（Trigger / Content / Item） | [`select.md`](./component-ppio/select.md)           |
| Checkbox                           | [`checkbox.md`](./component-ppio/checkbox.md)       |
| Radio Group                        | [`radio-group.md`](./component-ppio/radio-group.md) |
| Switch                             | [`switch.md`](./component-ppio/switch.md)           |
| Toggle / ToggleGroup               | [`toggle.md`](./component-ppio/toggle.md)           |
| Slider                             | [`slider.md`](./component-ppio/slider.md)           |
| Tabs                               | [`tabs.md`](./component-ppio/tabs.md)               |

### 展示与布局

| 场景       | 加载                                                |
| ---------- | --------------------------------------------------- |
| Card       | [`card.md`](./component-ppio/card.md)               |
| Badge      | [`badge.md`](./component-ppio/badge.md)             |
| Alert      | [`alert.md`](./component-ppio/alert.md)             |
| Separator  | [`separator.md`](./component-ppio/separator.md)     |
| Skeleton   | [`skeleton.md`](./component-ppio/skeleton.md)       |
| ScrollArea | [`scroll-area.md`](./component-ppio/scroll-area.md) |
| Accordion  | [`accordion.md`](./component-ppio/accordion.md)     |
| Avatar     | [`avatar.md`](./component-ppio/avatar.md)           |
| Table      | [`table.md`](./component-ppio/table.md)             |
| Calendar   | [`calendar.md`](./component-ppio/calendar.md)       |
| Label      | [`label.md`](./component-ppio/label.md)             |
| Form       | [`form.md`](./component-ppio/form.md)               |
| Breadcrumb | [`breadcrumb.md`](./component-ppio/breadcrumb.md)   |

### 复合、导航与反馈

| 场景           | 加载                                                  |
| -------------- | ----------------------------------------------------- |
| Carousel       | [`carousel.md`](./component-ppio/carousel.md)         |
| Pagination     | [`pagination.md`](./component-ppio/pagination.md)     |
| ButtonGroup    | [`button-group.md`](./component-ppio/button-group.md) |
| MultiSelect    | [`multi-select.md`](./component-ppio/multi-select.md) |
| Toast（Radix） | [`toast.md`](./component-ppio/toast.md)               |
| Sonner         | [`sonner.md`](./component-ppio/sonner.md)             |
| Collapsible    | [`collapsible.md`](./component-ppio/collapsible.md)   |

### 日期时间

| 场景                        | 加载                                                            |
| --------------------------- | --------------------------------------------------------------- |
| DatePicker                  | [`date-picker.md`](./component-ppio/date-picker.md)             |
| TimePicker                  | [`time-picker.md`](./component-ppio/time-picker.md)             |
| DateRangePicker（standard） | [`date-range-picker.md`](./component-ppio/date-range-picker.md) |

### 其他

| 场景     | 加载                                            |
| -------- | ----------------------------------------------- |
| ModelTag | [`model-tag.md`](./component-ppio/model-tag.md) |

### 浮层与对话框

| 场景            | 加载                                                        |
| --------------- | ----------------------------------------------------------- |
| Dialog          | [`dialog.md`](./component-ppio/dialog.md)                   |
| AlertDialog     | [`alert-dialog.md`](./component-ppio/alert-dialog.md)       |
| Sheet           | [`sheet.md`](./component-ppio/sheet.md)                     |
| Drawer          | [`drawer.md`](./component-ppio/drawer.md)                   |
| Popover         | [`popover.md`](./component-ppio/popover.md)                 |
| HoverCard       | [`hover-card.md`](./component-ppio/hover-card.md)           |
| Tooltip         | [`tooltip.md`](./component-ppio/tooltip.md)                 |
| DropdownMenu    | [`dropdown-menu.md`](./component-ppio/dropdown-menu.md)     |
| NavigationMenu  | [`navigation-menu.md`](./component-ppio/navigation-menu.md) |
| Command（cmdk） | [`command.md`](./component-ppio/command.md)                 |

### 主题与目录（非单一组件）

| 场景                             | 加载                                                    |
| -------------------------------- | ------------------------------------------------------- |
| z-index 硬编码与 Select 内联层级 | [`z-index.md`](./component-ppio/z-index.md)             |
| 薄封装、无样式再导出             | [`thin-wrappers.md`](./component-ppio/thin-wrappers.md) |
| `standard/` 控制台封装摘要       | [`standard.md`](./component-ppio/standard.md)           |

---

## 速查（链到分文件）

| 组件     | 圆角要点                                                              | 边框 / 表面要点                                       | 详情                                          |
| -------- | --------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| Button   | `rounded-small`（默认）；`sm\|lg` → `rounded-md`；`xs` → `rounded-sm` | variant 见文件                                        | [`button.md`](./component-ppio/button.md)     |
| Input    | `rounded-minismall`                                                   | `border-border-2`；hover/focus → `border-input-hover` | [`input.md`](./component-ppio/input.md)       |
| Textarea | `rounded-md`                                                          | `border`；hover/focus → `border-input-hover`          | [`textarea.md`](./component-ppio/textarea.md) |
| Select   | Trigger `rounded-regular`；Content `rounded-md`                       | Trigger 常为 `border-gray-300`；建议对齐 Input        | [`select.md`](./component-ppio/select.md)     |
| 浮层族   | 多为 `rounded-md`；Dialog `sm:rounded-lg`                             | `bg-popover` / `bg-background` + `border`             | 上表「浮层与对话框」                          |

---

## 何时查阅本索引或分文件

- 实现或修改 **Button / Input / Textarea / Select** 等：打开对应 **`component-ppio/*.md`**。
- 处理 **对话框、抽屉、Popover / Dropdown / Tooltip** 等：打开对应浮层 `.md`；遮罩与 z-index 对照 [`z-index.md`](./component-ppio/z-index.md)。
- 在 **SCSS** 与 **`tailwind.config`** 之间对账：仍以 **global-ppio** + **`globals.scss :root`** 为主，组件细节见各分文件。
- 做 **控制台 / `--console-*`** 版面：**global-ppio** + [`standard.md`](./component-ppio/standard.md)。
- 排查 **边框 hover 不统一**、**菜单项 gray-100 vs accent**：[`select.md`](./component-ppio/select.md)、[`dropdown-menu.md`](./component-ppio/dropdown-menu.md)。

---

## 跨组件约定（禁用）

下列在多个组件中重复出现，各分文件内不重复展开：

- **`disabled:pointer-events-none`**（Button、Toggle、TabsTrigger 等）。
- **`disabled:opacity-50`**，常配合 **`disabled:cursor-not-allowed`**（Input、Textarea、Checkbox、Switch、Slider thumb）。
- **按钮 `disabled` variant**：`bg-primary-disabled text-primary-foreground cursor-not-allowed opacity-50`（显式禁用样式，区别于原生 `disabled` 属性）。

无单独「禁用边框色」时，视为与默认边框相同但 **整体透明度降低**，不再叠加 hover。

---

## 实施检查清单

本节只覆盖 **ppinfra UI 组件级** token/类名对齐。通用质量自检见 [`checklist.md`](./checklist.md)。魔法数字口径见 **[`global-ppio.md`](./global-ppio.md) §6**。

- [ ] global-ppio §6：无不合规魔法数字与任意值。
- [ ] 圆角使用语义键（`rounded-minismall` / `small` / `regular` / `md` / `lg` / `full` 等）。
- [ ] 输入类 hover/focus 与 **`border-input-hover`** 对齐意图一致。
- [ ] 禁用采用 opacity + pointer-events 组合，与同类一致。
- [ ] 新增 `border-gray-*` 前确认是否可用 `border-border-2` 或 `border-input`。
- [ ] 新建浮层与 Popover/Dropdown 一致（`rounded-md`、`bg-popover`、`border`）。
- [ ] 新建对话框遮罩：`bg-mask` vs `bg-neutral-500/*` 是否刻意区分。
- [ ] 列表项优先 `focus:bg-accent` / `hover:bg-accent`，慎用裸 `bg-gray-100`。
- [ ] 日期/时间触发器：`Button outline` + 模块内 token，勿与 Input 的 `border-input-hover` 混用不自知。
- [ ] Sonner vs Radix Toast 勿混两套 Toaster。
- [ ] Carousel 箭头保留 `rounded-full` + outline Button。
- [ ] 单日 vs 区间日期激活边框：`--brand-0` vs `--dark-1`。
- [ ] MultiSelect 列表伪 checkbox 若要对齐全局 Checkbox，评估 `border-border-2`。
- [ ] Collapsible 若要 Accordion 式分割线，在业务层补 `border-b`。
- [ ] 控制台页：`theme.scss` 的 `--console-*`，勿默认等于浅色 `bg-card`。
- [ ] 浮层 z-index 与 Dialog 1001、`z-50`、语义 `z-*` 的层次（见 [`z-index.md`](./component-ppio/z-index.md)）。
- [ ] 阴影：真实 elevation 用 `shadow-2`～`shadow-module`；沿用 `shadow-lg` 时接受其与 `--radius` 绑定（global §8）。

---

## 参考路径

| 文件                                                                                                         | 内容                                                            |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `tailwind.config.ts`                                                                                         | colors、spacing、screens、borderRadius、mask、boxShadow、zIndex |
| `src/styles/_design-tokens.scss`                                                                             | `--border-*`、`--fill-*`、`--radius-*`、`--shadow-*`            |
| `src/app/globals.scss`                                                                                       | `:root` shadcn 变量、`--radius-button`                          |
| `src/styles/theme.scss`                                                                                      | `html` 业务变量、**`--console-*`**                              |
| `src/components/ui/button.tsx`                                                                               | Button / ProductPageButton                                      |
| `src/components/ui/input.tsx`                                                                                | 表单输入主规范                                                  |
| `src/components/ui/select.tsx`                                                                               | Trigger / Content / Item                                        |
| `src/components/ui/dialog.tsx`、`sheet.tsx`、`drawer.tsx`、`alert-dialog.tsx`                                | 对话框与遮罩                                                    |
| `src/components/ui/popover.tsx`、`dropdown-menu.tsx`、`tooltip.tsx`、`hover-card.tsx`、`navigation-menu.tsx` | 弹出层                                                          |
| `src/components/ui/command.tsx`                                                                              | Command 面板                                                    |
| `src/components/ui/sonner.tsx`、`toaster.tsx`、`toast.tsx`                                                   | Toast 两套                                                      |
| `src/components/ui/date-picker.tsx`、`time-picker.tsx`、区间 SCSS                                            | 日期时间                                                        |
| `src/components/ui/carousel.tsx`                                                                             | 轮播                                                            |
| `src/components/ui/form.tsx`、`breadcrumb.tsx`                                                               | 表单与导航                                                      |
| `src/components/ui/model-tag/ModelTag.tsx`                                                                   | 标签                                                            |
| `src/components/ui/multi-select.tsx`                                                                         | 多选                                                            |
| `src/components/ui/collapsible.tsx`                                                                          | Radix 无样式                                                    |
| `src/components/ui/standard/code-copy-btn.tsx`、`code-copy-btn.module.scss`                                  | 复制按钮文字色                                                  |
| `src/components/ui/standard/md-docs.module.scss`                                                             | 文档表格头与链接色                                              |

---
