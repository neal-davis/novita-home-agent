# NavigationMenu

**源码**：`src/components/ui/navigation-menu.tsx`。

| 节点                | 规范                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Trigger             | `h-10 rounded-md bg-background px-4 py-2 text-sm font-medium`。                           |
| Trigger hover/focus | `hover:bg-accent-hover hover:text-accent-foreground`；focus `bg-accent-active`。          |
| Viewport            | `mt-1.5 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg`。 |
| Indicator           | `top-full z-[1]`，箭头 `h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md`。            |

## 使用规则

- Header/nav 菜单项来自项目既有 navigation hooks/data，不要凭页面主题臆造。
- 如果项目当前 header 使用业务组件，不要强行切换到 NavigationMenu。
