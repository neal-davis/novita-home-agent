# JieKou z-index

**源码范围**：`src/components/ui/*`、`src/components/ui/standard/*`。

| 场景                                     | 层级                   |
| ---------------------------------------- | ---------------------- |
| Header                                   | `z-[999]`              |
| AlertDialog Overlay / Content            | `z-999` / `z-1000`     |
| Drawer Overlay / Content                 | `z-1000`               |
| Dialog Overlay / Content                 | `z-[1001]`             |
| Sheet                                    | `z-50`                 |
| Popover / Dropdown / Tooltip / HoverCard | 通常 `z-50`            |
| Select Content                           | inline `zIndex: 10002` |
| DateRangePicker PopoverContent           | 常见 `z-1000`          |

新增浮层必须先选语义层级；不要新增 `z-[9999]` 这类无语义兜底。
