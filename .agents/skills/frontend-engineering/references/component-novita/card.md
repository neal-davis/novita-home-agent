# Card

**源码**：`src/components/ui/card.tsx`。

| 节点              | 规范                                                         |
| ----------------- | ------------------------------------------------------------ |
| `Card`            | `rounded-lg border bg-card text-card-foreground shadow-sm`。 |
| `CardHeader`      | `flex flex-col space-y-1.5 p-6`。                            |
| `CardTitle`       | `font-h5`。                                                  |
| `CardDescription` | `text-sm text-muted-foreground`。                            |
| `CardContent`     | `p-6 pt-0`。                                                 |
| `CardFooter`      | `flex items-center p-6 pt-0`。                               |

## 使用规则

- Console 场景的页面容器优先 `console-card`；不要把页面 section 包成 Card。
- Website 页面优先 `max_width_container` 和无框 section；Card 用于重复条目、弹窗内容或真正需要边框的局部。
- 现有 Card 的 `rounded-lg` / `shadow-sm` 是项目真实 shadcn wrapper，不要为了 token 化无意义重写。
