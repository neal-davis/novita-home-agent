# SelectFilter / CascadeFilter / SelectItems

**源码**：

- `src/components/ui/standard/selectFilter.tsx`
- `src/components/ui/standard/cascade-filter.tsx`
- `src/components/ui/standard/select-items.tsx`

## SelectFilter

| 维度         | 规范                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| 入口         | `import { SelectFilter } from "@/components/ui/standard/selectFilter"`。         |
| Trigger      | 基于 `@/components/ui/select`，默认 `relative !w-max min-w-max pr-9`。           |
| 清空按钮     | `right-3 z-[1] h-4 w-4 rounded-full text-[var(--dark-1)]`，有 `cursor-pointer`。 |
| Search row   | `flex items-center gap-2 p-[10px] border-b border-common-gray-3`。               |
| Search input | `w-full h-5 text-sm px-0 border-none`。                                          |

## CascadeFilter

| 维度    | 规范                                                                        |
| ------- | --------------------------------------------------------------------------- |
| 入口    | `import { CascadeFilter } from "@/components/ui/standard/cascade-filter"`。 |
| Trigger | `h-9 rounded-[6px] border border-[var(--gray-2)] bg-background`。           |
| Content | `z-[10002] flex w-auto min-w-[320px] gap-1 p-1`。                           |
| 列表项  | `rounded-sm px-2 py-1.5 text-sm hover:bg-[var(--gray-3)]`。                 |

## SelectItems

- 入口：`import { SelectItems } from "@/components/ui/standard/select-items"`。
- Trigger 默认追加 `h-9`；Content 可传 `contentClassName`。

## 使用规则

- 筛选器要支持空结果文案，不要渲染空白下拉层。
- 需要搜索、清空、级联时优先这些封装，不要从基础 Select 重新造。
