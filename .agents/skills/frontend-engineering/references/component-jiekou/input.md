# JieKou Input

**源码**：`src/components/ui/input.tsx`。

- 基础输入：`h-10 rounded-md border bg-background px-3 py-2 text-sm`。
- hover/focus：对齐 `border-input-hover`，保留 `ring-offset-background` 与可访问 focus。
- 禁用：`disabled:cursor-not-allowed disabled:opacity-50`。
- `SearchInput` 使用 `pl-8` 给搜索 icon 留空间，icon 来自项目 iconfont。
- 新表单不要裸写 input 样式；先复用 `Input` / `SearchInput`，错误提示用 `standard/form-error-text` 或靠近字段的现有模式。
