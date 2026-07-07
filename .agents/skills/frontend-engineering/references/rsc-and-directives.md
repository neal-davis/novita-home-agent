# RSC 边界与 Directives

React Server Components（RSC）是 Next.js App Router 的核心。正确划分 Server/Client 边界是前端架构的关键决策。

---

## Directives

### `'use client'`

将文件标记为 Client Component。只在**必须使用客户端能力**时添加。

**必须使用 `'use client'` 的场景：**
- 使用 `useState`、`useReducer`、`useEffect`、`useRef` 等 React hooks
- 使用浏览器 API（`window`、`document`、`localStorage`、`navigator`）
- 使用事件监听器（`onClick`、`onChange`、`onSubmit` 等）
- 使用 `useContext` 消费 Context
- 使用依赖客户端的第三方库

**不应使用 `'use client'` 的场景：**
- 仅做数据展示、无交互的组件
- 仅使用 props 渲染的纯展示组件
- 数据获取组件（应在 Server Component 中获取）

### `'use server'`

将函数标记为 Server Action，可被客户端调用。

```typescript
// actions/user.ts
'use server'

export async function updateUser(formData: FormData) {
  const name = formData.get('name') as string
  // 直接访问数据库或服务端 API
  await db.user.update({ where: { id }, data: { name } })
  revalidatePath('/profile')
}
```

**使用规则：**
- 只用在异步函数上
- 函数参数必须可序列化
- 可在 `<form action={serverAction}>` 中直接使用
- 也可在 `onClick` 等事件中通过 `startTransition` 调用

---

## 边界判断决策树

```
组件需要用户交互（click/input/hover 等）？
  ├─ 是 → 'use client'
  └─ 否 → 组件需要浏览器 API？
             ├─ 是 → 'use client'
             └─ 否 → 组件需要 React hooks（state/effect/ref）？
                        ├─ 是 → 'use client'
                        └─ 否 → 组件使用依赖客户端的第三方库？
                                   ├─ 是 → 'use client'
                                   └─ 否 → 保持 Server Component（不加 directive）
```

---

## 边界最佳实践

### 1. 将 `'use client'` 下推到最小范围

```typescript
// ❌ 整个页面都变成 Client Component
'use client'
export default function ProductPage({ product }) {
  const [count, setCount] = useState(0)
  return (
    <div>
      <ProductDetails product={product} />  {/* 这部分不需要客户端 */}
      <AddToCart count={count} setCount={setCount} />
    </div>
  )
}

// ✅ 只有需要交互的部分是 Client Component
// ProductPage.tsx (Server Component，不加 directive)
export default function ProductPage({ product }) {
  return (
    <div>
      <ProductDetails product={product} />
      <AddToCart productId={product.id} />  {/* 只有这个是 Client */}
    </div>
  )
}

// AddToCart.tsx
'use client'
export function AddToCart({ productId }: { productId: string }) {
  const [count, setCount] = useState(0)
  // ...
}
```

### 2. Server Component 作为数据获取层

```typescript
// app/users/page.tsx (Server Component)
export default async function UsersPage() {
  const users = await getUsers()  // 直接在服务端获取数据
  return <UserList users={users} />  // 传递给展示组件
}
```

### 3. 避免不必要的 `'use client'` 传染

当 Client Component import 一个模块时，该模块也变成 Client。避免在 Client Component 中 import 仅在服务端使用的大型库。

```typescript
// ❌ 把服务端逻辑混入客户端
'use client'
import { db } from '@/lib/db'  // 数据库客户端不应进入客户端 bundle

// ✅ 通过 Server Action 或 API 路由隔离
'use client'
import { updateUser } from '@/actions/user'  // Server Action
```

### 4. Composition Pattern 穿越边界

Server Component 可以将 Server Component 作为 `children` 传递给 Client Component：

```typescript
// Layout.tsx (Server Component)
export default function Layout() {
  return (
    <Sidebar>  {/* Client Component */}
      <ServerNav />  {/* 仍然是 Server Component */}
    </Sidebar>
  )
}
```
