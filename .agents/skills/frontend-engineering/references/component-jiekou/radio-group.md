# JieKou Radio Group

**源码**：`src/components/ui/radio-group.tsx`。

- 使用 Radix RadioGroup。
- Web 场景选中态偏向 `text-primary`；console / non-web 场景源码中存在 `border-black text-black`。
- 新增业务前先确认场景是 website 还是 console，不要把黑色 console radio 样式扩散到 web 表单。
