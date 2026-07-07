# standard 子目录（业务封装）

**源码目录**：`src/components/ui/standard/`。

## 常用入口

| 场景            | 入口                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| Empty state     | `import { NoData } from "@/components/ui/standard/no-data"`                       |
| Sandbox empty   | `import { SandboxNoData } from "@/components/ui/standard/sandbox-no-data"`        |
| Page loading    | `import EmptyPageLoading from "@/components/ui/standard/empty-page-loading"`      |
| Loading overlay | `import Loading from "@/components/ui/standard/loading"`                          |
| Confirm dialog  | `import { ConfirmDialog } from "@/components/ui/standard/confirm-dialog"`         |
| Warning dialog  | `import { WarningDialog } from "@/components/ui/standard/warning-dialog"`         |
| Notify          | `import { message, notify, notification } from "@/components/ui/standard/notify"` |
| Pagination      | `import StandardPagination from "@/components/ui/standard/pagination-control"`    |
| Number input    | `import { NumberInput } from "@/components/ui/standard/number-input"`             |
| Value slider    | `import { ValueSlider } from "@/components/ui/standard/value-slider"`             |
| Preview image   | `import { PreviewImage } from "@/components/ui/standard/preview-image"`           |
| Progress        | `import { ProgressBar, ProgressCircle } from "@/components/ui/standard/progress"` |
| Copy            | `code-copy-btn` 或 `code-with-btn` 默认导入 `CopyBtn`                             |

`@/components/ui/standard/empty` 不存在，不要生成。

## 视觉摘要

- `standard/alert.tsx`：`rounded-md border-[var(--gray-2)] bg-[var(--gray-3)] px-4 py-3`。
- `ConfirmDialog` / `WarningDialog`：`rounded-[var(--radius-dialog)] border-[var(--border)] bg-[var(--white)]`。
- `NoData` / `SandboxNoData`：使用 `/billing/no-data.svg` 和 module 样式。
- `EmptyPageLoading`：spinner 使用 `border-t-[var(--brand-0)]`，当前源码有 `text-gray-600`。
- `ProgressBar`：轨道 `bg-[var(--gray-1)]`，正常 `bg-[var(--brand-0)]`，异常 `bg-[var(--red-1)]`。
- `PreviewImage`：DialogContent `max-w-[90vw] border-0 bg-transparent p-0 shadow-none`，图片 `rounded-md object-contain`。

## 使用规则

- 业务封装优先于临时手写控件。
- 维护当前 standard 文件时允许沿用 module.scss；新普通布局不要新增 SCSS Module。
- 发现 hardcoded `text-[#000]` 等 legacy 写法时，只在当前任务触达范围内修正，不做大范围顺手迁移。
