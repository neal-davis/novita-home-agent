# Collapsible

**源码**：`src/components/ui/collapsible.tsx`。

该文件是 Radix Collapsible 的薄导出：

```tsx
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```

## 使用规则

- Collapsible 本身无样式；边框、圆角、动画、trigger 样式由业务层提供。
- 如果需要 Accordion 式标题和分割线，优先查现有页面模式，不要假设 Collapsible 自带视觉。
