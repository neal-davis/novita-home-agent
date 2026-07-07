# Skeleton

**源码**：`src/components/ui/skeleton.tsx`。

| 形态            | 规范                                                |
| --------------- | --------------------------------------------------- |
| 基础            | `animate-pulse rounded-md bg-muted-light`。         |
| 文本组          | wrapper `space-y-2`，行高 `h-4`，支持多行宽度变化。 |
| button skeleton | `h-8 rounded-md`，block 时 `w-full`，否则 `w-24`。  |

## 使用规则

- 数据加载时优先 skeleton 而不是空壳。
- Skeleton 尺寸应接近最终内容，避免加载完成后布局大幅跳动。
