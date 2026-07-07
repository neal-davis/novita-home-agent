# Badge

**源码**：`badge.tsx`。

| 维度                | 规范                                                    |
| ------------------- | ------------------------------------------------------- |
| **圆角**            | `rounded-full`。                                        |
| **边框**            | `border`；各 variant 多为 `border-transparent` + 配色。 |
| **outline variant** | `text-foreground`，保留边框。                           |

## 状态色

业务状态 Badge 优先使用语义状态色：

| 状态                         | 色值 token                                |
| ---------------------------- | ----------------------------------------- |
| active / success / running   | `success-300` 或对应 success bg/text 组合 |
| error / failed / destructive | `error-300` 或对应 error bg/text 组合     |
| pending / warning            | `warning-300` 或对应 warning bg/text 组合 |

不要用 Tailwind generic `green-*` / `orange-*` / `red-*` 直接表达业务状态。
