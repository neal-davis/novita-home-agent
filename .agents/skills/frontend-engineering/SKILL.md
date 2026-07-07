---
name: frontend-engineering
description: >
  用于开发、生成、构建、修改或审查前端代码（Next.js + React + Tailwind CSS）。
  涵盖组件开发、页面构建、功能实现、样式调整、原型验证、API 集成、还原 Figma 设计、功能迁移、代码审查与修复。

  TRIGGER when：用户要求新建页面、组件、功能模块；修改现有 UI 或交互逻辑；调整样式（颜色/间距/布局）；
  还原 Figma 设计稿；对接 API / 替换 mock 数据；做原型验证或演示；review 前端代码；
  修复前端 bug；文件路径含 .tsx/.jsx/.css/tailwind.config / next.config；
  用户说"页面"、"组件"、"样式"、"按钮"、"表单"、"布局"、"设计稿"等词语时。

  DO NOT TRIGGER when：任务纯粹是后端逻辑（API 路由实现、数据库操作、服务端脚本）；
  修改 CI/CD 配置、Docker 文件、环境变量；只修改测试文件而不涉及组件本身；
  只写纯类型定义文件（无 UI）；只更新 README / 文档；与前端文件无关的通用编程任务。
---

# Frontend Engineering

Agent 已掌握前端各语言和框架的最佳实践。本 skill 不重复这些知识，而是补充：

- **项目级约定** — 代码分层、文件组织、命名规范等团队规则
- **安全护栏** — 防止 Agent 生成过程中破坏现有代码或引入风险
- **质量检查** — 生成后的结构化自检清单

## 文件导航

> **本文件是决策地图**：识别意图 → 加载 references → 进入 workflow 执行。

| 文件                                          | 作用                                    | 何时读               |
| --------------------------------------------- | --------------------------------------- | -------------------- |
| **SKILL.md（本文件）**                        | 意图识别、references 加载决策、核心原则 | 收到任务后第一步     |
| **[`workflow.md`](./references/workflow.md)** | 各意图的执行步骤与检查点                | 确定意图后立即进入   |
| **其他 references**                           | 领域专项规范（样式、组件、安全…）       | 按意图和场景按需加载 |

> **不重复执行原则：** 同一 session 中已按某 reference 执行过检查的，后续直接沿用结论，不重复加载。

---

## 意图识别 → References 加载

收到任务，先判断用户的**核心意图**，再决定加载哪些 references，然后进入 [`workflow.md`](./references/workflow.md) 执行。

---

## 项目识别 → 品牌 References

涉及 UI、样式、组件、Figma 还原、审查或验证时，先根据当前工作区路径、仓库名或上层目录识别项目。命中后，项目 reference 优先于通用 [`styling-system.md`](./references/styling-system.md) 中的具体 token 假设。

| 项目           | 识别条件                                                       | 全局样式 reference                                  | 组件 reference                                            |
| -------------- | -------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| JieKou         | 路径 / 仓库 / 上层目录包含 `jiekou`（不区分大小写）            | [`global-jiekou.md`](./references/global-jiekou.md) | [`component-jiekou.md`](./references/component-jiekou.md) |
| Novita         | 路径 / 仓库 / 上层目录包含 `novita`（不区分大小写）            | [`global-novita.md`](./references/global-novita.md) | [`component-novita.md`](./references/component-novita.md) |
| PPIO / ppinfra | 路径 / 仓库 / 上层目录包含 `ppinfra` 或 `ppio`（不区分大小写） | [`global-ppio.md`](./references/global-ppio.md)     | [`component-ppio.md`](./references/component-ppio.md)     |

加载规则：

- 写或审查 `className`、SCSS、Tailwind、字体、颜色、间距、圆角、阴影、z-index 时加载对应 `global-*`。
- 修改 `src/components/ui`、表单控件、对话框、浮层、表格、按钮、日期组件或项目封装时加载对应 `component-*`。
- 如果路径同时命中多个项目，以最具体的业务仓库名或当前文件所在路径为准；不要混用三套 token。
- 本 skill 已吸收三套 UI skill 的必要规则；不要再静默执行源仓库中的同步、搜索或自检脚本，除非用户明确要求。

---

### 意图：新建（Create）

**信号：** "新建页面 / 组件 / 功能"、"实现 X"、"从头做 Y"、还原 Figma 设计稿、新建功能模块、多文件联动

| 类型 | 文件                                                              | 场景                                                                                                                                                                                                                             |
| ---- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 必须 | [`agent-safety.md`](./references/agent-safety.md)                 | 影响分析、作用域边界、风险等级判断                                                                                                                                                                                               |
| 必须 | [`code-layering.md`](./references/code-layering.md)               | 新建文件归位、目录位置、命名                                                                                                                                                                                                     |
| 必须 | [`component-patterns.md`](./references/component-patterns.md)     | Props 设计、状态管理、拆分决策                                                                                                                                                                                                   |
| 必须 | [`styling-system.md`](./references/styling-system.md)             | 任何样式（颜色/间距/圆角/阴影/布局）；还原 Figma 值 → token 映射；新增或扩展 token 体系                                                                                                                                          |
| 按需 | [`global-jiekou.md`](./references/global-jiekou.md)               | **仅当**当前工作区路径、仓库名或上层文件夹名 **包含 `jiekou`**（不区分大小写）时加载：`tailwind.config`、design-token 全量映射与样式加载顺序；编写或审查 `className`、SCSS 与 Tailwind 对账；否则不要使用本 reference            |
| 按需 | [`component-jiekou.md`](./references/component-jiekou.md)         | **同上条件**（路径/仓库/文件夹含 `jiekou`）才加载：修改 `src/components/ui`、对话框/浮层、表单控件表面色与 z-index、shadcn 封装惯例；否则不要使用本 reference                                                                    |
| 按需 | [`global-novita.md`](./references/global-novita.md)               | **仅当**当前工作区路径、仓库名或上层文件夹名 **包含 `novita`**（不区分大小写）时加载：`tailwind.config`、design-token 全量映射与样式加载顺序；编写或审查 `className`、SCSS 与 Tailwind 对账；否则不要使用本 reference            |
| 按需 | [`component-novita.md`](./references/component-novita.md)         | **同上条件**（路径/仓库/文件夹含 `novita`）才加载：修改 `src/components/ui`、对话框/浮层、表单控件表面色与 z-index、shadcn 封装惯例；否则不要使用本 reference                                                                    |
| 按需 | [`global-ppio.md`](./references/global-ppio.md)                   | **仅当**当前工作区路径、仓库名或上层文件夹名 **包含 `ppinfra` 或 `ppio`**（不区分大小写）时加载：`tailwind.config`、design-token 全量映射与样式加载顺序；编写或审查 `className`、SCSS 与 Tailwind 对账；否则不要使用本 reference |
| 按需 | [`component-ppio.md`](./references/component-ppio.md)             | **同上条件**（路径/仓库/文件夹含 `ppinfra` 或 `ppio`）才加载：修改 `src/components/ui`、对话框/浮层、表单控件表面色与 z-index、shadcn 封装惯例；否则不要使用本 reference                                                         |
| 按需 | [`figma.md`](./references/figma.md)                               | 有设计稿时：结构拆解、token 映射、视觉走查                                                                                                                                                                                       |
| 按需 | [`rsc-and-directives.md`](./references/rsc-and-directives.md)     | 涉及 Server/Client 边界划分                                                                                                                                                                                                      |
| 按需 | [`api-layer.md`](./references/api-layer.md)                       | 新建 API 接口、数据层封装                                                                                                                                                                                                        |
| 按需 | [`state-management.md`](./references/state-management.md)         | 新增全局 store / Context、异步数据流、SSR 注水                                                                                                                                                                                   |
| 按需 | [`accessibility.md`](./references/accessibility.md)               | 新建交互组件、有 a11y 要求                                                                                                                                                                                                       |
| 按需 | [`compatibility.md`](./references/compatibility.md)               | 新增/升级依赖、使用浏览器 API、引入纯 ESM 包                                                                                                                                                                                     |
| 按需 | [`fonts.md`](./references/fonts.md)                               | 引入/修改/使用字体                                                                                                                                                                                                               |
| 按需 | [`design-principles.md`](./references/design-principles.md)       | 抽象组件、封装 hooks、设计公共接口                                                                                                                                                                                               |
| 按需 | [`performance.md`](./references/performance.md)                   | 列表渲染、大数据处理、懒加载、memo 优化                                                                                                                                                                                          |
| 按需 | [`change-scope-control.md`](./references/change-scope-control.md) | 改动同时跨越配置/依赖/业务边界                                                                                                                                                                                                   |
| 按需 | [`localized-resources.md`](./references/localized-resources.md)   | 新增文案/字典、处理静态资源路径                                                                                                                                                                                                  |

---

### 意图：修改（Modify）

**信号：** "把 X 改成 Y"、"调整样式"、"更新文案"、"替换 mock"、"修复 bug"、单文件/小范围变更

| 类型 | 文件                                                              | 场景                                                                   |
| ---- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 必须 | [`agent-safety.md`](./references/agent-safety.md)                 | 改已有文件前的影响分析                                                 |
| 按需 | [`styling-system.md`](./references/styling-system.md)             | 调整颜色/间距/字号/圆角；发现硬编码值需迁移至 token；还原 design token |
| 按需 | 项目 `global-*` / `component-*` references                        | 命中 JieKou / Novita / PPIO 且涉及样式或组件时，按上方“项目识别”加载   |
| 按需 | [`api-layer.md`](./references/api-layer.md)                       | mock → 真实 API、调整接口封装                                          |
| 按需 | [`localized-resources.md`](./references/localized-resources.md)   | 修改文案/字典/静态资源                                                 |
| 按需 | [`compatibility.md`](./references/compatibility.md)               | 升级依赖、修改 browserslist、调整 ESM/CJS                              |
| 按需 | [`change-scope-control.md`](./references/change-scope-control.md) | 改动同时涉及配置/依赖/业务时                                           |
| 按需 | [`mock-rules.md`](./references/mock-rules.md)                     | mock 转真实 API 时                                                     |

> **规模升级判断：** 修改中发现需要新建模块、多文件联动、数据流变更 → 转为**新建**意图并加载对应 references。

---

### 意图：原型（Prototype）

**信号：** "先看效果"、"做演示"、"试试方案"、"原型验证"

| 类型 | 文件                                                    | 场景                                                  |
| ---- | ------------------------------------------------------- | ----------------------------------------------------- |
| 必须 | [`isolation-rules.md`](./references/isolation-rules.md) | preview 文件的隔离边界                                |
| 必须 | [`mock-rules.md`](./references/mock-rules.md)           | 原型阶段 mock 数据规则                                |
| 按需 | [`styling-system.md`](./references/styling-system.md)   | 原型涉及样式时；用 token 类名占位，避免原型遗留硬编码 |

> **原型完成后：** 展示给用户确认方案，用户确认 → 转为**新建**意图正式实现。

---

### 意图：审查（Review）

**信号：** "review 代码"、"帮我看看"、"有没有问题"、"检查这段代码"

| 类型 | 文件                                                          | 场景                                                                     |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 必须 | [`checklist.md`](./references/checklist.md)                   | 高风险项逐条审查                                                         |
| 必须 | [`agent-safety.md`](./references/agent-safety.md)             | 影响范围、风险等级、共享代码                                             |
| 按需 | [`component-patterns.md`](./references/component-patterns.md) | 审查组件设计                                                             |
| 按需 | [`styling-system.md`](./references/styling-system.md)         | 检查硬编码值、未声明 CSS 变量、token 链路是否完整                        |
| 按需 | 项目 `global-*` / `component-*` references                    | 命中 JieKou / Novita / PPIO 时，按项目 token、字体、组件库、场景规则审查 |
| 按需 | [`design-principles.md`](./references/design-principles.md)   | 审查是否存在过度设计                                                     |
| 按需 | [`accessibility.md`](./references/accessibility.md)           | 审查交互组件 a11y 合规性                                                 |

---

### 意图：验证（Verify）

**触发：** 每轮改动完成后自动进入，不需要用户显式请求。

| 类型 | 文件                                                      | 场景                                                               |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| 必须 | [`checklist.md`](./references/checklist.md)               | 生成后自检高风险项                                                 |
| 必须 | [`agent-safety.md`](./references/agent-safety.md) §4      | 构建验证（tsc / build）                                            |
| 按需 | 项目 `global-*` / `component-*` references                | 命中 JieKou / Novita / PPIO 且本轮涉及 UI 时，对照项目自检小节验证 |
| 按需 | [`lint-enforcement.md`](./references/lint-enforcement.md) | lint/format 报错处理                                               |
| 按需 | [`changelog.md`](./references/changelog.md)               | 功能完成后生成变更记录                                             |

---

## 执行入口

```
收到任务
  ↓
识别意图（新建 / 修改 / 原型 / 审查）
  ↓
加载对应 references（见上方表格）
  ↓
进入 workflow.md 执行对应意图步骤
  ↓
每轮改动后自动触发验证（Verify）
```

**→ 确定意图后，立即打开 [`workflow.md`](./references/workflow.md) 执行，不要在本文件中寻找执行步骤。**

---

## 核心原则

1. **先读后写** — 动手前先读懂现有代码和项目模式，`CLAUDE.md` / `AGENTS.md` 优先于本 skill
2. **复用优先** — 先搜索项目已有实现，能复用就不新建
3. **最小改动** — 只改任务需要的，不顺手重构、不引入多余变更
4. **类型驱动** — 先定义类型，再写逻辑，最后写 UI
5. **改完即验** — 每轮改动后验证（lint + 类型检查 + 自检），不攒到最后
6. **不引入风险** — 不硬编码凭证、不泄露敏感信息、不绕过安全机制
7. **UI 样式前置** — 涉及 UI 生成或设计 Token 时，先按“项目识别”加载 JieKou / Novita / PPIO 的 `global-*` 与 `component-*`；未命中项目时以 **Tailwind 映射类 = design-token 语义变量**为主，不自行假设或硬编码

---

## 安全机制（摘要）

详见 [`agent-safety.md`](./references/agent-safety.md)。

- **影响分析** — 改已有文件前先查谁 import 了它
- **作用域边界** — 按风险等级（🟢🟡🔴）决定能否直接改
- **构建验证** — 一轮改动完成后统一验证，不逐文件触发
- **提交规则** — 见 [`change-scope-control.md`](./references/change-scope-control.md) 提交时机章节
- **回滚安全** — 大范围改动前建议用户先 commit
- **业务安全** — 禁止硬编码凭证、防止敏感信息泄露到客户端、隐私字段脱敏
