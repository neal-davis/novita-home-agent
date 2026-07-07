# JieKou DropdownMenu

**源码**：`src/components/ui/dropdown-menu.tsx`。

- 常规层级为 `z-50`。
- Content/SubContent 保持 `rounded-md border bg-popover shadow-md`。
- Item 使用明确 hover/focus 状态；危险项需要 destructive 样式或确认二次操作。
- 菜单项可点击时必须有 `cursor-pointer`，disabled 使用 Radix data disabled 行为。
