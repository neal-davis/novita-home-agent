# z-index 与浮层层级

Novita `tailwind.config.ts` 只扩展了 `z-999`、`z-1000`，但 `src/components/ui` 中存在多个 arbitrary z-index。按真实源码对账：

| 场景                                             | 实际用法                                 | 说明                                        |
| ------------------------------------------------ | ---------------------------------------- | ------------------------------------------- |
| Header                                           | `z-[999]`                                | 业务 header 约定。                          |
| Dialog                                           | Overlay / Content 都是 `z-[1001]`        | 高于 Header。                               |
| Drawer                                           | Overlay / Content 都是 `z-[1001]`        | 与 Dialog 同级。                            |
| AlertDialog                                      | Overlay `z-[10003]`，Content `z-[10004]` | 高于 Dialog / Select。                      |
| SelectContent                                    | inline `style={{ zIndex: 10002 }}`       | 高于 Dialog，低于 AlertDialog content。     |
| CascadeFilter                                    | Content `z-[10002]`                      | 与 Select 保持一致。                        |
| Popover / Dropdown / HoverCard / Tooltip / Sheet | 多为 `z-50`                              | 依赖 portal / DOM 顺序；不保证压过 Dialog。 |
| NavigationMenu indicator                         | `z-[1]`                                  | 仅局部层级。                                |
| DateRangePicker popover                          | `z-1000` class                           | 依赖 Tailwind `zIndex.1000`。               |

## 使用规则

- 新建浮层优先复用现有组件，不要新增 `z-[9999]`。
- Dialog 内 dropdown 优先 Select/standard filter 这类已有高层级实现。
- 如果必须调整层级，先说明目标遮挡关系：Header、Dialog、AlertDialog、SelectContent 哪个应在上。
