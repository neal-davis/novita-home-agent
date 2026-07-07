# JieKou Form

**源码**：`src/components/ui/form.tsx`、`src/components/ui/standard/form-error-text.tsx`。

- Form 使用 react-hook-form + shadcn FormField/FormItem/FormLabel/FormControl/FormMessage 模式。
- 字段错误必须靠近字段展示；不要只用 toast。
- 标准错误文本优先使用 `standard/form-error-text` 的既有样式。
- 提交按钮需要 loading/disabled，防重复提交。
