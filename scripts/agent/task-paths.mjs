#!/usr/bin/env node
// scripts/agent/task-paths.mjs —— 任务产物目录的唯一解析入口（verify-task / pr-with-demo 共用）。
//
// 为什么：Claude 的 worktree 合并后会被删除，任务执行过程产物（截图/视频/报告）必须比
// worktree 长寿，所以统一落在「主仓库」的 .claude/tasks/<task-id>/ 下（已 gitignore）。
// 主仓库路径经 `git rev-parse --git-common-dir` 机械解析——在任意 worktree 内都指向主仓库 .git。
//
// 用法：
//   node scripts/agent/task-paths.mjs init <slug>        创建任务目录，stdout 输出 JSON {taskId, dir}
//   node scripts/agent/task-paths.mjs log <task-id> <msg> 往 steps.md 追加一条带时间戳的执行记录
//   node scripts/agent/task-paths.mjs dir <task-id>       输出任务目录绝对路径
// 退出码：0 = 成功；1 = task-id 不存在 / 参数错误。
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export function mainRepoRoot(cwd = process.cwd()) {
  // 主仓库内返回 ".git"（相对），worktree 内返回主仓库 .git 的绝对路径——统一 resolve 后取父目录
  const common = execFileSync("git", ["rev-parse", "--git-common-dir"], {
    cwd,
    encoding: "utf8",
  }).trim();
  return dirname(resolve(cwd, common));
}

export function tasksRoot(cwd = process.cwd()) {
  return join(mainRepoRoot(cwd), ".claude", "tasks");
}

export function taskDir(taskId, cwd = process.cwd()) {
  return join(tasksRoot(cwd), taskId);
}

function fail(msg) {
  console.error(`[task-paths] ${msg}`);
  process.exit(1);
}

function cmdInit(slug) {
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug))
    fail(`init 需要 kebab-case slug，收到：${JSON.stringify(slug)}`);
  const today = new Date();
  const ymd = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("");
  let taskId = `${ymd}-${slug}`;
  for (let n = 2; existsSync(taskDir(taskId)); n++)
    taskId = `${ymd}-${slug}-${n}`;
  const dir = taskDir(taskId);
  for (const sub of ["verify", "video", "pr"])
    mkdirSync(join(dir, sub), { recursive: true });
  writeFileSync(join(dir, "steps.md"), `# ${taskId} 执行日志\n\n`);
  writeFileSync(join(dir, "plan.md"), planTemplate(taskId));
  appendStep(taskId, "task created");
  console.log(JSON.stringify({ taskId, dir }));
}

function planTemplate(taskId) {
  return `# Task: ${taskId}

## 目标 (Goal)
<这次改动要达成什么，2-4 句>

## 验收标准 (Acceptance Criteria)
> 每条 AC 必须**可验证**。它贯穿全链：@demo 用例的 demoPass(msg,"ACn") ↔ report.md 的
> 「验收标准 → 证据」表 ↔ 录屏左下角逐条打勾的验收清单。AC 编号连续（AC1、AC2…），别跳号。
- [ ] AC1: <一句话可验证的判据>
- [ ] AC2: <...>

## serverImpact
<YES / NO + 理由；YES 给升级路径：npm run build:test && npm run start>
`;
}

function appendStep(taskId, message) {
  const dir = taskDir(taskId);
  if (!existsSync(dir)) fail(`task 不存在：${taskId}（${dir}）`);
  appendFileSync(
    join(dir, "steps.md"),
    `- ${new Date().toISOString()} ${message}\n`,
  );
}

const [, , cmd, ...rest] = process.argv;
const invokedAsCli =
  process.argv[1] && process.argv[1].endsWith("task-paths.mjs");
if (invokedAsCli && cmd) {
  if (cmd === "init") cmdInit(rest[0]);
  else if (cmd === "log")
    appendStep(rest[0], rest.slice(1).join(" ") || "(empty)");
  else if (cmd === "dir") {
    const dir = taskDir(rest[0] || "");
    if (!rest[0] || !existsSync(dir)) fail(`task 不存在：${rest[0]}`);
    console.log(dir);
  } else fail(`未知子命令：${cmd}（支持 init / log / dir）`);
}
