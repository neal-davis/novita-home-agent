# Table

**源码**：`table.tsx`。

| 维度         | 规范                                                     |
| ------------ | -------------------------------------------------------- |
| **表头**     | `[&_tr]:border-b`。                                      |
| **表体末行** | `[&_tr:last-child]:border-0`。                           |
| **表面色**   | 主要由 **scss**（`table.module.scss`）与单元格组合控制。 |

## 使用规则

- 禁止在业务代码中新写 native `<table>`、`<thead>`、`<tbody>`、`<tr>`、`<th>`、`<td>`；使用 `@/components/ui/table` 的 Table 组件族。
- Header row 背景优先 `bg-[var(--fill-3)]` 或项目封装内置表头样式。
- `TableHead` 已内置表头字体和次级文本色时，不要重复叠加 `font-*` 和 color。
- `TableCell` 已内置表格字体和主文本色时，不要重复叠加。
- 操作列使用 link/ghost 风格，保持 `cursor-pointer` 和 `whitespace-nowrap`。
- 状态色使用 `success-*` / `warning-*` / `error-*` 或对应 `var(--*)`，不要使用 Tailwind generic green/orange/red。
