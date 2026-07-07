#!/usr/bin/env node
// scripts/agent/publish-task-assets.mjs —— 把任务演示资产推到孤儿分支（PR 正文引用）。
//
// 为什么用临时仓库而不是在工作区 checkout --orphan：
//  1) 本项目大量使用 worktree，分支被任一 worktree 占用时 checkout 会被拒；
//  2) 临时仓库没有 husky/lint-staged/i18n:check（对二进制资产毫无意义且 i18n:check 有状态）；
//  3) 完全不碰当前工作区的 HEAD/index。
// 推送鉴权走全局 git credential helper（gh auth setup-git / osxkeychain）。
//
// 用法：node scripts/agent/publish-task-assets.mjs --task <task-id> [--branch claude-task-assets]
// 行为：把 <taskDir>/video/demo.{webm,gif,mp4}（存在的）拷进分支的 <task-id>/ 目录并 push。
//      幂等：同 task-id 重推覆盖；non-FF（并行任务竞争）自动重试一次。
// 退出码：0 = 成功；1 = 失败。
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { taskDir } from "./task-paths.mjs";

const args = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : dflt;
};
const taskId = get("--task");
const branch = get("--branch", "claude-task-assets");
if (!taskId) {
  console.error(
    "用法：publish-task-assets.mjs --task <task-id> [--branch name]",
  );
  process.exit(1);
}

const videoDir = join(taskDir(taskId), "video");
const assets = ["demo.webm", "demo.gif", "demo.mp4"].filter((f) =>
  existsSync(join(videoDir, f)),
);
if (!assets.length) {
  console.error(
    `✗ ${videoDir} 下没有 demo.webm/gif/mp4，先跑 record-demo（及 ffmpeg 转码）`,
  );
  process.exit(1);
}

const remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
  encoding: "utf8",
}).trim();

function gitIn(dir, ...a) {
  return execFileSync("git", ["-C", dir, ...a], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function attempt() {
  const tmp = mkdtempSync(join(tmpdir(), "task-assets-"));
  try {
    gitIn(tmp, "init", "-q", "-b", branch);
    // 只用 gh 的凭证助手：本机 osxkeychain 可能缓存了另一个无权限账号的凭证，
    // 先清空继承的 helper 链再指定 gh（等价 gh auth setup-git，但只作用于临时仓库）。
    // 推送身份 = `gh auth status` 的 active account——它必须有本仓库 push 权限。
    gitIn(tmp, "config", "credential.helper", "");
    gitIn(
      tmp,
      "config",
      "--add",
      "credential.helper",
      "!gh auth git-credential",
    );
    gitIn(tmp, "remote", "add", "origin", remoteUrl);
    try {
      gitIn(tmp, "fetch", "-q", "--depth", "1", "origin", branch);
      gitIn(tmp, "reset", "-q", "--soft", "FETCH_HEAD"); // 保留既有任务的资产，首推时分支不存在则跳过
    } catch {
      console.error(`（远端还没有 ${branch} 分支，本次创建）`);
    }
    mkdirSync(join(tmp, taskId), { recursive: true });
    for (const f of assets)
      copyFileSync(join(videoDir, f), join(tmp, taskId, f));
    gitIn(tmp, "add", taskId);
    // 幂等：重推完全相同的内容时没有变更，commit 会以非零退出——直接视为成功
    if (!gitIn(tmp, "status", "--porcelain").trim()) {
      console.error("（资产与远端一致，无需推送）");
      return true;
    }
    gitIn(
      tmp,
      "-c",
      "user.name=claude-task-assets",
      "-c",
      "user.email=noreply@anthropic.com",
      "commit",
      "-q",
      "-m",
      `assets: ${taskId}`,
    );
    gitIn(tmp, "push", "-q", "origin", `HEAD:${branch}`);
    return true;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

try {
  attempt();
} catch (e) {
  console.error(
    `首次推送失败（${String(e.stderr || e.message)
      .trim()
      .slice(0, 200)}），重试一次…`,
  );
  attempt(); // non-FF 竞争：重新 fetch 最新分支头再推
}

const repoPath = remoteUrl
  .replace(/^.*github\.com[:/]/, "")
  .replace(/\.git$/, "");
const urls = Object.fromEntries(
  assets.map((f) => [
    f,
    `https://github.com/${repoPath}/raw/${branch}/${taskId}/${f}`,
  ]),
);
console.log(JSON.stringify({ taskId, branch, assets: urls }, null, 2));
