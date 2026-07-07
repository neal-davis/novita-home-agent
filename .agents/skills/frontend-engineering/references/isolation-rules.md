# 文件级隔离规则

---

## 核心概念

`.preview.tsx` 文件用于**产品/设计为了需求演示、原型测试等非实际实现目的**生成的代码。这不是对"只能新增不能修改"的限制——正式的功能开发该修改就修改。

**判断标准：这段代码是要上线的功能实现，还是为了演示/验证/原型而临时生成的？**

- 要上线 → 直接在正式代码中开发
- 演示/原型/测试概念 → 使用 `.preview.tsx`

---

## 意图识别

遇到以下文件时，识别为**非业务代码**，严格隔离，不得混入正式模块。

### 文件名识别

| 命名模式 | 判定 |
|----------|------|
| `*.preview.tsx` / `*.preview.ts` | 演示/预览文件 |
| `*.mock.ts` / `*.mock.tsx` | Mock 数据文件 |
| `*.demo.tsx` / `*.demo.ts` | 演示文件 |
| `*.example.tsx` / `*.example.ts` | 示例文件 |
| `*.story.tsx` / `*.stories.tsx` | Storybook 文件 |
| `*.test.tsx` / `*.spec.tsx` | 测试文件 |
| `*.fixture.ts` | 测试固件数据 |

### 文件内容识别

即使文件名不含上述后缀，通过代码实际行为判断是否为演示/展示内容：

**数据层面 — 无真实数据源：**
- 数据全部硬编码（字面量数组/对象），无 API 调用、无 fetch、无 SWR/React Query
- 使用 `Mock.mock()` / `faker` 等库生成假数据
- 变量/常量为 `MOCK_`、`FAKE_`、`DEMO_`、`EXAMPLE_` 等演示前缀

**交互层面 — 无真实业务逻辑：**
- 无表单提交、无 Server Action 调用、无状态持久化
- 事件处理仅 `console.log` / `alert` / 空函数，无实际副作用
- 无鉴权判断、无权限校验、无业务错误处理

**视图层面 — 纯展示组合：**
- 仅组合已有组件 + 传入固定 props 来展示效果
- 无路由注册（不在 `app/` 路由目录下、未被 router 引用）
- 无 `useEffect`、无 `useContext`、无全局状态读写
- 组件名含 `Preview`、`Demo`、`Example`、`Playground`、`Showcase` 等展示语义

**结构层面 — 孤立文件：**
- 未被任何正式业务文件 import
- 未在 barrel export（`index.ts`）中导出

### 隔离要求

- 正式业务代码**不得 import** 上述文件
- 上述文件**可以 import** 正式组件和 mock 数据
- 构建配置中应排除 `*.preview.*`、`*.mock.*`、`*.demo.*` 等文件

---

## 文件类型

### Preview 文件（`*.preview.tsx`）

产品/设计生成的演示视图，不进入生产构建。

```typescript
// components/features/checkout/CheckoutFlow.preview.tsx
// @generated-preview
// 用途：产品演示新的结账流程
// 创建者：产品团队
// 日期：2024-03-15

'use client'

import { CheckoutStep } from './CheckoutStep'
import { mockCartItems } from './cart.mock'

export function CheckoutFlowPreview() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1>结账流程演示</h1>
      <CheckoutStep items={mockCartItems} />
    </div>
  )
}
```

**规则：**
- 文件名格式：`{ComponentName}.preview.tsx`
- 文件首行添加 `// @generated-preview` 标记
- 建议添加用途、创建者、日期注释
- 可以 import 正式组件来组合演示
- 可以 import `*.mock.ts` 数据
- 不应被正式代码 import

### Mock 文件（`*.mock.ts`）

Mock 数据文件，详细规范见 `mock-rules.md`。

---

> 定期清理过期的 preview 文件，避免代码库中积累大量废弃 preview。
