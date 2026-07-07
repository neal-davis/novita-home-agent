# Mock 数据规范

---

## 核心规则：业务代码与 Mock 严格隔离

### 禁止业务代码混入 Mock

`src/` 下的业务文件中**不允许**出现以下情况：

```typescript
// ❌ 直接 import mock 文件
import { mockUsers } from '@/mock/user'
import data from '../__mocks__/orders'

// ❌ 硬编码测试数据
const users = [{ id: '1', name: '测试用户' }]

// ❌ 用环境变量在业务代码中做 mock 分支
const data = process.env.NODE_ENV === 'development' ? MOCK_DATA : await fetchAPI()

// ✅ 业务代码只通过 API 层获取数据，mock 由基础设施层处理
const { data: users } = useUserList()
```

### 命名规范

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Mock 数据文件 | `*.mock.ts` / `*.mock.tsx` | `user.mock.ts` |
| Mock 变量/常量 | `MOCK_` / `mock` 前缀 | `MOCK_USER_LIST`、`mockOrder` |
| Mock 目录 | 项目根 `mock/` 或 `__mocks__/` | `mock/v1/user/list.ts` |

### 检查要点

自检和 CR 时重点排查：
- `src/` 下无 `import` 引用 `mock/` 或 `__mocks__/` 目录的文件
- `src/` 下无 `MOCK_`、`FAKE_`、`DEMO_` 前缀的变量或常量
- 业务代码中无基于 `NODE_ENV` 的 mock 数据分支逻辑
- 构建产物中无 mock 相关代码（动态 `import()` + 环境判断确保 tree-shaking 排除）

---

## Mock 数据类型与质量

- Mock 数据结构**必须与真实 API 返回类型一致**，能通过类型校验
- 推荐使用 [Mock.js](http://mockjs.com/) 生成动态数据，避免写死固定值
- 包含合理的测试场景：边界值、空列表、分页、错误响应等

```typescript
// mock/v1/user/list.ts
import Mock from 'mockjs'

export default Mock.mock({
  'list|10-20': [{
    'id|+1': 1,
    name: '@cname',
    email: '@email',
    'status|1': ['active', 'inactive'],
    createdAt: '@datetime',
  }],
  total: 100,
})
```

---

## Agent 生成 Mock 数据时

1. 确认 API 接口路径和请求方法
2. 在 `mock/` 下按 API path 创建对应 `.mock.ts` 文件
3. 使用 Mock.js 生成动态数据，数据结构与 API 类型定义对齐
4. 包含合理的测试场景（边界值、空列表、分页等）
5. 不在业务代码中引入任何 mock 相关的 import
6. 确认 API route handler 能动态加载到新建的 mock 文件

---

## Mock 服务基础设施

> 以下为项目级 mock 服务搭建方案。**以项目实际的 mock service 机制为准**，Agent 先搜索项目中已有的 mock 目录和使用方式，遵循已有模式。如果项目没有现成的 mock 体系，参考以下方案。

### 目录结构

Mock 文件放在项目根目录 `mock/` 下，路径与 API path 一一对应：

```
mock/
└── v1/
    ├── user/
    │   ├── list.mock.ts         ← /api/v1/user/list
    │   └── detail.mock.ts       ← /api/v1/user/detail
    └── auth/
        └── login.mock.ts        ← /api/v1/auth/login
```

### 服务机制

Mock 使用独立的 `/api/mock/*` 路由，**不劫持正常的 `/api/*` 请求**。业务代码通过 API 基础设施层统一路由，mock 切换对业务代码透明。

```
请求发起
│
├── /api/mock/{path}（mock 路由）
│   ├── 生产环境 → 404
│   └── 开发环境
│       ├── mock/ 下有对应文件 → 返回 mock 数据
│       └── 无对应 mock → 代理到真实 API
│
└── /api/{path}（正常路由）→ 真实 API
```

### 关键实现要点

**1. 独立路由 + 生产环境 404**

```typescript
// app/api/mock/[...path]/route.ts
const isDev = process.env.NODE_ENV === 'development'

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  if (!isDev) {
    return new Response(null, { status: 404 })
  }
  // ... mock 逻辑
}
```

**2. 动态加载 — mock 文件不打入 bundle**

```typescript
const path = params.path.join('/')
try {
  const mockModule = await import(`@/mock/${path}.mock.ts`)
  return Response.json(mockModule.default)
} catch {
  // mock 文件不存在，走 fallback
}
```

**3. Fallback — 无 mock 时代理到目标服务**

```typescript
const targetBase = process.env.API_TARGET_URL
const res = await fetch(`${targetBase}/api/${path}`, { ... })
return new Response(res.body, { status: res.status, headers: res.headers })
```

**4. API 基础设施层统一路由**

mock 切换在 API 基础设施层处理，业务代码无感知：

```typescript
// lib/api.ts — 基础设施代码，非业务代码
const BASE = process.env.NEXT_PUBLIC_API_MOCK === 'true'
  ? '/api/mock'
  : process.env.NEXT_PUBLIC_API_BASE

export const fetcher = (path: string) => fetch(`${BASE}/${path}`).then(r => r.json())
```

业务代码只调用 `fetcher('v1/user/list')`，不关心数据来源。
