# 可访问性

## 触发条件

在以下情形按需加载本文档：新建交互组件（按钮、表单、弹窗、下拉菜单、Tab 组件等）；使用非语义化元素（`div` / `span`）实现可点击/可聚焦行为；项目明确要求 WCAG 合规；用户反馈键盘无法操作或 screen reader 读取异常；Figma 设计稿含图标按钮、无文字操作区域时。

---

## 语义化 HTML

使用正确的 HTML 元素，让浏览器和辅助技术无需额外提示即可理解结构：

| 场景 | ✅ 正确 | ❌ 避免 |
|------|--------|--------|
| 可点击操作 | `<button>` | `<div onClick>` |
| 页面导航链接 | `<a href>` | `<div onClick>` |
| 表单输入 | `<input>` + `<label>` | 无 label 的裸 input |
| 页面主体区域 | `<main>` | `<div id="main">` |
| 导航区域 | `<nav>` | `<div class="nav">` |
| 内容分组 | `<section>` / `<article>` | 纯 `<div>` 堆叠 |
| 标题层级 | `<h1>`–`<h6>` 按层级使用 | 跳级或用 `<div>` 加粗模拟 |

---

## ARIA

**优先使用原生语义，ARIA 是补充而非替代。** 只在原生 HTML 无法表达语义时使用 `aria-*`。

### 常用属性

```tsx
// 图标按钮：视觉上只有图标，需告知 screen reader 含义
<button aria-label="关闭">
  <CloseIcon aria-hidden="true" />
</button>

// 纯装饰性图标：隐藏，避免 screen reader 读出无意义内容
<StarIcon aria-hidden="true" />

// 表单错误提示关联
<input
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
<span id="email-error" role="alert">{error}</span>

// 动态内容区域（如搜索结果）
<div aria-live="polite" aria-atomic="true">
  {results.length} 个结果
</div>

// 展开/折叠状态
<button aria-expanded={isOpen} aria-controls="menu-list">
  菜单
</button>
```

### 常用 role

| role | 适用场景 |
|------|---------|
| `alert` | 错误提示、操作反馈（自动朗读） |
| `dialog` | 模态弹窗 |
| `status` | 非紧急状态更新（如保存成功） |
| `progressbar` | 进度条 |
| `tab` / `tablist` / `tabpanel` | Tab 组件 |
| `combobox` | 搜索下拉、自动补全 |

> 第三方组件库（如 Radix UI、shadcn/ui）已内置正确的 ARIA 角色；直接使用，不要覆盖其 aria 属性。

---

## 键盘导航

所有可交互元素必须可通过键盘访问：

- **Tab** 可聚焦到所有操作项；顺序与视觉顺序一致
- **Enter / Space** 触发按钮和链接
- **Escape** 关闭弹窗、下拉菜单、抽屉
- **方向键** 在 Tab 组、菜单、单选组内切换选项

```tsx
// ✅ 使用原生 button，自带键盘支持
<button onClick={handleClose}>关闭</button>

// ❌ div 不可键盘聚焦，需额外加 tabIndex 和 onKeyDown
<div onClick={handleClose}>关闭</div>
```

**自定义键盘交互时**，同时处理 `onClick` 和 `onKeyDown`（Enter/Space）：

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleAction}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleAction()
    }
  }}
>
  操作
</div>
```

> 尽量避免这种写法——直接用 `<button>` 更简洁且原生支持。

---

## Focus 管理

### 弹窗 / 抽屉

- 打开时：focus 移入弹窗内第一个可聚焦元素
- 打开期间：Tab 焦点锁定在弹窗内部（focus trap）
- 关闭时：focus 返回触发弹窗的元素

```tsx
// Radix Dialog / shadcn Dialog 已内置 focus trap
// 自实现时使用 focus-trap-react 或 @radix-ui/react-focus-scope
```

### 路由切换

页面跳转后，将焦点移至新页面的主标题或主内容区，避免停留在离开的位置：

```tsx
// Next.js App Router 已处理路由级 focus；如有自定义需求，ref.current?.focus()
```

---

## 图片与媒体

```tsx
// ✅ 有意义的图片：描述图片内容
<img src="/chart.png" alt="2024 年 Q3 销售额同比增长 32%" />

// ✅ 装饰性图片：空 alt，screen reader 跳过
<img src="/decoration.svg" alt="" />

// ✅ next/image 同理
<Image src="/hero.jpg" alt="产品主视觉" width={1200} height={630} />

// ❌ 缺少 alt
<img src="/chart.png" />

// ❌ 无意义 alt
<img src="/chart.png" alt="图片" />
```

---

## 颜色与对比度

- 正文文字与背景的对比度 ≥ **4.5:1**（WCAG AA）
- 大字号文字（18px+ 或 14px+ 加粗）对比度 ≥ **3:1**
- 不能仅靠颜色传递信息（如错误状态同时用颜色 + 图标 + 文字）

```tsx
// ❌ 仅用颜色区分错误
<span style={{ color: 'red' }}>{errorMessage}</span>

// ✅ 颜色 + 图标 + 文字
<span className="text-error flex items-center gap-1">
  <ErrorIcon aria-hidden="true" />
  {errorMessage}
</span>
```

> 使用设计 token 中的语义色（`text-error`、`text-success` 等）时，确认 token 值本身满足对比度要求；不满足时提示用户。

---

## 动效与减少动态

尊重用户的系统级"减少动画"设置：

```scss
// SCSS
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

```tsx
// Tailwind
<div className="transition-all motion-reduce:transition-none" />
```

---

## 自检

- [ ] **语义化** — 可点击元素用 `<button>`，导航用 `<a href>`，结构用语义标签；无用 `div/span` 模拟交互元素
- [ ] **图片 alt** — 有意义图片有描述性 alt；装饰性图片 `alt=""`；无缺失
- [ ] **表单关联** — 每个 `<input>` 有对应 `<label>`（`htmlFor` 关联）或 `aria-label`
- [ ] **图标按钮** — 纯图标操作有 `aria-label`；装饰性图标有 `aria-hidden="true"`
- [ ] **错误提示** — 用 `aria-describedby` 关联错误文字；用 `role="alert"` 确保自动朗读
- [ ] **键盘可用** — 所有操作可 Tab 聚焦；Enter/Space 触发；Escape 关闭浮层
- [ ] **Focus 管理** — 弹窗打开时焦点移入；关闭时焦点还原；Tab 不会离开弹窗
- [ ] **动效降级** — 动画/过渡有 `prefers-reduced-motion` 降级处理
