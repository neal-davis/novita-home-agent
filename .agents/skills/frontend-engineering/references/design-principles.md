# 代码生成设计原则

指导 AI 生成高质量 React/Next.js 代码的核心原则。这些原则按优先级排列，冲突时高优先级优先。

---

## 1. 类型优先

先定义 TypeScript 类型（interface / type），再写实现。

```typescript
// ✅ 先定义类型
interface UserCardProps {
  user: User
  onEdit?: (id: string) => void
}

// 再实现组件
export function UserCard({ user, onEdit }: UserCardProps) {
  // ...
}
```

- 所有组件 Props 必须有显式类型定义
- API 响应数据必须定义类型，不使用 `any`
- 共享类型集中在 `types/` 目录或对应模块的 `types.ts` 中
- 使用 `unknown` 替代 `any`，用类型收窄处理

## 2. 单一职责

一个组件/函数只做一件事。判断标准：能否用一句话描述它做什么。

- 组件超过 200 行时考虑拆分
- 一个 hook 只管理一类状态或副作用
- 工具函数保持纯函数，无副作用

## 3. 组合优于继承

使用 hooks + 组合模式构建复杂功能，不使用 class 组件和深层继承。

```typescript
// ✅ 组合模式
function UserProfile({ children }: { children: React.ReactNode }) {
  return <div className="profile">{children}</div>
}

function UserProfileWithAvatar({ user }: { user: User }) {
  return (
    <UserProfile>
      <Avatar src={user.avatar} />
      <UserInfo user={user} />
    </UserProfile>
  )
}
```

## 4. 最小暴露

只 export 外部需要的接口。

- 组件内部的工具函数不 export
- barrel export (`index.ts`) 控制模块的公开 API
- 内部类型用 `type` 而非 `export type`，除非外部需要

## 5. 可预测的数据流

单向数据流，状态就近原则。

- 状态放在最近的共同父组件
- 避免 prop drilling 超过 3 层，超过时考虑 Context 或状态管理库
- Server Component 负责数据获取，通过 props 传递给 Client Component
- 避免在 Client Component 中直接调用数据库或服务端 API

## 6. DRY 但不过度抽象

重复 3 次以上才提取公共逻辑。

- 两处相似代码可以容忍，三处才提取
- 提取的抽象必须有清晰的职责边界
- 工具函数优先使用已有库（如 lodash/date-fns），不重复造轮子

## 7. Error Boundary 优先

先考虑错误边界和异常处理，再实现正常逻辑。

- 页面级别使用 `error.tsx`（App Router）
- 关键业务组件包裹 Error Boundary
- 异步操作使用 try-catch，提供有意义的错误信息
- 加载状态使用 `loading.tsx` 或 Suspense

## 8. 渐进增强

核心功能不依赖客户端 JavaScript。

- 表单提交优先使用 Server Actions
- 链接使用 `<Link>` 而非 `onClick` 跳转
- 关键内容在 Server Component 中渲染
- 客户端增强（动画、交互反馈等）作为附加层
