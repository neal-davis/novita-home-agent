# Button

**源码**：`button.tsx`、`button.module.scss`。

| 维度                                         | 规范                                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **圆角**                                     | 默认 `rounded-small`；`size=sm\|lg` → `rounded-md`；`size=xs` → `rounded-sm`。                                        |
| **全局禁用**                                 | `disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed`。                                      |
| **variant：default**                         | 背景 `bg-primary`，文字 `text-primary-foreground`，hover `hover:bg-primary-hover`。                                   |
| **variant：outline**                         | 边框 `border border-input`，背景 `bg-background`，文字 `text-accent-foreground`，hover 背景 `hover:bg-accent-hover`。 |
| **variant：ghost**                           | 边框 `border border-input`，hover `hover:text-accent-foreground`。                                                    |
| **variant：noborderoutline / noborderghost** | 无边框；后者 hover `hover:bg-accent hover:text-accent-foreground`。                                                   |
| **variant：secondary**                       | `bg-secondary text-secondary-foreground`，hover `hover:bg-secondary-hover`。                                          |
| **variant：danger**                          | `bg-red-50 text-red-400 border border-red-200`（警示浅底）。                                                          |
| **variant：disabled（视觉 variant）**        | `bg-primary-disabled text-primary-foreground opacity-50 cursor-not-allowed`。                                         |

**品牌并行**：`ProductPageButton` 使用 `border-brand-1`、`hover:border-brand-2`、`hover:text-brand-2` 等，与控制台默认 variant 并行一套。

## 业务使用

- 表格操作列优先使用 link/ghost 风格，保持 `cursor-pointer` 和 `whitespace-nowrap`。
- Reset filter button 使用 ghost/small 形态，配 lucide `RotateCcw`，高度与筛选栏其它控件一致。
