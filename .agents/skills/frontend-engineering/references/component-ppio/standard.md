# standard 子目录（控制台/业务）

| 文件                            | 圆角 · 边框 · 背景摘要                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **`standard/alert.tsx`**        | `rounded-md`、`border-[1px] border-solid border-fill-3`、`bg-fill-4`、`px-4 py-3`。                         |
| **`standard/month-picker.tsx`** | Trigger：`border-border-2`；圆角类名源码为 `rounder-[6px]`（疑似笔误，应对齐 `rounded-regular` 或 token）。 |
| **`standard/loading.tsx`**      | 蒙层 `bg-neutral-50/50`（与 Dialog `bg-mask` 不同）。                                                       |
| **`standard/info-dialog.tsx`**  | 主按钮 `bg-brand-0 text-neutral-50 hover:bg-brand-2`。                                                      |

更复杂日期区间样式见 **`standard/date-range-picker*.scss`**，与 `date-picker.module.scss` 一并对比。

## 控制台筛选栏

筛选栏中 SearchInput、Select、DateRangePicker、reset button 要保持同一高度和圆角。

- 高度：统一 `h-large`。
- 圆角：统一 `rounded-small`。
- Reset：只有存在 active filter 时显示；使用项目 Button 的 ghost/small 形态，配 `RotateCcw` lucide icon。
- 必填字段：label 前加错误色星号，使用 `text-[var(--error-300)]`。
- SearchInput 清空：优先用 `key={filterKey}` 递增 remount，避免残留内部状态。
- DateRangePicker 为空时如果项目默认红边，需要在筛选栏上下文中覆盖为 `--border-3`，hover/open 用 `--brand-0`。

不要手写 input+icon、tabs、pagination 或 date range picker；优先使用项目现有 `SearchInput`、`Tabs`、`StandardPagination`、`DateRangePicker`。
