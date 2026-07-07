# Form

**源码**：`src/components/ui/form.tsx`；错误文本封装：`standard/form-error-text.tsx`。

| 节点              | 规范                                     |
| ----------------- | ---------------------------------------- |
| `FormItem`        | `space-y-2`。                            |
| `FormLabel`       | 校验失败时 `text-destructive`。          |
| `FormDescription` | `text-sm text-muted-foreground`。        |
| `FormMessage`     | `text-sm font-medium text-destructive`。 |

## standard/FormErrorText

- `import FormErrorText from "@/components/ui/standard/form-error-text"`。
- 内部使用 `form-error-text.module.scss` 和 `AlertCircle w-3 h-3`。

## 使用规则

- 表单错误显示在字段附近，不能只靠 toast。
- 必填和权限错误使用项目现有错误色/文案模式，不要硬编码红色 hex。
