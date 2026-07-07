# E2E & 自动化集成测试

本目录是 novita.ai 官网 + 控制台（Next.js App Router）的端到端测试。三层结构，按「确定性 ↔ 真实性」分离：

| 层           | 文件              | 连什么                    | 配置                         | 进 CI             | 作用                           |
| ------------ | ----------------- | ------------------------- | ---------------------------- | ----------------- | ------------------------------ |
| **hermetic** | `*.spec.ts`       | `mockBackend()` mock 后端 | `playwright.config.ts`       | ✅ 门禁           | 确定性回归，零外部依赖         |
| **sweep**    | `sweep.spec.ts`   | 按 profile（mock / 真实） | `playwright.sweep.config.ts` | ✅ 门禁(hermetic) | catalog 驱动的**全站健康巡检** |
| **smoke**    | `smoke/*.spec.ts` | 真实后端                  | `playwright.smoke.config.ts` | ❌ 需 token       | 真相源                         |

## 两类覆盖（别混）

- **广度**＝ `sweep.spec.ts`：从 `route-catalog.generated.json`（由 `scripts/agent/route-catalog.mjs` 从 `src/app` 生成）逐路由导航 + 健康断言（主文档非 5xx / 不触错误边界 / 非白屏）。**一个 spec 覆盖全站**，弱断言。
- **深度**＝ 专属 spec（如 `billing-overview.spec.ts`）：mock 真实响应 fixture，断言**交互与数据行为**。强断言，少而精。

覆盖率：`npm run e2e:coverage`（路由覆盖 + 深度覆盖双口径）。

## 环境 profile（`profiles.ts`）

`sweep` 用 `E2E_PROFILE` 选目标环境：

| profile                  | 页面                  | 后端      | token            | 写操作                                                 |
| ------------------------ | --------------------- | --------- | ---------------- | ------------------------------------------------------ |
| `local-hermetic`（默认） | localhost             | mock      | 无               | n/a（CI 门禁）                                         |
| `local-live`             | localhost(build:test) | 真实 dev  | `E2E_TOKEN_DEV`  | dev 账号可写                                           |
| `online-staging`         | dev 部署域名          | 真实 dev  | `E2E_TOKEN_DEV`  | 只读                                                   |
| `online-prod`            | https://novita.ai     | 真实 prod | `E2E_TOKEN_PROD` | **只读**（护栏 abort 非 GET）+ 需 `E2E_CONFIRM_PROD=1` |

**token 注入**：真机 profile 的 token 手动粘进 `.env.e2e`（gitignored，模板见 `.env.e2e.example`）。`sweep.auth.setup.ts` 种 cookie → storageState，并用 `/v1/user/info` 200 探针验证 token 真有效（真实登录有 cloudflare 验证码，无法程序化登录，只能注入预取 token）。

## 跑

```bash
# hermetic 全量（sweep + 深度 spec，CI 门禁，需先起 localhost server）
E2E_BASE_URL=http://localhost:3101 npm run test:e2e:agent

# 全站健康巡检（选环境）
npm run test:e2e:sweep                                              # local-hermetic
E2E_PROFILE=online-prod E2E_CONFIRM_PROD=1 npm run test:e2e:sweep   # 生产真机只读

# 真相源 smoke（需 .env.e2e 的 token）
npm run test:e2e:smoke

# 覆盖率报告
npm run e2e:coverage
```

> dev server：本仓库 `npm run dev` 按需编译，重路由首访慢——巡检前用 `node scripts/agent/warm-routes.mjs` 预热，或对预编译的 prod profile 直接跑。:3000 被占用时 `PORT=3101 npm run dev` 另起并透传 `E2E_BASE_URL`。

## 断言纪律（违反必 flaky）

- **绝不断言 i18n 文案**（EN/ZH 构建变体，文字断言必碎）。唯一例外：错误边界 `getByRole("heading",{name:"Error"})` 断言 count 0。
- 选择器优先级：`data-testid` / 稳定 id > `getByRole`（不带文案 name）> 稳定语义 class。
- 绝不 `waitForTimeout` 硬等就绪，用 `waitForResponse` / `expect().toBeVisible()`。
- fixture 必须脱敏（`npm run check:fixtures` 机械门禁）；真实 token 只进 `.env.e2e`。

## CI（`.github/workflows/e2e.yml`）

PR → build:test → 起 server → 跑 hermetic + sweep。**重试**：Playwright 配置级 `retries=2` + job 级 `--last-failed` 兜底一次。**失败感知**：`github` reporter 行内注解 + 始终上传 HTML 报告 artifact + 在 PR 贴/更新结果与覆盖率评论。
