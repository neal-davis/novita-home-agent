---
name: verify-task
description: >-
  开发任务完成后的验证闭环总指挥。建任务档案（.claude/tasks/<task-id>/，全程留痕）→
  app-impact-analyzer（测什么）→ ui-live-runner（真机跑、抓响应）→ unit-test-author +
  e2e-test-author（固化测试并跑绿）→ 录制演示视频 → 全量回归 → 报告。逐路由自验证：
  红了带上次报错重试到绿/N 次，发现 bug 或卡住就停下叫人（escape），绝不自己 merge。
  改完 src/ 前端、推送/建 PR 前用它。Triggers: "验证这次改动"、"verify my change"、
  "跑一遍改动的功能"、"补测试"、"verify-task"。
---

# verify-task（编排版）

改完前端后，在真实环境跑一遍改动涉及的功能，确认无误后固化成单测 + e2e，全程留痕到任务档案，
最后产出供 `/pr-with-demo` 使用的报告与演示视频。

## 编排原则

本技能在**主会话**里当总指挥，把脏活委派给四个专注的 sub-agent——sub-agent 不能再生 sub-agent，
编排只能在主会话里做；且各 worker 自带上下文隔离，浏览器/测试的海量日志不会污染主对话。

| 角色   | sub-agent                     | 职责                                                                       | 写权限（guard 机械强制）       |
| ------ | ----------------------------- | -------------------------------------------------------------------------- | ------------------------------ |
| 测什么 | `app-impact-analyzer`（只读） | diff → 受影响路由 + 风险 + testFocus                                       | 无                             |
| 抓素材 | `ui-live-runner`              | 真机导航改动路由，盯 network+console，输出 **healthy/buggy** + 截图/抓响应 | 仅任务档案目录                 |
| 单测   | `unit-test-author`            | 改动的 hooks/lib/api/store → Jest 测试并自跑绿                             | 仅 `tests/unit/`               |
| e2e    | `e2e-test-author`             | route+响应 → hermetic+smoke+fixture 并自跑绿                               | 仅 `e2e_tests/`（禁 `.auth/`） |

> agent 定义在 `.claude/agents/`。**两种情况它们会从 Agent 工具可用列表里掉**：
> ① 本会话内新建/改过 agent 文件；② 切到没有 `.claude/agents/` 的分支再切回。
> 需**重启会话**或 `/agents` 重建。**临时 fallback**：用 `general-purpose` 让它先
> `Read .claude/agents/<name>.md` 再按其内容执行——但 **agent-guard hook 对 general-purpose
> 不生效**（按 agent_type 匹配），转达时必须额外强调该 agent 的纪律。

## 编排步骤

### 0. 建任务档案（开跑必做，全程留痕）

```bash
node scripts/agent/task-paths.mjs init <kebab-slug>   # → {taskId, dir}；slug 取自任务标题 2-5 词
```

档案落在**主仓库** `.claude/tasks/<task-id>/`（gitignored，worktree 删了它还在）：

```
plan.md       # 目标 + 结构化验收标准（AC；init 已 scaffold 模板 → 现在填具体 AC，连续编号）
steps.md      # 追加式执行日志——每个状态迁移都要记：
              #   node scripts/agent/task-paths.mjs log <task-id> "<事件>"
impact.json   # analyzer 输出（步骤 1 落盘）
verify/       # runner 的探索脚本/截图/captured-*.json
video/        # demo.webm（步骤 5）
report.md     # 终态汇总（步骤 7）
pr/           # PR 正文草稿（pr-with-demo 写）
```

之后每步的关键事件（委派了谁、判分结果、状态迁移、跳过原因）都 `log` 进 steps.md——
这是「任务维度执行步骤」的唯一权威记录，别只留在对话里。

### 1. 测什么 — 委派 `app-impact-analyzer`

> 用 app-impact-analyzer 分析本次改动，给出受影响路由 + 风险 + testFocus。

它内部跑 `npm run diff:routes -- --json` + 读 diff 判风险。输出原样存 `impact.json`。

- `affectedRoutes` 为空**且**无共享逻辑文件改动（纯文档/CI/测试改动）→ **NO_OP**：写 report.md，结束。
- `affectedRoutes` 为空但改了 hooks/lib/api（纯逻辑改动）→ 跳过 UI 循环，**仍执行步骤 3（单测）**。
- `serverImpact: true` → 在 steps.md 与最终报告里**显著标记**：middleware/next.config/route handler
  的改动 dev server 验证可能不充分，给出升级路径
  `npm run build:test && npm run start`（多分钟、test 环境 API；**绝不用 `npm run build`**——它焊死生产 API）。
  默认仍走 dev 流程，升级由人决定。

### 2. 服务器生命周期（dev 按需编译是本仓库与 admin 的最大差异）

```bash
npm run check:dev-server          # :3000 归属校验
```

- **exit 0**（本工作区的 server）→ 复用，`E2E_BASE_URL=http://localhost:3000`。
- **exit 2**（被主仓库/别的 worktree 占用）→ **不要 kill 别人的会话**：
  `PORT=3101 npm run dev` 后台另起，之后所有环节（warm-routes / runner / playwright / record-demo）
  统一带 `E2E_BASE_URL=http://localhost:3101`，并重跑 `npm run check:dev-server -- 3101` 确认归属。
- **exit 1**（没起）→ 后台起 `npm run dev`（predev 会先跑 i18n scan/compile，首次启动慢是正常的；
  server 长驻复用，本任务和后续任务都用它）。起完轮询 `check:dev-server` 直到 exit 0，
  起不来（依赖缺失/端口冲突）→ **致命 escape**，停。
- **预热（必做，在任何健康测量之前）**：
  ```bash
  node scripts/agent/warm-routes.mjs --routes <affectedRoutes 的可访问 URL 逗号串>
  ```
  next dev 按需编译，首访一个重路由要几十秒——不预热，runner 会把「编译中」误判成白屏。
  预热失败（编译错误/超时）→ 该路由直接 BLOCKED 并把输出记进 steps.md；4xx 说明示例 URL
  失效 → 修 `scripts/agent/route-samples.json` 或标 BLOCKED(needs-params)。
- token：console 类路由需要 `.env.e2e` 的 `E2E_NOVITA_TOKEN`（dev 环境用户 JWT）。
  没有 → 这些路由的真机探索降级 mock 模式 / smoke 自动 skip，报告里写明。

### 3. 单测 pass — 委派 `unit-test-author`（不依赖 server，可与步骤 2 并行）

把 diff 中的 `src/{hooks,lib,api,store,components}` 真实源文件（剔除测试文件）交给它。
内循环与判分规则同《验证循环》：判分命令是
`npm run test:unit -- <测试文件路径>` → 全量 `npm run test:unit` → `npm run test:location`，
以**退出码**为准。终态：GREEN / TEST_STUCK / BUG_FOUND（测试揭示 src 真 bug → 停下叫人，绝不弯断言）。

### 4. 逐路由验证循环（按 risk 高→低，一次一个路由）

每个路由按《验证循环（状态机）》落到终态。**一个路由失败不阻断下一个。**
委派 `ui-live-runner` 时必须给全：路由、可访问 URL、testFocus、`$TASK_DIR`、`E2E_BASE_URL`、
是否需要鉴权。它的产物（截图/captured.json）落 `$TASK_DIR/verify/`。

### 5. 录制验收演示视频（有 GREEN 路由 = 必须有视频，硬门禁）

不录「滚屏导览」，录**带断言的验收流程**——录屏即验收回放，评审只看视频就能判断能否上线：

1. e2e-test-author 给本任务写/标一个 `@demo` 用例（测试标题带 `@demo` + 用 `e2e_tests/helpers/demo.ts`
   的 HUD：标题卡注明 改动 / 环境（real code vs mock · locale）/ 判据，每个 AC 一个
   `demoStep` + 断言 + `demoPass`）。样板见 `e2e_tests/demo-sample.spec.ts`。
   该用例同时是 hermetic 回归用例（DEMO 未置位 → HUD 自动 no-op，零额外耗时），不重复维护。
2. 录制：

   ```bash
   node scripts/agent/record-demo.mjs --task <task-id> --spec <demo spec 文件名片段> \
     [--auth e2e_tests/.auth/user.json]   # console 路由进 demo 时带上（先跑过 smoke 的 auth.setup）
   ```

- 录的是真实交互 + 断言，故 **@demo 用例必须先绿**：record-demo 见 playwright 非零退出会
  **拒绝产出**（功能没按预期工作 = 别假录一段绿视频，回到 BUG_FOUND / TEST_STUCK 处理）。
- 在验证**之后**录：路由已预热、画面不含编译等待与重试噪音，录制开销也不污染健康测量。
- **硬门禁**：本任务有任何 GREEN 路由就必须产出 `video/demo.webm`，缺了不进入步骤 7。
  gif/mp4 转码留给 `/pr-with-demo`。

### 6. 收尾全量回归（主会话跑）

防「生成的测试/fixture 碰坏别的路由」：

```bash
npm run test:e2e:agent    # 全量 hermetic，必须绿（别用 test:e2e——它会挂起在 report server）
npm run test:unit         # 全量单测，必须绿
npm run test:e2e:smoke    # 真相源（server 在跑时；console 用例无 token 自动 skip）
```

### 7. 汇总报告 → 人 review（绝不自己 merge / push）

按《report.md 结构》写报告（VERDICT 裁决头 + 验收标准→证据表 + 上线前盲区 + 路由终态 + 回归），
然后机械自检上线材料是否齐备：

```bash
node scripts/agent/check-report.mjs --task <task-id>   # 缺 VERDICT / AC 交代 / 盲区 / demo.webm → 非零，补齐再交
```

`log` 最后一条 steps.md。提示下一步：`/pr-with-demo <task-id>` 建 PR 并带上演示视频。

## 验证循环（状态机，移植自 admin verify-change）

**判分用确定性命令（测试退出码），不靠 agent 自己声明「我跑绿了」。**

### 先认清两种「红」（决定 retry 还是 escape）

|      | A. 页面真坏了                                                               | B. 测试自己写挂了                                 |
| ---- | --------------------------------------------------------------------------- | ------------------------------------------------- |
| 信号 | 探索命中：console error / 后端 4xx·5xx / 错误边界（`<h1>Error</h1>`）/ 白屏 | `npm run test:e2e:agent` / `test:unit` 退出码非 0 |
| 含义 | **发现 bug**                                                                | 选择器 / fixture / mock / 断言没对上              |
| 动作 | **立刻 `BUG_FOUND`，停，不写测试**                                          | **带报错重试到绿 / N 次**                         |

> 必须分开的理由：对着真 bug 反复改测试，最后会写出「把 bug 当正确行为」的绿测试——比没有测试更糟。

### 单路由内循环

参数：`MAX_ATTEMPTS=3`、`NO_PROGRESS=2`（连续两次**同样**报错 = 原地打转）。

1. **PRECHECK** — `needsParams` 且无可用示例 URL / 预热失败 / token 过期 / 端口归属 exit 2
   → **`BLOCKED`**（跳过 + 标注，非失败），下一个路由。
2. **探索健康（A 类）** — 委派 `ui-live-runner`：
   - 命中任一 A 信号 → **`BUG_FOUND`**：复现步骤 + 信号 + 截图已在 `$TASK_DIR/verify/`，
     **不写测试**，下一个路由。（hydration 类信号注明「需对比 main 确认是否新引入」。）
   - 干净 → 进内循环（抓到的响应留作 fixture 素材）。
3. **内循环**（最多 `MAX_ATTEMPTS` 次）：
   - **a. 写** — 委派 `e2e-test-author`，**一次只给这一个路由** + testFocus + captured 路径，
     **带上次报错**（首次无）。
   - **b. 判分（确定性）** — `npm run test:e2e:agent -- <feature>` 退出码：
     - `0` → **`GREEN`**，下一个路由。
     - 非 `0` → 报错指纹（归一化去行号/时间戳/耗时）与上次相同则 `sameErr++`，否则归零；
       `sameErr ≥ NO_PROGRESS` 或 `attempt ≥ MAX_ATTEMPTS` → **`TEST_STUCK`**；否则回 a。

> 重试**必须带上次报错**进 author——把失败变成下一轮的上下文，否则盲试重复同错。
> 每次状态迁移记 steps.md。

### 三层 escape（停下叫人）

| 层     | 触发                                                  | 动作                                                          |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| 路由级 | 单路由 `BUG_FOUND` / `TEST_STUCK`                     | 标记该路由，不阻断其它路由                                    |
| 批次级 | escape 路由 > 50%，或预算/时间耗尽                    | 整体停：疑似环境问题（后端宕 / token 过期 / server 验错代码） |
| 致命级 | `diff:routes` 报错 / dev server 起不来 / 预热全军覆没 | 立即停，别空转                                                |

### report.md 结构（评审只读它 + 录屏就能拍板，自上而下；check-report.mjs 机械校验）

**顶部裁决（P3，写在第一行）：**

```
VERDICT: SHIP | SHIP-WITH-CAVEATS | DON'T SHIP — <一句话理由>
```

**① 验收标准 → 证据（P2，对齐 plan.md 的每条 AC，一条不能少）：**

| AC  | 判据 | 状态     | 证据（@demo 用例 / 视频时间戳 / 截图 / smoke） |
| --- | ---- | -------- | ---------------------------------------------- |
| AC1 | …    | ✅/❌/⚠️ | demoPass("AC1") @0:08 · cookie-consent.spec.ts |

**② 上线前盲区（诚实交代，决定 SHIP 还是 SHIP-WITH-CAVEATS）：**

- `serverImpact`（YES → dev 验证不充分 + 升级路径 `build:test && start`）
- `BLOCKED` 路由（needs-params / 无 token / 端口被占）
- **mock vs real**：demo 跑的是 hermetic mock 还是真后端——数据敏感改动别拿 mock 当线上
- 仍需人眼确认的点

**③ 路由终态**（每路由/测试组恰好落一个）：

- `NO_OP` — 无 UI 影响且无逻辑文件改动 → 干净退出，不叫人。
- `GREEN` — 探索干净 + 测试绿 → 列：路由/文件 + 新增 spec·fixture·单测 + 用例数。
- `BUG_FOUND` — 列：路由 + 复现步骤 + 命中信号 + 截图路径（**未写通过测试**，交人）。
- `TEST_STUCK` — 列：路由 + 最后报错 + 试过哪些改法。
- `BLOCKED` — 列：路由 + 原因（needs-params / 预热失败 / 无 token / 端口被占）。

**④ 回归**：`test:e2e:agent` / `test:unit` / `smoke` 结果 + 覆盖率 delta（`npm run e2e:coverage`）。

## 护栏

- 委派 author **一次只给一个路由/一组文件**（self-verify 循环才聚焦）。
- **判分以测试退出码为准**，不信 agent 自我声明。
- **任何 agent 都不许改 `src/` 让测试变绿**：红了要么改测试重试，要么 `BUG_FOUND` 停下叫人。
- **escape 后绝不自动 merge/push**：统一报告，人决定。
- 四个 sub-agent 的纪律由各自 frontmatter 的 PreToolUse hook → `scripts/agent/agent-guard.mjs`
  机械强制。general-purpose fallback 时 hook 不生效，转达纪律要额外强调。
- 别 kill 不属于本工作区的 dev server（那是别人的会话）——换端口。
- 脱敏机械兜底：`npm run check:fixtures` 必须绿才能交付 fixture。
