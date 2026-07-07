# Toast / Sonner / Notify

**源码**：

- `src/components/ui/sonner.tsx`
- `src/components/ui/standard/notify.ts`

## Toaster

| 维度                       | 规范                                                                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 入口                       | `import { Toaster } from "@/components/ui/sonner"`。                                                                                                                                                   |
| Toast surface              | `min-h-11 max-w-[min(520px,calc(100vw-32px))] rounded-[var(--radius-8-medium)] border-l-4 border-[var(--border-default)] bg-[var(--fill-white)] px-4 py-3 shadow-[0_12px_32px_var(--alpha-dark-15)]`。 |
| title                      | `font-paragraph-14-medium text-[var(--text-1)]`。                                                                                                                                                      |
| description                | `font-paragraph-13 text-[var(--text-3)]`。                                                                                                                                                             |
| success/info/warning/error | 左边框和渐变背景映射到 status tokens。                                                                                                                                                                 |

## Notify API

入口：

```ts
import { message, notify, notification } from "@/components/ui/standard/notify";
```

- `message.*` 使用共享 singleton id，避免堆叠。
- `notification.*` 保持 sonner 默认堆叠。
- `message.open` / `notification.open` 兼容 legacy options。

## 使用规则

- 新业务 toast 优先 `message` / `notify`；不要直接引入 antd message。
- 字段级错误显示在字段附近，toast 只做全局反馈。
