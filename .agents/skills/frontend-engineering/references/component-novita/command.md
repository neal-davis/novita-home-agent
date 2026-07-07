# Command

**源码**：`src/components/ui/command.tsx`。

| 节点           | 规范                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| Command root   | `flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground`。 |
| Dialog wrapper | `DialogContent className="overflow-hidden p-0 shadow-lg"`。                                   |
| Input wrapper  | `flex items-center border-b px-3`。                                                           |
| Input          | `h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none`。                           |
| List           | `max-h-[300px] overflow-y-auto overflow-x-hidden`。                                           |
| Item           | `rounded-sm px-2 py-1.5 text-sm data-[selected=true]:bg-accent-active`。                      |
| Separator      | `-mx-1 h-px bg-border`。                                                                      |

## 使用规则

- 命令面板内容项要有明确 empty state。
- icon 使用 lucide，不手写 SVG path。
