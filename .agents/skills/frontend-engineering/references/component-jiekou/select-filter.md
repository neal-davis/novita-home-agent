# JieKou SelectFilter / CascadeFilter

**源码**：`src/components/ui/standard/selectFilter.tsx`、`selectFilter.module.scss`、`cascade-filter.tsx`、`select-items.tsx`。

- 可搜索筛选入口：`import { SelectFilter } from "@/components/ui/standard/selectFilter"`。
- Trigger 常用 `relative pr-9`；搜索行使用 `flex items-center gap-2 p-[10px] border-b border-common-gray-3`。
- clear button 使用 `z-[1]`，不要提升为全局浮层层级。
- `cascade-filter` Trigger 对齐 Select：`h-9 rounded-[6px] border-[var(--gray-2)]`，Content 层级 `z-[10002]`。
- 简单枚举优先 `SelectItems`，不要为每个页面重复写搜索下拉。
