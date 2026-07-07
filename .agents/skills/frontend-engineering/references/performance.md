# 性能

代码生成过程中需要规避的常见性能问题。

---

## Import 陷阱

```typescript
// ❌ 整包导入（bundle 爆炸）
import _ from 'lodash'
import * as Icons from 'lucide-react'

// ✅ 按需导入
import debounce from 'lodash/debounce'
import { Search, Plus } from 'lucide-react'
```

**规则：** 第三方库使用具名导入，支持 tree shaking。发现整包导入立即改为按需导入。框架约定的默认导出（如页面组件 `export default`、`next/dynamic`、`next/image` 等）按框架规范使用，不受此限制。

## 不必要的依赖

Agent 喜欢引入第三方库解决原生可以解决的问题：

**规则：** 新增依赖前，先检查原生方案和项目已有工具。

## 大型组件未懒加载

```typescript
// ❌ 首屏不需要的大组件直接导入
import { MarkdownEditor } from './MarkdownEditor'
import { ChartDashboard } from './ChartDashboard'

// ✅ 动态导入
import dynamic from 'next/dynamic'
const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), { ssr: false })
const ChartDashboard = dynamic(() => import('./ChartDashboard'))
```

**判断：** 组件不在首屏 + 体积大 → `dynamic import`。

## memo/useMemo/useCallback 滥用

```typescript
// ❌ Agent 喜欢到处加 memo
const SimpleText = memo(({ text }: { text: string }) => <p>{text}</p>)
const value = useMemo(() => a + b, [a, b])  // 简单计算不需要 memo

// ✅ 只在确有性能问题时用
const ExpensiveList = memo(function ExpensiveList({ items, filter }: Props) {
  const filtered = useMemo(
    () => items.filter(i => i.name.includes(filter)),  // 大数组才需要
    [items, filter]
  )
  return filtered.map(item => <Item key={item.id} item={item} />)
})
```

**规则：** 不要预防性地加 memo。简单组件、基础类型 props、低频渲染组件都不需要。

## 列表 Key

```typescript
// ❌ 用 index 做 key
{items.map((item, index) => <Item key={index} item={item} />)}

// ✅ 用稳定的 id
{items.map(item => <Item key={item.id} item={item} />)}
```

## 图片未使用 next/image

Agent 容易生成原生 `<img>` 标签。在 Next.js 项目中一律用 `next/image`：

```typescript
// ❌
<img src="/hero.jpg" alt="Hero" />

// ✅
import Image from 'next/image'
<Image src="/hero.jpg" alt="Hero" width={1200} height={630} priority />
```

首屏图片加 `priority`，非首屏图片默认懒加载。
