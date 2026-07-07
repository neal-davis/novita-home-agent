# Toast

**源码**：`toast.tsx`。

| 节点            | 圆角 · 边框 · 背景                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Toast 根**    | `rounded-md border p-6`；default：`border bg-background`；destructive：实心 `bg-destructive`。                                 |
| **ToastAction** | `rounded-md border bg-transparent`，`hover:bg-secondary`，`disabled:opacity-50`；destructive 下 `group-[.destructive]:` 覆盖。 |
| **ToastClose**  | `rounded-md p-1`；destructive 下 `text-red-200` 等。                                                                           |

## 使用约束

- 业务 toast 若使用 antd `message`，不要同时在同一元素上叠 CSS animation 和 `x-transition`，避免动画冲突。
- Sonner 与 Radix Toast 两套实现不要在同一业务入口混用；新增全局 toast 前先查当前 app 使用哪套 Toaster。
