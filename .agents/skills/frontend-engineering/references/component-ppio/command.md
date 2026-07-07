# Command

**源码**：`command.tsx`。

| 节点                     | 规范                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Command 根**           | **`rounded-md bg-popover text-popover-foreground`**（嵌入 Dialog 时常 `overflow-hidden p-0`）。       |
| **CommandInput 外层**    | **`border-b`**。                                                                                      |
| **CommandInput**         | `rounded-md bg-transparent`；`disabled:opacity-50`。                                                  |
| **CommandItem**          | `rounded-sm`；选中 **`data-[selected=true]:bg-accent`**；禁用 **`data-[disabled=true]:opacity-50`**。 |
| **CommandSeparator**     | **`-mx-1 h-px bg-border`**（与 Dropdown 的 `bg-muted` 分隔线略有差异）。                              |
| **CommandGroup heading** | `text-muted-foreground`。                                                                             |
