#!/usr/bin/env node
// scripts/agent/check-report.mjs —— 上线评审材料的机械门禁（verify-task step7 自检 + pr-with-demo 预检）。
//
// 为什么：要让「评审只看录屏 + 报告就能拍板上线」可靠，报告必须**确定性**地含齐裁决要素，
// 不能靠 agent 自觉填模板。本门禁校验一个任务的 report.md 结构完整、且与 plan.md 的 AC 对齐。
//
// 校验项（任一不过 → exit 1 并列出问题）：
//   1. report.md 含一行 `VERDICT: SHIP | SHIP-WITH-CAVEATS | DON'T SHIP — <理由>`（P3 裁决头）。
//   2. plan.md 里每条 AC（`- [ ] ACn: …`）都在 report.md 里被交代（P2，AC 不能静默丢失）。
//   3. report.md 含「上线前盲区」小节（serverImpact / BLOCKED / 需人眼 / mock-vs-real 的诚实交代）。
//   4. video/demo.webm 存在（带断言的 @demo 验收录屏）。
// 用法：node scripts/agent/check-report.mjs --task <task-id>
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { taskDir } from "./task-paths.mjs";

const args = process.argv.slice(2);
const get = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : d;
};
const taskId = get("--task");
if (!taskId) {
  console.error("用法：check-report.mjs --task <task-id>");
  process.exit(1);
}
const dir = taskDir(taskId);
if (!existsSync(dir)) {
  console.error(`✗ 任务不存在：${taskId}（${dir}）`);
  process.exit(1);
}

const read = (f) =>
  existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : null;
const report = read("report.md");
const plan = read("plan.md");
const problems = [];

// 1. VERDICT 裁决头（SHIP-WITH-CAVEATS 必须排在 SHIP 前，否则会被 SHIP 抢匹配）
if (!report) {
  problems.push("缺 report.md（verify-task 步骤 7 产出）");
} else if (
  !/^VERDICT:\s*(SHIP-WITH-CAVEATS|SHIP|DON'T SHIP)\s*[—-]\s*\S/m.test(report)
) {
  problems.push(
    "report.md 缺合法 VERDICT 行（应形如 `VERDICT: SHIP — <一句理由>`；取值 SHIP / SHIP-WITH-CAVEATS / DON'T SHIP）",
  );
}

// 2. plan.md 的 AC 必须在 report.md 里逐条有交代
const acIds = [];
if (plan)
  for (const m of plan.matchAll(/^\s*-\s*\[[ xX]\]\s*(AC\d+)\b/gm))
    acIds.push(m[1]);
if (!acIds.length) {
  problems.push(
    "plan.md 没有可解析的验收标准（应有 `- [ ] AC1: …` 行）——P2 要求 AC 结构化",
  );
} else if (report) {
  const missing = acIds.filter((id) => !new RegExp(`\\b${id}\\b`).test(report));
  if (missing.length)
    problems.push(
      `report.md 未交代这些 AC：${missing.join(", ")}（每条 AC 都要在「验收标准 → 证据」表里有状态 + 证据）`,
    );
}

// 3. 上线前盲区小节
if (report && !/上线前盲区|blind\s?spots/i.test(report))
  problems.push(
    "report.md 缺「上线前盲区」小节（serverImpact / BLOCKED / 需人眼 / mock-vs-real）",
  );

// 4. 演示视频
if (!existsSync(join(dir, "video", "demo.webm")))
  problems.push(
    "缺 video/demo.webm（带断言的 @demo 验收录屏，见 record-demo.mjs）",
  );

if (problems.length) {
  console.error(`✗ 上线材料门禁未通过（${taskId}）：`);
  problems.forEach((p) => console.error(`  · ${p}`));
  process.exit(1);
}
console.log(
  `✓ 上线材料齐备（${taskId}）：VERDICT + ${acIds.length} 条 AC 均有交代 + 盲区小节 + demo.webm`,
);
