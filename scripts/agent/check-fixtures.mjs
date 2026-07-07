#!/usr/bin/env node
// scripts/agent/check-fixtures.mjs —— e2e_tests/fixtures/ 脱敏的确定性兜底（fixture 会进 git，泄了就是事故）。
//
// 两类检查（移植自 admin-cloudplatform）：
//  A. 结构检查：递归遍历 JSON，敏感键名（token/secret/password/authorization/cookie/apiKey…）
//     的值必须为空或明显占位符（mock/fake/test/xxx/***/redacted）。
//  B. 形态检查：对原文扫高置信 secret 形态——JWT、Bearer、sk-/sk_/ghp_/xoxb- 等私钥前缀、
//     40+ 位纯 hex、非 example/test 域名的邮箱、11 位大陆手机号。
//     刻意不扫「泛泛的 32+ 长串」：业务 ID / 模型 slug 会误报。
//
// 用法：node scripts/agent/check-fixtures.mjs   退出码 0=干净，1=发现疑似泄露（逐条列出）。
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "e2e_tests/fixtures";
const SENSITIVE_KEY =
  /(token|secret|password|passwd|authorization|api[-_]?key|cookie|session[-_]?id|private[-_]?key|credential)/i;
// LLM 业务里的 token 是「计数」不是凭证：maxOutputTokens / batchJobTokenLimit / minTokens…
const TOKEN_COUNT_KEY = /tokens?([-_]?(limit|count|size|len(gth)?))?$/i;
const PLACEHOLDER =
  /^(|\*+|x+|mock.*|fake.*|test.*|dummy.*|placeholder.*|redacted.*|<.*>)$/i;

const PATTERNS = [
  {
    name: "JWT",
    re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g,
  },
  { name: "Bearer token", re: /Bearer\s+[A-Za-z0-9._~+/-]{16,}/g },
  {
    // sk_ 形态覆盖 novita 平台 API key
    name: "私钥/平台 key 前缀",
    re: /\b(sk[-_][A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|xox[bap]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})\b/g,
  },
  { name: "PEM 私钥", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  {
    name: "40+ 位 hex",
    re: /(?<![A-Za-z0-9])[0-9a-fA-F]{40,}(?![A-Za-z0-9])/g,
  },
  {
    name: "真实邮箱",
    re: /[A-Za-z0-9._%+-]+@(?!(example|test|mock|fixture)\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  },
  { name: "大陆手机号", re: /(?<!\d)1[3-9]\d{9}(?!\d)/g },
];

if (!existsSync(ROOT)) {
  console.log(`✅ ${ROOT} 不存在（还没有 fixture），跳过`);
  process.exit(0);
}

function* jsonFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* jsonFiles(p);
    else if (name.endsWith(".json")) yield p;
  }
}

function walk(node, path, hits) {
  if (Array.isArray(node))
    node.forEach((v, i) => walk(v, `${path}[${i}]`, hits));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      const at = path ? `${path}.${k}` : k;
      if (
        SENSITIVE_KEY.test(k) &&
        !TOKEN_COUNT_KEY.test(k) &&
        typeof v === "string" &&
        !PLACEHOLDER.test(v.trim()) &&
        !/^\d+$/.test(v.trim()) // 纯数字是计数/额度，不是凭证
      ) {
        hits.push(`敏感键名含真值: ${at} = ${JSON.stringify(v.slice(0, 24))}…`);
      }
      walk(v, at, hits);
    }
  }
}

let bad = 0;
for (const file of jsonFiles(ROOT)) {
  const raw = readFileSync(file, "utf8");
  const hits = [];
  try {
    walk(JSON.parse(raw), "", hits);
  } catch {
    hits.push("不是合法 JSON");
  }
  for (const { name, re } of PATTERNS) {
    for (const m of raw.match(re) || [])
      hits.push(`${name}: ${m.slice(0, 40)}…`);
  }
  if (hits.length) {
    bad++;
    console.error(`✗ ${file}`);
    for (const h of hits) console.error(`    ${h}`);
  }
}

if (bad) {
  console.error(
    `\n❌ ${bad} 个 fixture 疑似未脱敏。误报请改成占位符（mock-token 等）或调整本脚本规则并说明理由。`,
  );
  process.exit(1);
}
console.log("✅ fixtures 脱敏检查通过");
