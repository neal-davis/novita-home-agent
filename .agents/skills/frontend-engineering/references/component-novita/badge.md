# Badge

**源码**：`src/components/ui/badge.tsx`。

| 维度        | 规范                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| 基础        | `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold`。      |
| default     | `border-transparent bg-primary text-primary-foreground hover:bg-primary/80`。             |
| secondary   | `border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`。       |
| destructive | `border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80`。 |
| outline     | `text-foreground`，保留边框。                                                             |

## 状态色

- 业务状态优先 `text-status-*` / `bg-status-*-bg` 或对应 `var(--status-*)`。
- 不要用硬编码 hex 表达 success/error/warning。
- Badge 可用 `rounded-full`，这是项目 token 中的合法 pill 形态。
