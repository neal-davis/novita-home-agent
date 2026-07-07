# Textarea

**源码**：`src/components/ui/textarea.tsx`。

| 维度          | 规范                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| 主体          | `min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm`。              |
| Hover / Focus | `hover:border-input-hover`、`focus:border-input-hover`、`focus-visible:outline-none`。 |
| placeholder   | `placeholder:text-muted-foreground`。                                                  |
| 禁用          | `disabled:cursor-not-allowed disabled:opacity-50`。                                    |

## 使用规则

- 长文本输入要有明确 label、helper/error text。
- 高度可按业务调整，但避免页面级布局跳动。
