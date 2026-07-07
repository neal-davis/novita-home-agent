#!/usr/bin/env node
// scripts/agent/agent-guard.mjs —— sub-agent 工具调用的机械门禁（PreToolUse hook，exit 2 = 拦截）。
//
// 为什么：.claude/agents/ 里的纪律（analyzer 只读、runner 只写任务产物目录、
// e2e author 只写 e2e_tests/**、unit author 只写 tests/unit/**）若只靠 prompt 自觉，
// 漂移只是时间问题。这里把纪律降到 hook 层机械执行（移植自 admin-cloudplatform）。
//
// 输入：stdin JSON（含 agent_type / tool_name / tool_input / cwd）。
// 退出码：0 = 放行；2 = 拦截（stderr 反馈给 agent）。策略未覆盖的 agent/工具一律放行。
//
// 与 admin 版的差异：任务产物目录在「主仓库」.claude/tasks/ 下，而 agent 的 cwd 是
// worktree——relative(cwd, target) 会以 ".." 开头，admin 原版会当作"仓库外"误拒。
// 因此先做 tasksRoot 绝对路径白名单，再走仓库相对前缀检查。
import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { tasksRoot } from "./task-paths.mjs";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0); // 解析不了别误伤
}
const {
  agent_type: agent,
  tool_name: tool,
  tool_input: args = {},
  cwd = process.cwd(),
} = input;

// 会移动 HEAD / 改工作区·暂存区·远端的 git 子命令（read-only 的 diff/show/log/status 不在内）
const GIT_MUTATING =
  /\bgit\s+(-[^\s]+\s+)*(checkout|switch|reset|stash|restore|merge|rebase|clean|commit|push|pull|fetch\s+.*--prune|add|rm|mv|cherry-pick|revert|am|apply|filter-branch|update-ref|symbolic-ref|gc|branch\s+(-[dDmM]|--delete|--move))\b/;

// Bash 里绕道写文件的粗粒度拦截（重定向 / tee / 原地 sed 进指定目录）
const shellWriteInto = (dirs) =>
  new RegExp(
    `(>>?\\s*|[|]\\s*tee\\s+(-a\\s+)?)["']?(\\./)?(${dirs})/|sed\\s+(-[^\\s]*\\s+)*-i[^\\s]*\\s+.*["']?(\\./)?(${dirs})/`,
  );

const POLICIES = {
  "app-impact-analyzer": {
    writePrefixes: [], // 只读：禁一切 Write/Edit
    bash: (cmd) => {
      if (GIT_MUTATING.test(cmd))
        return "analyzer 是只读 triage：禁止改 git 状态。对比基线用 --base 参数或 git show <ref>:<path>。";
      if (shellWriteInto("src|tests|e2e_tests|scripts").test(cmd))
        return "analyzer 只读不写：禁止经 shell 重定向/tee/sed -i 写文件。";
      return null;
    },
  },
  "ui-live-runner": {
    writePrefixes: [], // 仓库内不许写；唯一可写处是主仓库 tasksRoot（下方绝对路径白名单）
    allowTasksRoot: true,
    bash: (cmd) => {
      if (GIT_MUTATING.test(cmd)) return "runner 不许改 git 状态。";
      if (shellWriteInto("src|tests|e2e_tests|scripts").test(cmd))
        return "runner 只许往任务产物目录（.claude/tasks/<task-id>/）写，禁止写 src/、tests/、e2e_tests/。";
      return null;
    },
  },
  "e2e-test-author": {
    writePrefixes: ["e2e_tests/"],
    denyPrefixes: ["e2e_tests/.auth/"],
    bash: (cmd) => {
      if (GIT_MUTATING.test(cmd))
        return "author 不许改 git 状态（提交由主会话/人决定）。";
      if (shellWriteInto("src|tests|scripts").test(cmd))
        return "e2e author 只写 e2e_tests/**，禁止写 src/、tests/、scripts/。";
      return null;
    },
  },
  "unit-test-author": {
    writePrefixes: ["tests/unit/"],
    bash: (cmd) => {
      if (GIT_MUTATING.test(cmd))
        return "author 不许改 git 状态（提交由主会话/人决定）。";
      if (shellWriteInto("src|e2e_tests|scripts").test(cmd))
        return "unit author 只写 tests/unit/**，禁止写 src/、e2e_tests/、scripts/（jest 配置也不许动）。";
      return null;
    },
  },
};

const policy = POLICIES[agent];
if (!policy) process.exit(0);

function deny(reason) {
  console.error(`[agent-guard] 已拦截（${agent} / ${tool}）：${reason}`);
  process.exit(2);
}

if (tool === "Bash") {
  const reason = policy.bash(String(args.command || ""));
  if (reason) deny(reason);
  process.exit(0);
}

if (tool === "Write" || tool === "Edit" || tool === "NotebookEdit") {
  const fp = String(args.file_path || args.notebook_path || "");
  const abs = resolve(cwd, fp);

  if (policy.allowTasksRoot) {
    let root = null;
    try {
      root = tasksRoot(cwd);
    } catch {
      // 不在 git 仓库内（不应发生）——继续走相对前缀检查
    }
    if (root && !relative(root, abs).startsWith("..")) process.exit(0);
  }

  const rel = isAbsolute(fp) ? relative(resolve(cwd), abs) : fp;
  if (rel.startsWith("..")) deny(`目标在仓库外：${fp}`);
  if ((policy.denyPrefixes || []).some((p) => rel.startsWith(p)))
    deny(`${rel} 在禁写名单内`);
  if (!policy.writePrefixes.some((p) => rel.startsWith(p)))
    deny(
      policy.writePrefixes.length
        ? `${rel} 不在允许目录（${policy.writePrefixes.join(", ")}）内`
        : policy.allowTasksRoot
          ? `${rel} 不在任务产物目录（.claude/tasks/）内——runner 仓库内只读`
          : "该 agent 为只读，禁止任何写操作",
    );
}

process.exit(0);
