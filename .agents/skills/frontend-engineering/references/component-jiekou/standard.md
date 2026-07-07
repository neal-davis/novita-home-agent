# JieKou Standard Components

**源码**：`src/components/ui/standard/*`。

| 场景                        | 入口                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| Empty state                 | `import { NoData } from "@/components/ui/standard/no-data"`                                        |
| Sandbox empty               | `import { SandboxNoData } from "@/components/ui/standard/sandbox-no-data"`                         |
| Page loading                | `import EmptyPageLoading from "@/components/ui/standard/empty-page-loading"`                       |
| Notify/message              | `import { message, notify, notification } from "@/components/ui/standard/notify"`                  |
| Confirm/info/warning dialog | `confirm-dialog`、`info-dialog`、`warning-dialog`                                                  |
| Pagination                  | `@/components/ui/standard/pagination`                                                              |
| Date range                  | `date-range-picker`、`date-range-picker-utc`、`date-range-picker-utc-common`、`dayjs-range-picker` |
| Filter select               | `selectFilter`、`cascade-filter`、`select-items`                                                   |
| Tooltip                     | `@/components/ui/standard/tooltip`                                                                 |
| Form error                  | `@/components/ui/standard/form-error-text`                                                         |
| Number / slider             | `number-input`、`value-slider`                                                                     |
| Copy / markdown docs        | `code-copy-btn`、`code-with-btn`、`md-docs`                                                        |

`@/components/ui/standard/empty` 不存在，不要生成该 import。列表、表格、卡片集合空状态必须使用真实 NoData 类入口，不要渲染空壳。
