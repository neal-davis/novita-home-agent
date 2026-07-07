# Input

**源码**：`input.tsx`。

| 维度              | 规范                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------- |
| **圆角**          | `rounded-minismall`。                                                                         |
| **默认**          | 边框 `border-[1px] border-border-2`；背景 `bg-background`。                                   |
| **Hover / Focus** | `hover:border-input-hover`、`focus:border-input-hover`（与 `focus-visible` 同线）；背景不变。 |
| **禁用**          | `disabled:opacity-50`（边框随透明度减弱）；背景不变。                                         |

**清除按钮**（`allowClear`）：`rounded-full bg-fill-4`，`hover:bg-fill-3`；图标颜色 `var(--dark-1)`（内联 style）。与输入框本体 border token 无关，属 **辅助控件小圆面**。
