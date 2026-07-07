# DropdownMenu

**源码**：`dropdown-menu.tsx`。

| 节点                                     | 圆角 · 边框 · 背景 · 阴影                                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **DropdownMenuContent / SubContent**     | **`rounded-md border bg-popover`**，`p-1`；主 `shadow-md`，子 `shadow-lg`。                                                  |
| **DropdownMenuSubTrigger**               | `rounded-sm`；**`focus:bg-accent`、`data-[state=open]:bg-accent`**。                                                         |
| **DropdownMenuItem**                     | `rounded-sm`；**`focus:bg-accent focus:text-accent-foreground`**；禁用 `data-[disabled]:opacity-50` + `cursor-not-allowed`。 |
| **DropdownMenuCheckboxItem / RadioItem** | `rounded-sm`；**`focus:bg-accent`**；禁用 `opacity-50`（无 `cursor-not-allowed`）。                                          |
