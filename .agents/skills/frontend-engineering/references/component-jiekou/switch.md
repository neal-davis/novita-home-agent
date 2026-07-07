# JieKou Switch

**源码**：`src/components/ui/switch.tsx`。

- 使用 Radix Switch，保持 shadcn 的 track/thumb 结构。
- 禁用保持 `disabled:cursor-not-allowed disabled:opacity-50`。
- 异步切换必须处理 loading 或乐观更新失败回滚，不能只切 UI 状态。
