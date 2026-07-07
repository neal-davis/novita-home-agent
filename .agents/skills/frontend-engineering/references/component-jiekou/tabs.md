# JieKou Tabs

**源码**：`src/components/ui/tabs.tsx`、`src/components/ui/tabs.module.scss`、`src/components/ui/standard/tabs-items.tsx`。

- TabsList：源码使用 `bg-[var(--gray-3)]` 作为底面。
- TabsTrigger 激活态：`bg-background text-foreground shadow-sm`。
- disabled trigger 保持 `pointer-events-none opacity-50`。
- 业务固定 tab 列表可查 `standard/tabs-items`，不要重复写一套 tabs 状态机。
