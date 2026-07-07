# 薄封装与无样式组件（索引）

下列文件**不定义**新的边框/背景规范，以内部 primitive 为准：

| 文件                               | 说明                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| **`ConditionalRender.tsx`**        | 条件渲染，无额外 DOM 样式。                              |
| **`standard/pagination.tsx`**      | 基于 `pagination.tsx`；默认 `mt-4` + `justify-{align}`。 |
| **`standard/expandable-text.tsx`** | `Button` + `relative` / 测量用 invisible。               |

不增加新 design token。
