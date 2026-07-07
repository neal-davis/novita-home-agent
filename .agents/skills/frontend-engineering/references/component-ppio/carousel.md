# Carousel

**源码**：`carousel.tsx`。

| 维度                | 规范                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------- |
| **Previous / Next** | `Button` `variant="outline"`（可覆盖）、`size="icon"`，附加 `absolute h-8 w-8 rounded-full`。 |
| **禁用**            | 依赖 `canScrollPrev` / `canScrollNext` 传入 Button `disabled`。                               |
| **内容区**          | overflow + flex 切片，无独立 border token。                                                   |
