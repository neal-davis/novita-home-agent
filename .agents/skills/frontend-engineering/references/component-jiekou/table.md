# JieKou Table

**源码**：`src/components/ui/table.tsx`、`src/components/ui/table.module.scss`。

- 外层：`relative w-full overflow-auto scrollBar_container`，宽表局部滚动，避免页面横向滚动。
- `TableBody` 包含 `[&_tr:last-child]:border-0`。
- `TableHead`：`h-10 px-4 text-left align-middle font-table-head`，颜色使用项目 dark token。
- `TableCell`：`px-4 py-2 align-middle font-table-item`。
- 空数据不能渲染空壳；业务列表优先配合 `NoData` / `SandboxNoData`。
