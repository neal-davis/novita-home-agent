# 本地化资源（i18n + 静态资源）

Agent 操作多语言或 public 静态资源前，先识别项目采用的资源管理方案。

---

## 方案识别

检查项目依赖和代码模式，判断属于哪种方案：

| 方案               | 识别特征                                                                                   | 对应规则                 |
| ------------------ | ------------------------------------------------------------------------------------------ | ------------------------ |
| **运行时翻译**     | 依赖 `react-i18next` / `next-intl` / `react-intl` 等；代码中有 `t()` / `useTranslations()` | 见下方「运行时方案」     |
| **构建前资源切换** | 无 i18n 运行时库；`locales/` 目录 + 构建脚本复制资源；代码直接 import JSON                 | 见下方「构建前切换方案」 |

> 不确定时，搜索 `package.json` 的依赖和代码中的 i18n 调用模式来判断。

---

## 运行时方案（react-i18next / next-intl 等）

**Agent 行为规则：**

### 文案修改

- 修改对应语言的翻译文件（如 `locales/en.json`、`messages/zh.json`）
- 所有语言版本同步更新对应 key
- 不在组件中硬编码文案字符串

### 新增文案

1. 在翻译文件中添加 key-value
2. 所有语言文件都要添加，避免 fallback 或空白
3. 代码中通过 `t('key')` / `useTranslations()` 引用，不直接写文案

### 注意事项

- 遵循项目已有的 namespace / scope 划分方式
- key 命名遵循项目已有的层级约定（如 `page.section.label`）
- 不修改 i18n 配置文件（如 `i18n.ts`、`next-intl.config.ts`），除非用户明确要求

---

## 构建前切换方案

项目不使用运行时翻译库，而是**构建前由脚本将对应语言的全部资源复制到工作目录**，涵盖字典文案、public 静态资源（图片/图标等）和环境变量。

### 资源映射

启动/构建前，脚本根据语言参数复制资源：

```
locales/<lang>/dictionaries/**  →  src/dictionaries/**    （文案字典）
locales/<lang>/public/**        →  public/**               （图片/图标等静态资源）
locales/<lang>/.env             →  .env                    （环境变量）
```

**核心规则：`src/dictionaries/` 和 `public/` 是构建产物，不是源文件。** 修改必须在 `locales/<lang>/` 下进行。

### 文案使用

直接 import JSON 字典文件：

```typescript
import dict from '@/dictionaries/common.json'

<span>{dict.button.confirm}</span>
```

不使用翻译函数（`t()`），不使用 key 字符串查找，直接引用 JSON 属性。

### Agent 行为规则

**文案修改：**

- 改 `locales/<lang>/dictionaries/` 下的源文件
- **不改 `src/dictionaries/`** — 生成目录，会被脚本覆盖
- 所有语言版本同步更新对应 key

**新增文案：**

1. 在 `locales/<lang>/dictionaries/` 对应 JSON 文件中添加 key
2. 所有语言目录都要添加
3. 代码中通过 `@/dictionaries/` 引用

**静态资源修改（图片/图标等）：**

- 改 `locales/<lang>/public/` 下的源文件
- **不改 `public/`** — 构建产物，会被脚本覆盖
- 需要多语言差异的资源（如含文字的图片），每个语言目录放对应版本
- 无多语言差异的资源（如通用图标），所有语言目录保持一致

**禁区：**

- 不修改 `scripts/` 下的构建/资源复制脚本
- 不修改 `src/dictionaries/` 下的文件
- 不修改 `public/` 下由 `locales/` 拷贝过来的文件
- 不引入运行时 i18n 库

---

## 常见坑

| 现象               | 可能原因                                            |
| ------------------ | --------------------------------------------------- |
| UI 文案为空        | 翻译 key 缺失或拼写错误                             |
| 改了文案没生效     | 改了 `src/dictionaries/` 而非 `locales/` 源文件     |
| 改了图片没生效     | 改了 `public/` 而非 `locales/<lang>/public/` 源文件 |
| 切换语言后资源缺失 | 部分语言目录未同步更新                              |
