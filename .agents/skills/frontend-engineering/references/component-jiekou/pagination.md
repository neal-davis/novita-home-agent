# JieKou Pagination

**源码**：`src/components/ui/pagination.tsx`、`src/components/ui/standard/pagination.tsx`。

- 基础分页入口：`@/components/ui/pagination`。
- 业务分页默认导入：`@/components/ui/standard/pagination`，默认导出 `StandardPagination`。
- 当前 JieKou 没有 `standard/pagination-control.tsx`，不要从 Novita 文档复制该 import。
- 表格分页需要同步 loading、empty state 和页码越界处理。
