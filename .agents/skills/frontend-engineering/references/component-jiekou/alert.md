# JieKou Alert

**源码**：`src/components/ui/alert.tsx`、`src/components/ui/standard/alert.tsx`。

- 基础 Alert 沿用 shadcn/Radix 风格，适合页面内静态提示。
- 业务 toast/message 不用 Alert 代替，优先 `standard/notify`。
- 需要确认动作时不要用普通 Alert，改用 `AlertDialog` 或 `standard/confirm-dialog`。
