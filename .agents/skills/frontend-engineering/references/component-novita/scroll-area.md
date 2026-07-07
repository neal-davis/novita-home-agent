# ScrollArea

**源码**：`src/components/ui/scroll-area.tsx`。

| 节点                 | 规范                                                     |
| -------------------- | -------------------------------------------------------- |
| Root                 | `relative overflow-hidden`。                             |
| Viewport             | `h-full w-full rounded-[inherit]`。                      |
| ScrollBar vertical   | `h-full w-2.5 border-l border-l-transparent p-[1px]`。   |
| ScrollBar horizontal | `h-2.5 flex-col border-t border-t-transparent p-[1px]`。 |
| Thumb                | `relative flex-1 rounded-full bg-border`。               |

## 使用规则

- 表格和宽内容优先局部滚动，不造成页面级横向滚动。
- 如果项目已有 `scrollBar_container` / `scrollBar_container_new`，优先沿用相邻代码模式。
