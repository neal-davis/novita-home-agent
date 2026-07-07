# JieKou Textarea

**源码**：`src/components/ui/textarea.tsx`。

- 基础 textarea 沿用 shadcn：`rounded-md border bg-background px-3 py-2 text-sm`。
- hover/focus 应与 Input 一致，使用 `border-input-hover` 语义。
- 禁用保持 `disabled:cursor-not-allowed disabled:opacity-50`。
- 多行输入错误提示放在字段附近，不只靠 toast。
