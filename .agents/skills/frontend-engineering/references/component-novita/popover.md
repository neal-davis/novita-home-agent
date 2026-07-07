# Popover

**源码**：`src/components/ui/popover.tsx`。

| 节点                     | 规范                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `PopoverTrigger` wrapper | 项目封装为 `h-9 w-full ... font-subtle rounded-md border-[var(--gray-1)] bg-background px-3 py-2`。 |
| `PopoverContent`         | `z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none`。       |
| 动画                     | 按 Radix state/side 使用 `fade/zoom/slide`。                                                        |

## 使用规则

- Popover 默认 `z-50`，在 Dialog/AlertDialog 内可能不够；先查现有业务是否改用 Select/DateRange 的高层级实现。
- 需要搜索、多选、级联筛选时优先 [`select-filter.md`](./select-filter.md)。
