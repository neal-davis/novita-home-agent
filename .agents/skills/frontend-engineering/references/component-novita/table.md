# Table

**源码**：`src/components/ui/table.tsx`、`table.module.scss`。

| 节点            | 规范                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| `Table` wrapper | `relative w-full overflow-auto scrollBar_container`；loading 时叠 `styles.table_loading`。 |
| `<table>`       | `relative w-full caption-bottom text-sm`。                                                 |
| `TableHeader`   | `[&_tr]:border-b`。                                                                        |
| `TableFooter`   | `border-t bg-muted/50 font-medium [&>tr]:last:border-b-0`。                                |
| `TableRow`      | `border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted`。            |
| `TableHead`     | `font-table-head text-left px-4 py-2`，内联 `color: var(--dark-2)`。                       |
| `TableCell`     | `px-4 py-[14px] align-middle font-table-item border-border`，内联 `color: var(--black)`。  |
| Spinner         | iconfont loader，`fontSize: 24`、`color: var(--dark-3)`。                                  |

## 使用规则

- 业务代码不要手写 native table tags；使用 Table 组件族。
- 表头和单元格已有字体/颜色，不要无理由叠加 `font-*` 或 color。
- 宽表格局部滚动，不允许造成页面级横向滚动。
- 操作列保持 `cursor-pointer`、`whitespace-nowrap` 和明确 hover/focus。
