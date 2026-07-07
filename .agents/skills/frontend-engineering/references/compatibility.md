# 前端兼容性

## 触发条件

在以下情形先通读本文档再改代码：新增或升级 npm 包、引入只发布 ESM 的包、使用浏览器 API（`localStorage` / `IntersectionObserver` 等）、调整 browserslist 目标范围、跨运行时复用逻辑（SSR / Edge / Worker）、样式在特定浏览器异常、遇到 `require is not defined` / `exports is not a constructor` 等模块格式报错。

---

## 依赖兼容

### 触发

新增 / 升级 npm 包；安装时出现 peer dependency 警告；运行时报版本冲突；monorepo 中多包依赖同一库但版本不同。

### 预防规则

**安装前：**

1. 核查 peer dependencies：
   ```bash
   npm info <pkg> peerDependencies
   ```
2. 升大版本（major）前查 CHANGELOG Breaking Changes，重点关注与 React / Next.js / TypeScript 的版本约束
3. monorepo 中同一包应统一版本；若无法统一，用 `resolutions`（Yarn）或 `overrides`（npm/pnpm）强制指定

**安装后：**

- 确认 `package.json` 中 `dependencies` / `devDependencies` 归属正确（运行时用前者，构建工具用后者）
- 新引入的包若只在服务端使用，不得出现在客户端 bundle（检查 `'use client'` 边界）

### 排查命令

```bash
# 查看某包的所有实例及版本（检查重复）
npm ls <pkg>

# 查孤立依赖（已安装但未被引用）
npx depcheck

# 检查 peer dependency 冲突
npm install --dry-run 2>&1 | grep "peer dep"
```

---

## Browser API 兼容

### 触发

使用 `localStorage` / `sessionStorage` / `window` / `document` / `navigator` / `IntersectionObserver` / `ResizeObserver` / `Clipboard API` / `crypto` 等；在 Next.js（SSR）或 Edge Runtime 中访问全局对象。

### 预防规则

**SSR / 服务端环境守卫：**

```tsx
// ✅ useEffect 内访问（纯客户端生命周期）
useEffect(() => {
  const value = localStorage.getItem('key')
}, [])

// ✅ typeof 守卫（模块级或工具函数中）
const isClient = typeof window !== 'undefined'

// ❌ 模块顶层裸访问（SSR 阶段报 ReferenceError）
const value = localStorage.getItem('key')
```

**Polyfill 策略：**

- 使用前先查 [caniuse.com](https://caniuse.com) 确认目标 browserslist 是否覆盖
- 需要 polyfill 时优先使用 `core-js`（Babel 可自动按需注入）或框架内置支持（Next.js 已内置常见 polyfill）
- 不要手写功能检测再自实现 polyfill，除非包体积有严格限制

**Edge Runtime 限制：**

Edge Runtime 不支持 Node.js built-ins（`fs`、`path`、`crypto` 模块版本）；`next.config` 中标记 `runtime: 'edge'` 的路由须单独验证依赖。

### 排查命令

```bash
# 查找模块顶层 / 非 useEffect 内的裸浏览器 API 访问
grep -rn "window\.\|document\.\|localStorage\|sessionStorage\|navigator\." src/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "typeof window" \
  | grep -v "useEffect"

# 查看当前 browserslist 目标
npx browserslist
```

---

## 逻辑兼容

### 触发

同一业务函数在客户端、服务端、Worker、Edge Runtime 中复用；引入新执行环境（如从 Node.js 迁移到 Edge）；时区 / 日期计算在不同环境结果不一致。

### 预防规则

**环境无关纯函数：**

- 工具函数不依赖运行时全局（`window`、`process`、`__dirname`）；环境差异通过参数注入，不在函数体内直接读取
- 确需区分环境时，在调用侧判断后传值，而不是在函数内部 `if (typeof window !== 'undefined')`

```ts
// ✅ 参数注入，函数本身与环境无关
function formatUrl(base: string, path: string) {
  return `${base}${path}`
}

// ❌ 函数内部读取环境变量（服务端 / 客户端行为可能不同）
function formatUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`
}
```

**日期 / 时区：**

- 后端存储和传输统一使用 UTC（ISO 8601 字符串）
- 前端显示时转换为用户本地时区；使用 `Intl.DateTimeFormat` 或 `date-fns-tz`，避免手算时区偏移
- 服务端渲染日期时须注意：服务器时区可能与用户不同，日期格式化应在客户端完成或明确传入时区参数

### 排查命令

```bash
# 查找函数内直接读取 process.env（服务端/客户端均执行的文件中）
grep -rn "process\.env\." src/ --include="*.ts" --include="*.tsx" \
  | grep -v "next.config\|env.ts\|constants"
```

---

## 样式兼容

### 触发

使用实验性 / 较新 CSS 属性（`aspect-ratio`、`gap` on flex、`container queries`、`@layer` 等）；CSS 变量需要降级兜底；样式在 Safari / iOS / 旧 Chrome 中异常。

### 预防规则

**Autoprefixer：**

- 确认 `postcss.config.js` 已引入 `autoprefixer`；已配置时不需要手写 `-webkit-` 前缀
- Tailwind CSS 内置 PostCSS，默认会处理常见前缀；Vite / Next.js 项目均默认集成

**CSS 变量降级：**

```css
/* ✅ 提供静态 fallback，让不支持 CSS 变量的浏览器也能渲染 */
.button {
  background: #6366f1;
  background: var(--color-brand);
}

/* ❌ 只写 var()，旧浏览器直接丢失样式 */
.button {
  background: var(--color-brand);
}
```

**常见兼容问题速查：**

| 属性 | 风险 | 处理 |
|------|------|------|
| `gap` on flex | Safari < 14.1 不支持 | 用 `margin` 间距或升级目标版本 |
| `aspect-ratio` | Safari < 15 不支持 | padding-hack 兜底或确认目标版本 |
| `position: sticky` | iOS Safari 需加 `-webkit-sticky` | Autoprefixer 处理；确认 postcss 已配置 |
| `@container` | 仅较新浏览器支持 | 先查 caniuse，未覆盖时回退媒体查询 |
| `clamp()` | IE 完全不支持 | 若无 IE 目标可直接用 |
| `color-mix()` | Safari 16.2+ | 先查 browserslist 覆盖范围 |

**使用新 CSS 属性前：** 先运行 `npx browserslist` 确认目标范围，再去 [caniuse.com](https://caniuse.com) 核查支持情况。

### 排查命令

```bash
# 查找未经 Autoprefixer 处理的手写前缀（通常是遗留代码）
grep -rn "\-webkit\-\|\-moz\-\|\-ms\-" src/ --include="*.scss" --include="*.css"

# 确认 postcss 配置是否引入 autoprefixer
cat postcss.config.js 2>/dev/null || cat postcss.config.mjs 2>/dev/null || cat postcss.config.ts 2>/dev/null
```

---

## browserslist 配置

### 配置来源

项目目标环境的唯一来源，按以下位置查找（优先级从高到低）：

1. `package.json` 中的 `"browserslist"` 字段
2. 项目根目录的 `.browserslistrc` 文件

**构建工具联动：** Babel（`@babel/preset-env`）、PostCSS（Autoprefixer）、Vite、Next.js 均读取此配置，修改后自动影响 polyfill 注入、CSS 前缀和语法降级。

### 修改前确认

| 操作 | 影响 |
|------|------|
| 收窄目标（移除旧浏览器） | 减少 polyfill，缩小 bundle；需确认已下线旧版本支持 |
| 扩大目标（加入旧浏览器） | 增加 polyfill，增大 bundle；需与产品 / 运营确认 |
| 修改 `last N versions` 中的 N | 隐式影响覆盖范围，不如显式版本号稳定 |

### 常用配置示例

```
# 现代 Web 应用（不支持 IE）
> 0.5%
last 2 versions
Firefox ESR
not dead
not IE 11

# 保守目标（含较旧 iOS Safari）
> 1%
last 3 versions
iOS >= 12
not dead
```

### 验证命令

```bash
# 查看当前配置覆盖的具体浏览器列表
npx browserslist

# 查看某浏览器版本是否在覆盖范围内
npx browserslist "last 2 Chrome versions"
```

---

## ESM / CJS 兼容

### 触发

引入只发布 ESM 的包（`"type": "module"` 或仅有 `.mjs` 入口）到 CJS 工程；`require()` 调用报 `ERR_REQUIRE_ESM`；`import()` 在 CJS 文件中报错；`__dirname` / `__filename` 在 ESM 文件中不可用；Next.js 编译报 `SyntaxError: Cannot use import statement`。

### 预防规则

**引入新包前检查模块格式：**

```bash
# 查看包的 exports 字段，确认是否同时提供 ESM 和 CJS
npm info <pkg> exports
cat node_modules/<pkg>/package.json | grep -A 20 '"exports"'
```

需要同时提供以下条件才算"双格式兼容"：

```json
{
  "exports": {
    "import": "./dist/index.mjs",
    "require": "./dist/index.cjs"
  }
}
```

**Next.js 中引入纯 ESM 包：**

```js
// next.config.js
module.exports = {
  transpilePackages: ['<纯esm包名>'],
}
```

**避免混用语法：**

```ts
// ❌ 同一文件中混用 require 和 import
const fs = require('fs')
import path from 'path'

// ✅ 统一使用 import（TypeScript / ESM 项目）
import fs from 'fs'
import path from 'path'
```

**ESM 文件中替代 `__dirname`：**

```ts
// ✅ ESM 中获取当前文件路径
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

**发布自己的包时：**

- 在 `package.json` 中同时声明 `main`（CJS）和 `module`（ESM）入口，或使用 `exports` 条件导出
- 构建产物同时输出 `.cjs` 和 `.mjs`（tsup / rollup 均支持）

### 排查命令

```bash
# 查找项目中混用 require 和 import 的文件
grep -rln "require(" src/ --include="*.ts" --include="*.tsx" \
  | xargs grep -l "^import "

# 查找包是否为纯 ESM（有 "type": "module" 字段）
cat node_modules/<pkg>/package.json | grep '"type"'

# 查看 Next.js 编译错误中涉及的包名
# 通常报错格式：Cannot use import statement in module at <path>/node_modules/<pkg>
```

---

## 自检

- [ ] **新增依赖** — peer dependencies 无警告；大版本升级已查 Breaking Changes；monorepo 版本已统一
- [ ] **浏览器 API** — 所有 `window` / `document` / `localStorage` 访问在 `useEffect` 内或有 `typeof` 守卫；SSR 路径无裸调用
- [ ] **逻辑复用** — 跨环境工具函数不依赖运行时全局；日期/时区使用 UTC 存储、客户端格式化
- [ ] **样式** — 新增 CSS 属性已查 caniuse；`postcss.config` 已引入 autoprefixer；CSS 变量有静态 fallback
- [ ] **browserslist** — 修改目标范围前已确认 bundle 和 polyfill 影响；用 `npx browserslist` 验证实际覆盖
- [ ] **ESM/CJS** — 新包 `exports` 字段已核查；纯 ESM 包已加入 `transpilePackages`；无 `require` / `import` 混用
