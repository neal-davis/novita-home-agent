# Select

**源码**：`src/components/ui/select.tsx`。

## Trigger

| 维度          | 规范                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| 圆角          | `rounded-[6px]`。                                                              |
| 尺寸          | `h-9 w-full py-2 pl-3 pr-9`。                                                  |
| 边框 / 背景   | `border-solid border-[1px] border-[var(--gray-2)] bg-background`。             |
| Hover / Focus | `hover:border-input-hover`、`focus:border-input-hover`、`focus:outline-none`。 |
| 禁用          | `disabled:cursor-not-allowed disabled:opacity-50`。                            |
| icon          | `ChevronDown` 绝对定位 `right-3`。                                             |

## Content / Item

| 节点              | 圆角 · 边框 · 背景 · 层级                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `SelectContent`   | `rounded-md border bg-popover text-popover-foreground shadow-md scrollBar_container_new`。                     |
| z-index           | 内联 `style={{ zIndex: 10002 }}`，高于 Dialog / AlertDialog。                                                  |
| `SelectItem`      | `rounded-sm py-1.5 text-sm`；选中/hover `bg-[var(--gray-3)]`；focus `bg-accent-hover text-accent-foreground`。 |
| `SelectSeparator` | `-mx-1 my-1 h-px bg-muted`。                                                                                   |

## 使用规则

- 禁止 native `<select>`。
- Select 内嵌搜索、清空、多列筛选优先看 [`select-filter.md`](./select-filter.md)。
- 在 Dialog 内使用时不要降低 Content z-index；它依赖 10002 避免被遮罩盖住。
