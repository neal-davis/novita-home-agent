# Pagination

**源码**：`src/components/ui/pagination.tsx`；业务分页：`standard/pagination.tsx`、`standard/pagination-control.tsx`。

| 节点            | 规范                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Pagination      | `nav role="navigation" aria-label="pagination"`，`mx-auto flex w-full`。                         |
| Content         | `flex flex-row items-center gap-1`。                                                             |
| Label           | `buttonVariants({ variant: isActive ? "outline" : "noborderghost", size })` + `cursor-pointer`。 |
| Link            | active 用 `noborderoutline`，非 active 用 `noborderghost`。                                      |
| Previous / Next | `gap-1 cursor-pointer`，含 `aria-label`。                                                        |
| Ellipsis        | `h-9 w-9`，含 `sr-only` More pages。                                                             |

## StandardPagination

- 默认导入：`import StandardPagination from "@/components/ui/standard/pagination-control"` 或 `@/components/ui/standard/pagination`。
- `customButtonStyle` 分支里有 `text-[#000]`，维护时优先换为 token，但不要顺手扩大改动。
