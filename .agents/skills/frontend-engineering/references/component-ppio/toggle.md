# Toggle / ToggleGroup

**源码**：`toggle.tsx`、`toggle-group.tsx`。

| variant | 圆角                | 边框 / 背景（默认）                  | Hover                                          | 选中                                                               |
| ------- | ------------------- | ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------ |
| default | `rounded-minismall` | 无框 `bg-transparent`                | `hover:bg-accent hover:text-muted-foreground`  | `data-[state=on]:bg-accent data-[state=on]:text-accent-foreground` |
| outline | 同左                | `border border-input bg-transparent` | `hover:bg-accent hover:text-accent-foreground` | 同 default                                                         |
| primary | 同左                | `border`                             | —                                              | `data-[state=on]:text-brand-0`                                     |

**禁用**：`disabled:opacity-50`。
