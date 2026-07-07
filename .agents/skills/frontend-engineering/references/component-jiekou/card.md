# JieKou Card

**源码**：`src/components/ui/card.tsx`。

- Card：`rounded-lg border bg-card text-card-foreground shadow-sm`。
- Header / Content / Footer 按 shadcn 结构分区，不要在页面 section 外层滥用 Card。
- 新 dashboard 或 console 区块先查现有业务容器；Card 只用于真正的独立重复项、工具面板或 modal 内模块。
