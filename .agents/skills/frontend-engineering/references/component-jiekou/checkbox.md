# JieKou Checkbox

**源码**：`src/components/ui/checkbox.tsx`。

- 基础 checkbox 使用 Radix Checkbox。
- 边框与选中态：默认对齐 `border-primary`，选中态 `bg-primary text-white`。
- 禁用保持 `disabled:cursor-not-allowed disabled:opacity-50` 类行为。
- 表格多选、筛选项多选先复用此组件，不要手写伪 checkbox，除非现有业务封装已这么做。
