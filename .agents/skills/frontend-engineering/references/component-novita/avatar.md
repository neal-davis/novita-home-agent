# Avatar

**源码**：`src/components/ui/avatar.tsx`。

| 节点           | 规范                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| Avatar         | `relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full`。               |
| AvatarImage    | `aspect-square h-full w-full`。                                                 |
| AvatarFallback | `flex h-full w-full items-center justify-center rounded-full bg-none text-sm`。 |

## 使用规则

- 用户头像缺图时使用 fallback 文本，不要用破图占位。
- 有业务含义的头像图片需要合适 alt；纯装饰按项目约定处理。
