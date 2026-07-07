# 样式规则

---

## PRE：加载项目品牌 reference

> **使用本文档前，先按 `SKILL.md` 的“项目识别”判断是否命中 JieKou / Novita / PPIO。**
>
> | 情况                        | 操作                                                                                                                                     |
> | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
> | 命中 JieKou / Novita / PPIO | 加载对应 `global-*` / `component-*` reference；**token 值、语义类名、颜色/间距/字号等以项目 reference 为准**，本文档其余规则在此之下生效 |
> | 未命中三项目                | 继续按本文档的分层链路执行                                                                                                               |
>
> 项目 `global-*` reference 优先于 design-token / theme.scss / globals.scss 中的任何具体值。

---

## Token 来源

Agent 按以下顺序确定项目的 token 体系：

1. **按项目识别加载品牌 reference** — JieKou / Novita / PPIO 的具体 token 值和语义以对应 `global-*` 为准（**最高优先级**）
2. **没有品牌 reference 命中时**，以项目 `tailwind.config` 中的 `theme.extend` 为准
3. **条件类名工具**（`cn` / `clsx`）、类名排序等，遵循项目已有写法

---

## 核心原则

1. **优先加载项目品牌 reference**
   命中 JieKou / Novita / PPIO 时，token 值和语义类名以对应 `global-*` 为准，不自行假设或硬编码。

2. **全局 Design Token 为单一事实来源（无品牌 reference 命中时）**
   颜色、字号刻度、字重、行高、圆角、阴影等以 `_design-tokens.scss`（或等价文件）及衍生的语义变量为主；避免在组件里写死十六进制、随意 `px`。

3. **业务页面与组件优先使用 Tailwind**
   在 TSX 里用工具类完成布局与样式；需要与设计对齐时，优先使用已在 `tailwind.config.ts` 中**映射到语义 CSS 变量 / design token** 的类名，而不是裸写未映射的魔法值。

4. **语义化链路：Token → 语义 CSS 变量 → Tailwind（或极少数全局类）**
   - Primitives 与 Semantic 分层见 `_design-tokens.scss` 内注释；业务侧应倾向**语义层**变量。
   - `theme.scss` 等在全局作用域把排版、主题、区域覆写等组合为语义变量。
   - `tailwind.config.ts` 的 `theme.extend` 将常用语义接到 **Tailwind 类名**，形成「类名 ↔ `var(--…)` ↔ token」的固定映射。

**Tailwind：**

```typescript
// ✅ 语义 token
<div className="bg-brand text-on-brand rounded-card p-spacing-4" />

// ❌ 任意值（绕过 token）
<div className="bg-[#6366f1] text-[#ffffff] rounded-[12px] p-[16px]" />

// ❌ 硬编码
<div style={{ background: '#6366f1' }} />
```

**SCSS：**

```scss
// ✅ 语义变量
.card {
  background: $color-surface;
  color: $color-text-primary;
  border-radius: $radius-card;
  padding: $spacing-4;
}

// ❌ 硬编码值
.card {
  background: #f8f9fa;
  color: #333333;
  border-radius: 12px;
  padding: 16px;
}
```

**不硬编码：** 颜色用 token、间距用 scale 或 token、圆角/阴影/字号同理。没有对应 token 时暂停，和用户确认是扩展 token 还是走业务特例。

---

## 样式分层链路

```
项目 global-* reference（JieKou / Novita / PPIO，若命中）
        ↓ 覆盖 / 取代以下层的具体值
_design-tokens.scss（primitives / semantic / component 分区）
  ←——同级——→  tailwind.config.ts（语义变量 → 工具类：theme.extend 映射到 var(--…)）
        ↓
theme.scss（全局：语义组合、区域覆写） ← 品牌 reference 存在时降权，仅作补充覆写
        ↓
globals.scss（聚合 import、Tailwind @layer、全局工具类与基础规则） ← 兜底
        ↓
业务 TSX（优先 className + 已映射的 Tailwind；必要时任意值里仍用 var(--语义变量)）
```

### 各层职责

| 层                            | 职责                                                                                                           | 优先级   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| **项目 `global-*` reference** | JieKou / Novita / PPIO token 权威来源；token 值、语义类名、设计规范                                            | **最高** |
| **`_design-tokens.scss`**     | 原子与语义 CSS 变量；无品牌 reference 命中时为主要来源                                                         | 高       |
| **`tailwind.config.ts`**      | 将语义变量映射为 Tailwind 类名，业务侧通过类名消费 token                                                       | 高       |
| **`theme.scss`**              | 依赖 tokens；承载全局语义组合、分上下文的变量覆写；品牌 reference 存在时降权                                   | 兜底     |
| **`globals.scss`**            | 引入 token / theme / 图标等；Tailwind layers；项目级 `:root` 补充；全局排版等工具类；品牌 reference 存在时降权 | 兜底     |
| **`mixins.scss`**             | 断点、阴影、排版等可复用组合；供 SCSS 文件 `@include`；品牌 reference 存在时降权                               | 兜底     |

> 以上文件名为常见模式，以当前项目实际命名为准。

---

## 分层使用

### 业务 TSX — Tailwind 消费语义类名

```tsx
// ✅ 使用 tailwind.config 中已映射到语义变量的类名
<div className="bg-surface text-primary rounded-card shadow-card p-spacing-4">
  <h2 className="text-heading-md font-semibold">标题</h2>
</div>

// ❌ 绕过 token，裸写魔法值
<div className="bg-[#f8f9fa] text-[#333] rounded-[12px] p-[16px]">
```

### 业务 TSX — 无 Tailwind 映射时用 CSS 变量

```tsx
// 任意值里仍引用语义变量，不写裸值
<div className="border-[length:var(--border-width-thin)] bg-[var(--color-surface-elevated)]" />
```

### SCSS 组件 — mixin 消费

```scss
// 通过 mixin 消费 token 组合，不直接写 px / hex
.pricing-card {
  @include shadow-card;
  @include radius-card;
  padding: var(--spacing-6);
  background: var(--color-surface);
}
```

### 全局排版类 — 设计稿文本样式对齐

优先级（高 → 低）：**项目 `global-*` 语义类名** → **Tailwind 映射类 = design-token 语义变量**（同级）→ globals.scss / mixin 全局对齐类（兜底）

```tsx
// ✅ 优先：品牌 reference 或 Tailwind 映射到 design-token 的语义类名
<h1 className="text-heading-xl font-semibold">页面标题</h1>
<p className="text-body-md text-primary">正文内容</p>

// ⚠️ 兜底：仅当品牌 reference 和 Tailwind 均无对应映射时，才使用 globals.scss 中与 mixin 对齐的全局类
<h1 className="font-h1">页面标题</h1>
<p className="font-body">正文内容</p>
```

### 第三方组件 — 透传语义变量

```tsx
// 第三方组件无法用 Tailwind 时，通过 API 传入 var(--…)
<ThirdPartyChart
  style={{
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
  }}
/>
```

### 新增样式能力

```
需要一个新的样式值
  ↓
① 命中 JieKou / Novita / PPIO？ → 查对应 global-* / component-* 中是否已有 token / 类名，有则直接使用
② 属于 token 层？ → 加到 _design-tokens.scss，定义语义变量
③ 属于 theme 层？ → 加到 theme.scss，组合已有 token
④ 需要 Tailwind 类名？ → 加到 tailwind.config.ts 的 theme.extend，映射到语义变量
⑤ 业务消费
```

避免跳过分层直接在组件里写魔法数。

### 条件类名

`cn` / `clsx` 等工具，遵循项目已有写法。

---

## 维护注意

- 修改 `_design-tokens.scss` 或 `theme.scss` 影响面大；若有区域覆写，改动后需一并确认
- Tailwind 与 CSS 变量应对齐**同一语义**，避免同一含义两套命名
- 新增 Tailwind 键时，优先接到已有语义变量，而不是复制一份原始值

---

## Token 存在性约束

**禁止使用未在项目中声明的 Tailwind 自定义类或 CSS 变量。** 标准 Tailwind 内置类（`flex`、`p-4`、`text-sm` 等）不受限制；约束对象是项目自定义的语义类名和 CSS 变量。

### 规则

| 类型                | 禁止                                                                                   | 要求                                                                     |
| ------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 品牌 reference 类名 | 使用项目 reference 未定义的语义类名                                                    | 先查对应 `global-*` / `component-*`，确认类名存在                        |
| Tailwind 自定义类   | 使用 `tailwind.config` 未定义的类名（如 `bg-brand` 但 `brand` 未在 `theme.extend` 中） | 先在 `tailwind.config.ts theme.extend` 中声明，再使用                    |
| CSS 变量引用        | `var(--xxx)` 引用未在任何 token 文件中声明的变量                                       | 先在 `_design-tokens.scss` / `theme.scss` / `globals.css` 中声明，再引用 |

遇到没有对应 token 的设计值：**暂停，向用户确认是扩展 token 体系还是走业务特例**，不自行硬编码或使用不存在的类名。

**用户确认走业务特例（允许硬编码）时，必须同步告知：**

- 在本轮改动的 commit message 或 PR description 中列出该特例（硬编码值 + 使用位置），便于后续补 token 时定位

### 验证命令

**查找代码中使用的所有 CSS 变量引用：**

```bash
grep -roh "var(--[^)]*)" --include="*.tsx" --include="*.ts" --include="*.scss" src/ \
  | sed 's/.*var(\(--[^)]*\))/\1/' | sort -u
```

**查找所有已声明的 CSS 变量：**

```bash
grep -roh "^\s*--[^:]*" --include="*.scss" --include="*.css" src/ \
  | sed 's/^\s*//' | sort -u
```

将两份列表对比，出现在引用列表但不在声明列表中的变量即为**未声明的 CSS 变量**，需补声明或改用已有 token。

**查找项目 tailwind.config 中的自定义扩展键：**

```bash
# 直接读 tailwind.config.ts / tailwind.config.js 中的 theme.extend 内容
grep -A 200 "theme.extend" tailwind.config.ts 2>/dev/null || grep -A 200 "theme.extend" tailwind.config.js
```
