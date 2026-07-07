# 代码分层

核心原则：**每种代码放在它该在的地方，职责不混合。**

遵循项目已有的目录结构。如果项目还没有约定，按以下方式组织。

---

## 生成前必做：归属分析

写任何代码之前，先走一遍归属判定。不是"写完再挪"，是**先想清楚放哪，再动手写**。

```
要写一段代码
  ↓
① 它是什么？→ 识别代码类别（组件 / hook / 常量 / 工具函数 / API / 类型 / …）
  ↓
② 谁会用它？→ 判定归属层级
  ├─ 多个模块都会用   → 全局（src/components/、src/hooks/、src/lib/ …）
  ├─ 仅当前模块内部用 → 模块私有（features/billing/components/ …）
  └─ 仅当前组件用     → 组件同级文件（同目录下独立文件，不是塞进组件里）
  ↓
③ 该目录下已有同类文件吗？→ 有则复用 / 追加，无则新建
  ↓
④ 生成代码
```

### 归属判定规则

| 使用范围 | 归属 | 放置位置 |
|---------|------|---------|
| ≥2 个模块实际引用 | 全局共享 | `src/components/`、`src/hooks/`、`src/lib/`、`src/constants/` 等顶层目录 |
| 仅当前模块使用 | 模块私有 | 模块目录内部，如 `features/billing/components/` |
| 仅当前组件使用，但不属于渲染逻辑 | 组件同级 | 同目录独立文件，如 `columns.tsx`、`config.ts` |
| 当前仅 1 处，但语义明确通用（如 `formatCurrency`） | 全局共享 | 放全局，但不做多余抽象 |

### 晋升与降级

- **晋升**：当第二个模块需要引用时，移至全局目录并更新 import。
- **降级**：只剩一个模块在用时，回收到模块内部。
- **禁止跨模块直取**：模块 A 不应 import 模块 B 的私有文件。如需共享，先晋升到全局。

---

## 分层归位

| 代码类别 | 该在的位置 | 说明 |
|---------|-----------|------|
| 组件 | `components/` | UI 组件，按功能或页面分子目录 |
| Hooks | `hooks/` | 自定义 hooks，复用的交互/数据逻辑 |
| Store | `store/` 或 `stores/` | 状态管理（Zustand / Jotai / Redux 等） |
| 类型 | `types/` 或与模块同级 | TypeScript 类型定义 |
| 常量 | `constants/` 或 `config/` | 枚举值、配置常量、选项映射 |
| 工具函数 | `lib/` 或 `utils/` | 纯函数工具、格式化、校验 |
| API / Data | `api/` | API 请求函数，统一通过项目的 `request` 封装调用 |
| Server Actions | 与路由同级或 `actions/` | Next.js Server Actions |

---

## 什么内容必须从组件中提取

以下内容出现在组件文件里时，说明职责混合了，需要提取到对应层：

| 识别信号 | 提取到 | 示例 |
|---------|--------|------|
| 配置对象 / 映射表（菜单、columns、fields、选项列表） | `constants/` 或同级 `config.ts` | 导航菜单项、表格列定义、Select 选项 |
| SVG 代码块（超过 3-4 行的 `<svg>` 标签） | `components/icons/` 独立组件 | 图标、插图、装饰图形 |
| 正则 / 校验规则 | `lib/validation.ts` | 邮箱正则、密码强度规则 |
| 格式化 / 解析函数 | `lib/` 或 `utils/` | 日期格式化、金额转换 |
| 样式映射（状态→className） | `constants/` | `STATUS_STYLE_MAP` |
| 第三方 SDK 初始化 | `lib/` | Analytics、Sentry 初始化 |
| API 调用逻辑 | `api/` | fetch、request 封装调用 |

### Demo：一个组件的分层重构

```typescript
// ❌ 所有职责混在一个文件里
'use client'
export function UserProfile({ id }: { id: string }) {
  // — API 调用 —
  const [data, setData] = useState(null)
  useEffect(() => { fetch(`/api/user/${id}`).then(r => r.json()).then(setData) }, [id])

  // — 常量 —
  const STATUS_MAP = { active: '活跃', inactive: '已停用' }

  // — 工具函数 —
  const formatDate = (d: Date) => new Intl.DateTimeFormat('zh-CN').format(d)

  // — 内联 SVG —
  const Avatar = () => (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="#e5e7eb" />
      <path d="M20 22c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z" fill="#9ca3af" />
    </svg>
  )

  return <div>{/* 200 行渲染... */}</div>
}
```

```
归属分析：
  STATUS_MAP         → 常量    → constants/user.ts（模块级，billing 也用 → 全局）
  formatDate         → 工具函数 → lib/format.ts（通用 → 全局）
  Avatar SVG         → 图标组件 → components/icons/AvatarIcon.tsx（多处复用 → 全局）
  fetch user         → API     → api/user.ts（全局）
  useState + effect  → Hook    → hooks/useUserData.ts（仅此模块 → 模块级）
```

```typescript
// ✅ 各归其位后，组件只剩渲染逻辑
// components/UserProfile.tsx
'use client'
import { useUserData } from '@/hooks/useUserData'
import { AvatarIcon } from '@/components/icons/AvatarIcon'
import { STATUS_MAP } from '@/constants/user'
import { formatDate } from '@/lib/format'

export function UserProfile({ id }: { id: string }) {
  const { data, isLoading } = useUserData(id)
  if (isLoading) return <Skeleton />
  return (
    <div>
      <AvatarIcon size={40} />
      <span>{STATUS_MAP[data.status]}</span>
      <time>{formatDate(data.createdAt)}</time>
    </div>
  )
}
```

---

## 拆分信号

当一个文件出现以下情况，说明需要拆分：

- **超过 200 行** — 大概率混了多种职责
- **既 fetch 数据又渲染 UI** — 数据逻辑提取到 hook
- **内联定义了工具函数** — 提取到 lib/utils
- **硬编码了配置/常量** — 提取到 constants
- **多处复用相同逻辑** — 提取到 hooks 或 utils
- **包含大段 SVG / 内联图形代码** — 提取为独立图标组件
- **组件内定义了 columns / fields / options 等声明式结构** — 提取到同级配置文件或 constants
- **正则表达式 / 校验规则散落在组件中** — 提取到 lib/validation

---

## 命名约定

### 文件夹命名

**一律使用 kebab-case（中划线）：**

```
src/
├── components/
│   ├── ui/               # 全局基础 UI 组件
│   ├── icons/            # 全局图标组件
│   ├── layout/           # 全局布局组件
│   └── common/           # 全局通用业务组件
├── hooks/                # 全局共享 hooks
├── store/                # 全局状态管理
├── constants/            # 全局共享常量、配置映射
├── config/               # 全局运行时配置（feature flags、SDK 配置等）
├── types/                # 全局共享类型定义
├── lib/                  # 全局工具函数、校验、格式化
└── api/                  # API 请求函数
```

### 文件与代码命名

| 类别 | 模式 | 示例 |
|------|------|------|
| 文件夹 | kebab-case | `user-profile/`, `bare-metal/` |
| 组件文件 | PascalCase | `UserCard.tsx`, `ProjectList.tsx` |
| 图标组件文件 | PascalCase + Icon 后缀 | `CheckIcon.tsx`, `ArrowLeftIcon.tsx` |
| Hooks | `use{Feature}` | `useUserData.ts`, `useAuth.ts` |
| 工具函数 | camelCase | `formatDate.ts`, `validateEmail.ts` |
| 常量 | UPPER_SNAKE_CASE | `PAGINATION_CONFIG`, `AUTH_OPTIONS` |
| 配置文件 | camelCase 或 kebab-case | `navigation.ts`, `feature-flags.ts` |
| 类型 | PascalCase + 后缀 | `UserProps`, `ProjectResponse`, `FormState` |
| Server Actions | camelCase 动词 | `createUser.ts`, `updateProject.ts` |
