# Carousel

**源码**：`src/components/ui/carousel.tsx`。

| 节点            | 规范                                                               |
| --------------- | ------------------------------------------------------------------ |
| Carousel root   | `relative`。                                                       |
| viewport        | `overflow-hidden`。                                                |
| Previous / Next | `absolute h-8 w-8 rounded-full`，图标 `h-4 w-4`，含 sr-only 文案。 |

## 使用规则

- 箭头按钮保留圆形 icon button 语义，不要用文本按钮替代。
- 轮播内容需要可键盘/按钮操作；不要只依赖拖拽。
