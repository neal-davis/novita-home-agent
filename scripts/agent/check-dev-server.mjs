#!/usr/bin/env node
// scripts/agent/check-dev-server.mjs —— 校验端口上监听的 dev server 确实是「本工作区」起的进程。
//
// 为什么：verify-task / ui-live-runner 复用已起的 dev server 做真机验证。本项目大量使用
// git worktree——若 :3000 上挂的是主仓库（或别的 worktree、别的项目）的进程，验证闭环验的
// 就是别的代码，却会产出 healthy 报告。必须机械校验 cwd 归属，不靠自觉。
//
// 用法：node scripts/agent/check-dev-server.mjs [port]   （默认 3000）
// 退出码：0 = server 在且属于本工作区；1 = 端口无监听进程；2 = 端口被「别处」的进程占用
//        （exit 2 时不要 kill 别人的服务——换端口另起：PORT=3101 npm run dev）。
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";

const port = Number(process.argv[2] || 3000);

function lsof(args) {
  try {
    return execFileSync("lsof", args, { encoding: "utf8" });
  } catch (e) {
    // lsof 无匹配时退出码 1、stdout 为空——视为空结果
    return e.stdout || "";
  }
}

const pids = lsof(["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"])
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

if (pids.length === 0) {
  console.error(`✗ 端口 ${port} 没有监听进程 —— 请先 npm run dev`);
  process.exit(1);
}

const repoRoot = realpathSync(process.cwd());
const offenders = [];

for (const pid of pids) {
  // -Fn 输出形如：p<pid> / f cwd / n<path>
  const out = lsof(["-a", "-p", pid, "-d", "cwd", "-Fn"]);
  const cwdLine = out.split("\n").find((l) => l.startsWith("n"));
  const cwd = cwdLine ? cwdLine.slice(1) : "(unknown)";
  let real = cwd;
  try {
    real = realpathSync(cwd);
  } catch {}
  if (real === repoRoot || real.startsWith(repoRoot + "/")) {
    console.log(`✓ 端口 ${port} 的进程 ${pid} 属于本工作区（cwd: ${real}）`);
    process.exit(0);
  }
  offenders.push({ pid, cwd: real });
}

console.error(
  `✗ 端口 ${port} 被非本工作区的进程占用，真机验证会验到别的代码：`,
);
for (const o of offenders) console.error(`  pid ${o.pid}  cwd ${o.cwd}`);
console.error(
  `  → 不要 kill 别人的会话；换端口另起：PORT=3101 npm run dev（本工作区：${repoRoot}）`,
);
process.exit(2);
