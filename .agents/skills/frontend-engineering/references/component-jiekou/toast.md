# JieKou Toast / Notify

**源码**：`src/components/ui/sonner.tsx`、`src/components/ui/standard/notify.ts`、`notify-constants.ts`。

- 页面反馈优先 `import { message, notify, notification } from "@/components/ui/standard/notify"`。
- `sonner.tsx` 只是 Toaster 基础挂载；业务调用不要绕过 `standard/notify`。
- `NOTIFY_TOASTER_ID` 为 `jiekou-standard-notify`。
- `message.*` 使用单例 id `jiekou-message-singleton`，位置 `top-center`，样式 top 为 80。
- variant icon 色使用 CSS 变量 `--jiekou-toast-icon` 和对应 token。
