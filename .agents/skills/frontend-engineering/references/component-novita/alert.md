# Alert

**源码**：`src/components/ui/alert.tsx`；业务简易提示：`src/components/ui/standard/alert.tsx`。

| 维度        | 基础 Alert                                                         |
| ----------- | ------------------------------------------------------------------ |
| 根节点      | `relative w-full rounded-lg border p-4`。                          |
| default     | `bg-background text-foreground`。                                  |
| destructive | `border-destructive/50 text-destructive dark:border-destructive`。 |
| Title       | `mb-1 font-medium leading-none tracking-tight`。                   |
| Description | `text-sm [&_p]:leading-relaxed`。                                  |

## standard/alert

- 默认 `flex flex-row gap-2 px-4 py-3 rounded-md border-solid border-[1px] border-[var(--gray-2)] bg-[var(--gray-3)]`。
- icon 使用 `iconfont icon-notification`。
- 文案容器使用 `font-small-console text-[var(--dark-2)]`；title 使用 `font-subtle-medium text-black mb-2`。
