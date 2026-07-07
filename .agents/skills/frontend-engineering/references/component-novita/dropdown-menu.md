# DropdownMenu

**源码**：`src/components/ui/dropdown-menu.tsx`。

| 节点                     | 圆角 · 边框 · 背景 · 阴影                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Content                  | `z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md`。 |
| SubContent               | 同 Content，但 `shadow-lg`。                                                                             |
| SubTrigger               | `rounded-sm px-2 py-1.5 text-sm focus:bg-accent-hover data-[state=open]:bg-accent-active`。              |
| Item                     | `rounded-sm px-2 py-1.5 text-sm focus:bg-accent-hover focus:text-accent-foreground`。                    |
| CheckboxItem / RadioItem | `rounded-sm py-1.5 pl-8 pr-2 text-sm`，focus 用 `bg-accent-hover`。                                      |
| Separator                | `-mx-1 my-1 h-px bg-muted`。                                                                             |

## 注意

- 源码中 `DropdownMenuCheckboxItem` 存在 `focus:-hover` 字符串，维护时不要复制该疑似笔误到新组件。
- Dropdown 默认 `z-50`；需要压过 Dialog 时不要随意改大，先看是否应该用 Select/Popover 特定实现。
