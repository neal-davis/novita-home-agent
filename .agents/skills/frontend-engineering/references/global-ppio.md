---
name: ppinfra-tailwind-tokens
description: >
  ppinfra-home 的 Tailwind CSS 与 design-token 编码规范；唯一权威映射见 tailwind.config.ts。
  在编写或审查 className、新增/修改样式、SCSS 与 Tailwind 混用、对接 shadcn/ui、Tremor、
  Radix Accordion、Headless UI、响应式与暗色类、Safelist 动态色、或需避免「Tailwind 默认调色盘」
  假设时触发。变量分散在 src/styles/_design-tokens.scss、src/styles/theme.scss、src/app/globals.scss。
  红线：凡本应映射 token 的样式，Tailwind 任意值 [px]/[rem]、内联 style 与 SCSS 中裸露 px/rem — 校验不通过，见 §6。
---

# ppinfra Tailwind & Design Tokens

组件级类名与表面色惯例：**[`component-ppio.md`](./component-ppio.md)**（索引）；细则见 **[`component-ppio/`](./component-ppio/)** 下同名全小写 `.md`。

完整 token 明细表见 [`ppio-design-tokens.md`](./ppio-design-tokens.md)。写样式前先识别 token 类别（颜色、字体、间距、圆角、阴影、高度），再使用本文件或 token 明细中的语义类名。

## 0. ppinfra 硬原则

1. **不改全局 token**：不要随手修改 `tailwind.config.*`、`globals.css/scss`、`_design-tokens.scss` 或 spec data；确需扩展 token 时单独说明影响面。
2. **绑定已有值**：优先使用语义 Tailwind 类和 `var(--*)`，不要近似替代。
3. **特殊值要标注**：确有一次性尺寸或布局值时，在代码附近写明 `special: reason`，否则视为魔法值。

```tsx
// 正确
className = "text-neutral-500 bg-fill-4 gap-medium rounded-small";
className = "text-[var(--text-1)] bg-[var(--fill-4)]";

// 禁止
className = "text-[#1a1a1a] text-sm font-medium p-4 rounded-lg";
```

## 1. 架构与权威来源

**加载顺序**（`src/app/globals.scss`，后者覆盖同名变量）：

1. `design-tokens` → **`_design-tokens.scss`**（`:root` primitive、语义别名、`@layer components` 如 `.font-h1`）
2. **`theme.scss`**（`html` 上：`--space-*`、**另一套** `--radius-sm/md/lg`、`--z-*`、遗留色）
3. `@tailwind base/components/utilities`

**排查**：`theme.scss` 里 `html { --space-* }` 会覆盖 `_design-tokens.scss` 的 primitive `--space-*`；以 DevTools **computed** 为准。

**Tailwind**：`theme.colors` **整体替换**；`extend.colors` merge `tailwindcss/colors`（slate、gray…）+ **`tremor` / `dark-tremor`**。项目 **`neutral` / `gray` / `red`** 与 extend 同名 palette 合并——**以 `tailwind.config.ts` 为准**。

| 文件                  | 职责                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `tailwind.config.ts`  | content、darkMode、theme、extend、safelist、plugins                                                 |
| `_design-tokens.scss` | 色 primitive、`--font-*`、spacing/radius/height 别名、复合排版类                                    |
| `theme.scss`          | z-index 数值、space、radius（sm/md/lg 命名）、业务变量                                              |
| `globals.scss`        | 引入顺序、shadcn 变量（`--background`、`--radius`、`--chart-*` 等）、`--radius-button`、`--mask-bg` |

## 2. `content` 与 Purge

Glob：`./src/pages/**`、`./src/components/**`、`./src/app/**`、`./node_modules/@tremor/**` — 扩展名 `js,ts,jsx,tsx,mdx`。新目录未匹配须加进 **`content`**。

## 3. 深色模式

`darkMode: ["class"]` → 祖先 **`dark`**（常 `<html class="dark">`）。用 **`dark:bg-*`** 等。shadcn 语义变量若在 globals/主题对 `.dark` 有定义则随类切换，否则 **`dark:`** 手写。

## 4. 颜色（摘要）

- **透明**：`transparent`、`current` → `currentColor`。
- **支持 `/opacity`**（config 内 rgb 通道形式）：`brand-0`、`neutral-50/500`、`red-50`、`white`、`black`。
- **`brand`**：`brand-0`（`--blue-500-rgb` + opacity）；`brand-1`…`5` → `--brand-1`…`5`。
- **`neutral`**：项目自定义 **仅 50–500**（50、500 可 `/opacity`）；更长灰阶用 **extend 的 `gray` / `zinc` / `slate`**（§10）或现有 `neutral-*`。
- **`fill.1`…`5`** → `bg-fill-*` 等（`--fill-3` 常卡片/muted）。
- **`success` / `warning` / `error`**：各 50–400，映射 `--green-*` / `--orange-*` / `--red-*`。
- **`red` / `gray`**：`red-50` 可 opacity；`gray` 50–400 查 token。
- **`mask`**：`bg-mask`（`--mask-bg`）、`bg-mask-light`、`bg-mask-dark`。

**Shadcn 映射（与文档 utility 对齐）**：`bg-background` / `text-foreground`；`card`、`popover`、`primary.*`、`secondary.*`、`destructive.*`、`muted.*`、`accent.*`；边框 `border-border`、`border-border-1`…`border-border-4`（例 **`border-border-2`**）；`border-input`、`border-input-hover`；`ring-ring`、`ring-ring-dark`、`ring-ring-primary`；`chart.*`、`calendar.*`、`common-dark.*`、`common-gray.*`、`shiki.*` — 细节查 config。

## 5. 排版

- **`text-xs`…`text-7xl`** → `--font-12`…`--font-56` 与对应 `--font-height-*`。移动端 `_design-tokens.scss` 在 `max-width: 768px` 覆盖较大字号。
- **字重**：`font-light`…`font-bold` → `--font-light`…`--font-bold`；未映射的 `font-thin` 等不可用默认可用值，需 arbitrary 或 SCSS。
- **字距**：`tracking-tighter` / `normal` / `wide` / `wider` → token；无 `tracking-tight`/`widest` 自定义时慎用 arbitrary。
- **Tremor**：`text-tremor-label|default|title|metric`（见 extend.fontSize）。
- **复合类**：`.font-h1`…`.font-h6`、`.font-body-regular` 等 — 勿与重复 `text-*`+`font-*` 叠床架屋。

## 6. 魔法数字（px / rem）— **不通过**

本应走 **本文 §4–§12**、`component-ppio.md`（及 **`component-ppio/*.md`**）或 **`var(--*)`** 的样式，若出现 **裸露 px/rem**（含等价魔法数），**评审不通过**：

| 类型               | 不合规                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Tailwind 任意值 | `[`…`]` 内明文 `px`/`rem`/`em`：`p-[4px]`、`w-[120px]`、`rounded-[6px]`、`text-[13px]`、`border-[1px]`、`z-[999]`（新代码应用 §9 语义 z）等；`calc()` 内可 token 化的裸长度同理 |
| B. 内联 `style`    | 字面 `px`/`rem`/像素数字 — 改为 **`var(--*)`** 或语义 class                                                                                                                     |
| C. SCSS/CSS        | `padding: 16px` 等 — 改为 **`var(--space-*)`** 等或 `@apply`                                                                                                                    |

**合规路径**：间距 §7；排版 §5；色 §4；圆角·阴影·控件高度 §8；z-index §9；勿 **`bg-[#hex]`** 逃语义色。`calc()` 以 **`var(--*)`** 为主；例外须 PR 说明 + 设计依据。

**组件级补充**：`component-ppio.md` 中「实施检查清单」一节。

## 7. 间距

**语义**：`tiny`(2) `minismall`(4) `small`(8) `regular`(12) `medium`(16) `large`(24) `xlarge`(48) `2xlarge`(80) `3xlarge`(120) — 单位见 config 注释，类如 `p-tiny`、`gap-medium`。

**`space-1`…`space-20`** → `p-space-*` 等；**computed `--space-*`** 以 **theme.scss `html` 覆盖**为准（§1）。

默认数字刻度 **`p-4`、`gap-2`** 等可能在旧代码中存在；**新代码不要继续使用**。新代码优先 `p-medium`、`gap-regular`、`px-regular`，或 `var(--space-*)`。迁移旧代码时发现裸数字 spacing，要按 token 语义替换。

## 8. 圆角 · 阴影 · 高度

**圆角**：`rounded-none|minismall|small|regular|medium|large|round|button|input`（button/input 绑 `--radius-button` / `--radius-input`）；另保留 **`rounded-lg`** 等默认合并键。

**阴影**：

- 产品 elevation：**`shadow-1`…`shadow-5`**、`shadow-drop`、`shadow-home`、`shadow-module`\*\*（定义在 `_design-tokens.scss`）。
- **`shadow-sm/md/lg`** 绑定 **`globals` 的 `--radius`** 相关（扩散半径），**不是**常规三层阴影 — **勿当 Material elevation**。
- **`shadow-radius-*`**：联合 `theme.scss` 里 `--radius-sm/md/...`（与 `--radius-small` 命名体系并存），用前对设计稿。

**高度**（控件）：`h-supersmall`(20) `h-minismall`(24) `h-small`(28) `h-medium`(32) `h-large`(36) `h-xlarge`(40) `h-superlarge`(44)。

## 9. z-index（theme.scss）

| Class                  | 用途            | 值         |
| ---------------------- | --------------- | ---------- |
| `z-dropdown`…`z-toast` | 下拉→通知       | 100→800    |
| `z-header` / `z-top`   | 顶栏 / 最高常规 | 900 / 999  |
| `z-999` / `z-1000`     | 兼容            | 999 / 1000 |

新浮层先全局搜索，勿压 `z-modal` / toast。

## 10. 断点 · Tremor 色阶 · 其它

**断点**：`xs` **390**（默认 TW 无）、`sm` 640、`md` 768、`lg` 1024、`xl` **1310**、`xxl` 1500、`xxxl` 1800。

**extend 完整 palette**（图表/Tremor/动态类）：`slate` `zinc` `stone` `orange` `amber` `yellow` `lime` `emerald` `teal` `cyan` `sky` `blue` `indigo` `violet` `purple` `fuchsia` `pink` `rose`。未列 family（如 **`green-*`**）— **以 config 为准**；safelist 含 `green` 不代表 theme 必有完整阶梯。

**`tremor` / `dark-tremor`**：如 `bg-tremor-brand`、`text-tremor-content-emphasis` — 子键见 config。

**背景渐变**：`bg-gradient-radial`、`bg-gradient-conic` + `from-*` `to-*`。

**动画**（`tailwindcss-animate`）：`animate-typing-dot-bounce`、`animate-accordion-down/up`（Radix 高度变量）。

**插件**：`@headlessui/tailwindcss`（`ui-*` 变体）、`tailwindcss-animate`。

## 11. Safelist

正则保留 **`bg|text|border|ring|stroke|fill-{palette}-{50–950}`**，palette：`slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose`。前三个 pattern 另含 **`hover:`、`ui-selected:`**。

**注意**：自定义 **`neutral` 短阶梯**；safelist 的 `neutral-600` 等若 theme 未定义 — **以构建产物为准**；主 UI 优先 §4 语义色 + §10 明确 palette。

## 12. SCSS / `@apply`

`.module.scss` 用 **`var(--*)`** 与 TW 同源；**禁止**裸 px/rem（§6）。`@apply` 须走 PostCSS/Tailwind 管道，避免循环依赖。

## 13. 反模式速查

1. 假设默认完整 **`green-*`** 等 — 先查 **extend.colors**。
2. **`shadow-sm/md/lg`** 当 elevation — 用 **`shadow-1`…`shadow-module`**。
3. **hex / `bg-[#]` / 任意色** 替代语义 token。
4. **`z-[99999]`** — 用 §9。
5. **content 漏目录** — 线上缺类。
6. **混淆自定义 `neutral` 与默认灰阶** — 以 config 为准。
7. **忽略 theme.scss 对 `--space-*` 的覆盖**。
8. **任意值 / 内联 / SCSS 裸长度** — §6。

---

## 14. 业务域识别

生成或修改 ppinfra 控制台页面前，先根据需求识别业务域。识别到业务域后，把状态机、数据精度、必需产品逻辑和常见坑带入后续实现与自检。

| Domain          | Keywords                                                           | 关注点                                                 |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| GPU Cloud       | GPU, instance, compute, image, storage, template, task, credential | 实例/任务状态流、规格与资源数据精度、镜像/凭证操作规则 |
| Agent Sandbox   | sandbox, template, usage, quota                                    | sandbox 状态、模板流转、用量与配额                     |
| Model Service   | model, inference, text generation, monitoring, quota               | 推理状态、监控数据、配额逻辑                           |
| Billing         | billing, invoice, top-up, budget, resource pack, balance           | 金额精度、发票/充值/预算状态、余额展示                 |
| System Settings | account, API Key, secret, audit, team, verification, invite        | 权限、密钥脱敏、审计、团队邀请与认证状态               |
| Campaigns       | campaign, promotion, invite, reward, referral                      | 活动状态、奖励规则、邀请链路                           |

无法判断业务域时问用户一次；跨域或纯通用 UI 请求可跳过业务域加载。

## 15. Console Header Logo

ppinfra console 页面 header 必须保留官方 PPIO logo。缺失 logo、替换成文本、占位图或改错尺寸都按阻断问题处理。

```html
<img
  src="https://www.ppinfra.com/logo/logo.svg"
  alt="logo"
  style="width:136px;height:32px"
/>
```

生成或修改 console shell/header 后，检查该 logo 的 `src`、`alt`、宽高是否仍符合项目约定。
