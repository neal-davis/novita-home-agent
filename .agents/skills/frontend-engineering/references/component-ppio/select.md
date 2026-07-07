# Select

**源码**：`select.tsx`。

**Trigger**

| 维度              | 规范                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| **圆角**          | `rounded-regular`。                                                      |
| **默认**          | 边框 `border-[1px] border-solid border-gray-300`；背景 `bg-background`。 |
| **Hover / Focus** | `hover:border-input-hover`、`focus-visible:border-input-hover`。         |
| **禁用**          | `disabled:opacity-50`。                                                  |

**与 Input 对齐建议**：Trigger 现为 `border-gray-300`，Input 为 `border-border-2`；新代码建议 **`border-border-2` + `hover:border-input-hover`**。

**下拉层与选项**

| 节点                   | 圆角 · 边框 · 背景 · 其他                                                                                                                                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SelectContent**      | `rounded-md border bg-popover text-popover-foreground shadow-md`。                                                                                                                                                                                                                |
| **SelectItem**         | `rounded-sm`；选中/悬停 `data-[state=checked]:bg-gray-100`、`hover:bg-gray-100`；键盘焦点 `focus:bg-accent-hover focus:text-accent-foreground`；禁用 `data-[disabled]:opacity-50 data-[disabled]:pointer-events-none`。（菜单类建议长期统一为 **accent** 系，与 Dropdown 一致。） |
| **SelectSeparator**    | `-mx-1 my-1 h-px bg-muted`（与 **DropdownMenuSeparator** 相同）。                                                                                                                                                                                                                 |
| **SelectScrollButton** | 继承 Content 背景，通常为区域边缘渐变按钮。                                                                                                                                                                                                                                       |

**z-index**：Select Content 存在内联 **`style={{ zIndex: 10002 }}`**，避免被其它浮层遮挡 — 详见 [z-index 与 src/components/ui 的差异](./z-index.md)。
