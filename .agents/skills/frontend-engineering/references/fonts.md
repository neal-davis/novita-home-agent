# 字体使用（代码分层，多项目）

本文档描述**常见 Next.js + SCSS/Tailwind 仓库**里字体如何接入与如何在代码里使用。
**不固定**某一品牌字体、文件名或 CSS 变量名；实施时以**当前仓库**的 `fonts` 注册与 `theme` 为准。

**不包含**：「设计稿数值 → 哪个 token」的对照表（放在各项目的 UI / 设计 skill）。

---

## 分层总览

| 层级 | 职责 | 常见位置（按项目调整） |
|------|------|------------------------|
| 1. 字体资源与 `next/font` 注册 | 本地/远程字体文件，通过 `variable` 注入 CSS 自定义属性 | `src/app/fonts.ts` 或 `src/fonts/*` |
| 2. 根节点挂载变量 | 让 `--font-…` 在整页可用 | 根 `layout.tsx` 的 `<html className={…}>` |
| 3. 字体栈与排版组合 | 正文 `font-family` 栈、标题/正文/mono 等组合变量 | `theme.scss` / `globals.css` 内 `html` 或 `:root` |
| 4. 原子 token（mixin） | 字号/行高/字重/字间距的设计 token 组合 | `_typography.scss` 或等价 mixin 文件 |
| 5. 全局工具 class | 可直接在 TSX 里用的 `.font-*` class | 全局样式文件中 `@include` 生成 |
| 6. Tailwind 映射（可选） | `fontFamily` 短名 + 自定义字号 | `tailwind.config` 的 `theme.extend` |
| 7. 图标字体（可选） | iconfont 的 `@font-face`，与正文栈分离 | 独立 CSS 文件或全局样式 |

---

## 识别流程

操作字体前，先确认项目现状：

1. **搜索字体文件** — 查找 `*.woff2`、`*.woff`、`*.ttf`、`*.otf`，确认存放目录
2. **搜索注册方式** — 查找 `next/font`、`localFont`、`@font-face` 关键字，确认引入模式
3. **搜索变量名** — 查找 `--font-` 前缀的 CSS 变量，确认项目的命名约定
4. **沿用已有模式** — 不引入新的字体加载方案

---

## 1. `next/font` 注册层

- 使用 `next/font/local` 或 `next/font/google` 声明字体。
- 通过 **`variable: "--font-xxx"`**（名称由项目约定）把实际族名交给 CSS 变量，避免在业务代码里写死 PostScript 名。
- 该文件只负责**字体源路径/字重**与 **variable 名称**，不写业务样式。

变量名示例（仅作模式参考，非强制）：`--font-sans`、`--font-mono`、`--font-display`；多项目并存时打开该仓库的注册文件即可确认。

## 2. 根布局挂载

- 从字体模块导入带 `.variable` 的导出，拼到根节点（通常是 `<html>`）的 `className` 上，使变量在全局生效。
- 若项目用多个 variable，一并挂上；顺序无强要求，以该仓库既有写法为准。

## 3. 主题 / 排版组合层

在全局样式中定义：

- **正文栈** — `--font-family`（或等价名）= `var(--font-<由 next/font 暴露>)` + 系统 fallback（`-apple-system`、`Segoe UI` 等）。
- **等宽场景** — `--mono-font-family` = `var(--font-mono)` + 等宽 fallback。
- **标题/展示场景** — 如有独立的 display 字体，同理组合。

`html { font-family: var(--font-family); }` 设定默认正文字体。

## 4. 原子 token（mixin / 变量）

将设计稿中的排版组合封装为 mixin 或 CSS 变量：

```scss
// 示例模式，具体名称和数值以项目 UI skill 为准
@mixin font-body {
  font-family: var(--font-family);
  font-size: var(--body-font-size);
  line-height: var(--body-line-height);
  font-weight: var(--body-font-weight);
}

@mixin font-h1 {
  font-family: var(--font-family);
  font-size: var(--h1-font-size);
  line-height: var(--h1-line-height);
  font-weight: var(--h1-font-weight);
}
```

组件 SCSS 中通过 `@include font-body;` 消费，不直接写 `font-size: 14px`。

## 5. 全局工具 class

```scss
// 由 mixin 生成，供 TSX 直接使用 className="font-body"
.font-body { @include font-body; }
.font-h1   { @include font-h1; }
.font-h2   { @include font-h2; }
// ...
```

## 6. Tailwind 映射（可选）

在 `theme.extend.fontFamily` 中为常用族起短名：

```javascript
// tailwind.config
fontFamily: {
  sans: 'var(--font-sans)',
  mono: 'var(--font-mono)',
}
```

未映射的字号/行高可用任意值 `text-[length:var(--body-font-size)]`，或继续用全局 `font-*` class。

## 7. 图标字体（可选）

- 若项目使用 iconfont：`@font-face` + 专用 `font-family`，与正文栈分离。
- 图标容器不要误用 `--font-family`。

---

## TSX / SCSS 中的用法

| 场景 | 推荐方式 |
|------|---------|
| 对齐设计稿整段文本样式 | 全局 `font-*` class 或等价设计系统 class |
| 只要等宽 | Tailwind `font-mono` 或 `font-family: var(--mono-font-family)` |
| 只要切换字体族 | `font-family: var(--font-<名称>)`，不写死 `font-family: "Inter"` |
| 需要非标准字号 | mixin / CSS 变量，不硬编码 `px` 值 |

---

## 行为规则

- 字体文件放项目已有的字体目录，没有时默认 `src/fonts/`
- 不把字体文件放到 `locales/` 或和多语言资源混合管理
- 不使用 `@import url()` 从 CDN 加载字体（阻塞渲染）
- 新增字体时只添加实际使用的字重，不全量引入
- 不在组件里写死 `font-family: "Inter"` 等 PostScript 名，通过 CSS 变量消费

---

## 刻意不包含

- 具体使用哪一款品牌字体、哪些 woff2 文件
- 像素、字重与 Figma 图层名的对照表
- 颜色、圆角等非字体 token 的完整语义表

以上由各项目的 **UI / 设计 skill** 或设计系统文档维护，避免双源更新。
