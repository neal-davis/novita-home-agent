#!/usr/bin/env node
// scripts/agent/record-demo.mjs —— 验证通过后，把本任务的「带断言验收流程」录成演示视频。
//
// 与旧版的根本差异：旧版自己开浏览器对路由做「goto→滚屏」导览（不点击、无断言、无字幕），
// 录出来的视频无法支撑上线判断。现版改为运行本任务的 `@demo` Playwright 用例
// （playwright.demo.config.ts，video:'on'）——录的是**真实交互 + 断言 + 屏内字幕**，
// 录屏即验收回放。@demo 用例怎么写见 e2e_tests/helpers/demo.ts + e2e_tests/demo-sample.spec.ts。
//
// 时机：verify-task 逐路由 GREEN 之后调用——路由已预热、登录态就绪，画面不含编译等待/重试噪音。
// 产物：<taskDir>/video/demo.webm（Playwright 原生 webm；gif/mp4 由 pr-with-demo 转码）。
//
// 用法：
//   node scripts/agent/record-demo.mjs --task <task-id> --spec <demo spec 文件名片段> \
//        [--base http://localhost:3000] [--auth e2e_tests/.auth/user.json]
//   --spec 是 Playwright 的位置过滤（按文件名子串），叠加 config 的 grep:/@demo/ → 只录该任务的 @demo 用例。
// 退出码：0 = 成功；1 = 失败（含 @demo 用例未通过——此时**拒绝产出**，别假录一段绿视频）。
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { taskDir } from "./task-paths.mjs";

const args = process.argv.slice(2);
const get = (flag, dflt) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : dflt;
};
const taskId = get("--task");
const spec = get("--spec", "");
const base = get("--base", process.env.E2E_BASE_URL || "http://localhost:3000");
const auth = get("--auth", "");
const OUT_DIR = "test-results-demo";

if (!taskId) {
  console.error(
    "用法：record-demo.mjs --task <task-id> --spec <spec-substring> [--base url] [--auth state.json]",
  );
  process.exit(1);
}
const videoDir = join(taskDir(taskId), "video");
if (!existsSync(videoDir)) {
  console.error(`✗ 任务目录不存在：${videoDir}（先 task-paths.mjs init）`);
  process.exit(1);
}

// 清掉上轮产物，避免捡到旧视频
rmSync(OUT_DIR, { recursive: true, force: true });

const pwArgs = ["playwright", "test", "--config=playwright.demo.config.ts"];
if (spec) pwArgs.push(spec);
const env = { ...process.env, DEMO: "1", E2E_BASE_URL: base };
if (auth && existsSync(auth)) env.E2E_DEMO_STORAGE_STATE = auth;

console.error(`▶ 录制 @demo 流程：${spec || "(全部 @demo)"} @ ${base}`);
const run = spawnSync("npx", pwArgs, { stdio: "inherit", env });
if (run.status !== 0) {
  console.error(
    `✗ @demo 用例未通过（playwright exit ${run.status}）——这是「功能没按预期工作」的信号，` +
      `不产出演示。回到 BUG_FOUND / TEST_STUCK 处理，别假录一段绿视频。`,
  );
  process.exit(1);
}

// 收集视频
const webms = [];
const walk = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith(".webm")) webms.push(p);
  }
};
if (existsSync(OUT_DIR)) walk(OUT_DIR);
if (!webms.length) {
  console.error(
    `✗ @demo 通过了但没找到视频（${OUT_DIR}/**.webm）——确认 spec 命中了 @demo 用例、` +
      `且 playwright.demo.config.ts 的 video:'on'。`,
  );
  process.exit(1);
}
webms.sort();

const dest = join(videoDir, "demo.webm");
renameSync(webms[0], dest);
const extra = [];
webms.slice(1).forEach((w, i) => {
  const d = join(videoDir, `demo-${i + 2}.webm`);
  renameSync(w, d);
  extra.push(d);
});
if (extra.length) {
  console.error(
    `⚠ 命中 ${webms.length} 个 @demo 用例 → 主视频 demo.webm，其余：${extra.join(", ")}。` +
      `建议一个任务一个 @demo 叙事（用 test.step 分步），便于 pr-with-demo 直接转码。`,
  );
}
console.log(JSON.stringify({ taskId, spec, video: dest, extra }));
