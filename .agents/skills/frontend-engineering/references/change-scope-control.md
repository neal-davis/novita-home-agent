# 修改范围控制

---

## 核心原则

**项目级配置变更必须与业务代码改动分离。** 不在同一次改动中混合配置文件和业务代码的修改。

---

## 改动分类

### 配置变更

以下文件的修改属于「配置变更」，需要独立处理：

- `next.config.ts` / `next.config.js`
- `tsconfig.json` / `tsconfig.*.json`
- `eslint.config.*` / `.eslintrc.*`
- `.prettierrc.*` / `prettier.config.*`
- `tailwind.config.*`
- `postcss.config.*`
- `.env.*`（环境变量文件）
- `Dockerfile` / `docker-compose.*`
- CI/CD 配置文件（`.github/workflows/*`、`.gitlab-ci.yml` 等）
- 其他根目录相关三方配置文件

### 依赖变更

以下文件的修改属于「依赖变更」，需要独立处理：

- `package.json`（dependencies / devDependencies 变更）
- `pnpm-lock.yaml` / `package-lock.json` / `yarn.lock`

### 业务变更

以上之外的 `src/` 目录下的代码修改。

---

## 执行规则

### 规则 1：分类识别

每次准备改动前，先分析涉及的文件范围，自动分类：

```
本次改动涉及：
  配置变更：next.config.ts（添加 webpack 插件）
  依赖变更：package.json（新增 @sentry/nextjs）
  业务变更：src/lib/sentry.ts, src/app/layout.tsx
```

### 规则 2：分离处理

如果一次改动同时涉及多个分类，拆分为独立的步骤：

1. **先处理依赖变更**（安装新依赖）
2. **再处理配置变更**（修改配置文件）
3. **最后处理业务变更**（修改业务代码）

每个步骤独立完成，用户提交时也建议分开 commit：

```
commit 1: chore: add @sentry/nextjs dependency
commit 2: config: configure Sentry in next.config.ts
commit 3: feat: integrate Sentry error tracking
```

### 规则 3：配置变更影响说明

修改配置文件时，必须说明：

1. **改了什么**：具体修改的配置项
2. **为什么改**：这个配置变更的目的
3. **影响范围**：会影响哪些功能/流程
4. **回滚方式**：如何回退这个变更

```
配置变更说明：
- 文件：next.config.ts
- 修改：添加 webpack 插件 ignore-loader，排除 *.preview.tsx 和 *.mock.ts
- 目的：确保 preview 和 mock 文件不进入生产构建
- 影响：仅影响构建过程，不影响开发模式
- 回滚：删除 webpack.module.rules 中的对应规则
```

---

## 特殊情况

### 新项目初始化

新项目搭建时，配置和业务代码可以在同一轮处理，但仍建议分步骤：先配置环境，再创建业务代码。

### 配置变更是业务需求的前置条件

例如："添加 i18n 支持"需要同时修改 `next.config.ts` 和业务代码。此时：

1. 先完成配置变更并确认可工作
2. 再进行业务代码变更
3. 提交时分开 commit

### 极小的配置调整

如果配置变更极小（如 tsconfig 添加一个 path alias）且与业务变更紧密关联，可以在同一步骤中处理，但需要在改动说明中明确标注。

---

## 与 Changelog 的对应

改动分类与 [`changelog.md`](./changelog.md) 的变更类型保持一致：

| 改动分类 | Changelog 类型 | 示例 |
|---------|---------------|------|
| 业务变更 | Added / Changed / Fixed / Removed | `feat: 新增用户头像上传` |
| 配置变更 | Changed（影响用户可感知行为时记录） | `config: 启用图片优化` |
| 依赖变更 | Changed（重大升级时记录） | `chore: 升级 React 19` |

> 纯配置调整和常规依赖更新不需要写 changelog，只有影响用户可感知行为时才记录。

---

## 与 Git 工作流的关系

本规则关注的是**改动的组织方式**，不是强制的 git commit 策略。用户可以选择：

- 严格模式：每个分类一个 commit
- 宽松模式：在同一 commit 中但改动说明中分类标注
- 由项目 `CLAUDE.md` 中的 git 约定决定

### 提交时机

- **不主动 commit**：小范围改动（单文件修改、样式调整、文案替换等）完成后不自动触发 commit，等用户明确指令
- **可建议的节点**：完整功能或阶段交付完成且验证通过后，可向用户建议 commit，但不自行执行
- **大范围拆分**：跨多文件的重构或新功能，按逻辑单元拆分 commit（如「新增组件」「接入接口」「补类型」），拆分方案先向用户说明再执行
- **提交前验证**：`git commit` 前必须完成验证阶段（tsc 无报错、lint 通过、checklist 自检），未通过验证不得提交；**禁止使用 `--no-verify` 绕过 pre-commit hooks**
