# z-index 与 src/components/ui 的差异

**`theme.scss` → `--z-*` → Tailwind `z-dropdown`…`z-top`** 见 **global-ppio §9**。下表为源码硬编码/特例：

| 场景                                            | 实际用法                                  | 说明                                                |
| ----------------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| Popover / Dropdown / HoverCard / Drawer / Sheet | 多为 **`z-50`**                           | **低于** `--z-dropdown`（100）；依赖 DOM / Portal。 |
| Dialog                                          | **`z-[1001]`**                            | **高于** `--z-top`（999）；盖住顶栏。               |
| AlertDialog                                     | Overlay **`z-999`**，Content **`z-1000`** | 与 Dialog 1001 不一致。                             |
| ToastViewport                                   | **`z-[100]`**                             | **低于** 语义 `--z-toast`（800）。                  |
| Select Content                                  | 内联 **`zIndex: 10002`**                  | 强行压在其它浮层之上。                              |

新建浮层：**优先** `z-modal` / `z-popover` 等，并核对是否需超过 Dialog 1001。
