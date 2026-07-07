# 组件模式防错

Agent 生成组件时容易犯的错误和正确模式。

---

## Agent 常见错误

### 1. Props 过度暴露

```typescript
// ❌ Agent 倾向于暴露太多 props
interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  overlayClassName: string     // 不需要暴露
  animationDuration: number    // 不需要暴露
}

// ✅ 只暴露外部需要控制的
interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
```

### 2. Boolean 参数爆炸

```typescript
// ❌ Agent 喜欢加 boolean 开关
<Button primary large outline disabled loading />

// ✅ 用 variant + size 语义化
<Button variant="primary" size="lg" loading disabled />
```

### 3. 数据获取和渲染混在一起

```typescript
// ❌ 一个组件里既获取数据又渲染
'use client'
export function UserProfile({ id }: { id: string }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    GetUserDetail({ id }).then(setData)
  }, [id])
  // ... 200 行渲染逻辑
}

// ✅ 数据获取提取到 hook，组件只负责渲染
// hooks/useUserData.ts
export function useUserData(id: string) { ... }

// components/UserProfile.tsx
'use client'
export function UserProfile({ id }: { id: string }) {
  const { data, isLoading } = useUserData(id)
  if (isLoading) return <Skeleton />
  return <UserProfileView user={data} />
}
```

### 4. 不必要的 Client Component

参考 `rsc-and-directives.md`——Agent 倾向于在不需要时加 `'use client'`。

---

## 拆分信号

组件出现以下情况时需要拆分：

- 超过 200 行
- 有独立的交互逻辑（独立的 state + handler）
- 混合了多种职责（参考 `code-layering.md`）
- 在多处复用

## 状态选择

| 状态类型 | 方案 |
|---------|------|
| UI 局部状态 | `useState` |
| 服务端数据 | RSC 直接获取 / 项目内数据请求 hook |
| 全局客户端状态 | 看项目用什么（Zustand / Jotai / Context） |
| URL 状态 | `useSearchParams` |
| 表单 | React Hook Form / `useActionState` |

**原则：** 状态放最近的使用位置。先 `useState`，共享时提升，跨层级用 Context 或状态库。
