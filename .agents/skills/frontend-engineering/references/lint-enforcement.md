# Lint 执行与提交保障

**何时执行、如何确保不绕过**。

---

## 执行时机

### 1. 代码生成后立即执行

每次生成或修改代码后，对修改的文件执行 lint 和格式化：

```bash
# 读取 package.json scripts，使用项目已有的命令
# 常见形式：
pnpm lint:fix --file src/components/UserCard.tsx
pnpm format src/components/UserCard.tsx

# 或直接调用工具（如项目无封装命令）：
npx eslint --fix src/components/UserCard.tsx
npx prettier --write src/components/UserCard.tsx
```

**只对本次修改的文件执行（增量），非全量扫描。**

### 2. 禁止绕过

**硬性规则：**
- 不使用 `git commit --no-verify`
- 不跳过 pre-commit hooks（husky / lint-staged）
- 不用 `// eslint-disable` 绕过规则（除非确有正当理由且用户确认）
- 不修改 ESLint 配置来让代码通过（治标不治本）

---

## Lint 报错处理

```
lint 报错？
├── 是代码本身的问题 → 修复代码
├── 是 import 排序/格式问题 → 运行 lint:fix 自动修复
├── 是规则与当前场景冲突 → 告知用户，确认是否行内禁用
└── 是规则配置问题 → 提示用户，不自行修改规则配置
```

**允许行内禁用的场景（需用户确认）：**
- 占位参数 `// eslint-disable-next-line @typescript-eslint/no-unused-vars`
- 必须使用 `any` 的第三方库类型兼容

**不允许行内禁用的场景：**
- 类型安全相关（`@typescript-eslint/no-explicit-any` 等）
- 安全相关（`no-eval`、`no-implied-eval` 等）

---

## 调用方式

1. 读取 `package.json` 的 `scripts` 字段，识别项目的 lint/format 命令
2. 优先使用项目封装的命令（`pnpm lint:fix`），而非直接调用工具
3. 如果项目没有封装命令，直接调用 `npx eslint --fix` 和 `npx prettier --write`
4. 如果项目连 ESLint 都没装，提示用户但不阻塞（不是 Agent 的职责去安装）
