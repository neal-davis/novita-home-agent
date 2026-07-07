#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const prettier = require("prettier");
const {
  DEFAULT_SOURCE_DIR,
  ENTRY_LOCALE,
  LOCALES_DIR,
  MANIFEST_PATH,
  MESSAGES_DIR,
  decodeJsxEntities,
  extractMessagesFromSource,
  findUnsupportedMessagesFromSource,
  fromRoot,
  getMessageFile,
  getNamespace,
  hashFile,
  readJson,
  sortObject,
  walkSourceFiles,
  writeJson,
} = require("./shared");

const root = process.cwd();
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: true });

const DEFAULT_LOCALE = ENTRY_LOCALE;
const SUPPORTED_LOCALES = ["en", "zh-CN", "es", "pt-BR", "fr", "de", "ja"];
const LINT_BASELINE_PATH = ".i18n/lint-baseline.json";
const EXACT_PRESERVED_MESSAGE_VALUES = new Set([
  "GitHub",
  "Github",
  "Google",
  "Hugging Face",
  "Serverless",
  "Serverless Endpoints",
]);

function preserveProtectedTermsInCompiledValue(source, value, locale) {
  if (typeof source !== "string" || typeof value !== "string") return value;
  if (locale !== "zh-CN") return value;
  const lowerSource = source.toLowerCase();

  let next = value;
  if (lowerSource.includes("serverless endpoints")) {
    next = next.replace(/无服务器端点/g, "Serverless Endpoints");
  }
  if (lowerSource.includes("serverless")) {
    next = next.replace(/无服务器/g, "Serverless");
  }
  if (source.includes("GitHub")) {
    next = next.replace(/Github/g, "GitHub");
  }
  return next;
}

function parseArgs(argv) {
  const args = {
    _: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      args._.push(value);
      continue;
    }

    const [rawKey, inlineValue] = value.slice(2).split("=");
    if (rawKey.startsWith("no-")) {
      const key = rawKey
        .slice(3)
        .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      args[key] = false;
      continue;
    }

    const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const next = argv[index + 1];

    if (inlineValue !== undefined) {
      args[key] = inlineValue;
    } else if (next && !next.startsWith("--")) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }

  return args;
}

function manifestPath() {
  return path.join(root, MANIFEST_PATH);
}

function readManifest() {
  return readJson(manifestPath(), {
    files: {},
    version: 1,
  });
}

function writeManifest(manifest) {
  // 不写 generatedAt：该字段只写不读，固定行的时间戳会在并行分支间制造必然的
  // 合并冲突。增量检测靠每文件的 hash/entries（见 check()），与时间戳无关。
  const { generatedAt: _ignored, ...rest } = manifest;
  writeJson(manifestPath(), {
    ...rest,
    version: 1,
  });
}

function removeFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function scan(args) {
  const dir = args.dir || DEFAULT_SOURCE_DIR;
  const full = Boolean(args.full);
  const prune = args.prune !== false;
  const manifest = readManifest();
  const files = walkSourceFiles(dir);
  const scoped = new Set(files.map(fromRoot));
  let scanned = 0;
  let skipped = 0;
  let withMessages = 0;

  if (full || args.dir) {
    const scopeRoot = fromRoot(path.resolve(root, dir));
    for (const rel of Object.keys(manifest.files)) {
      const inScope = rel === scopeRoot || rel.startsWith(`${scopeRoot}/`);
      if (!inScope) continue;
      const absolute = path.join(root, rel);
      if (!scoped.has(rel) || !fs.existsSync(absolute)) {
        removeFileIfExists(getMessageFile(ENTRY_LOCALE, absolute));
        delete manifest.files[rel];
      }
    }
  }

  for (const filePath of files) {
    const rel = fromRoot(filePath);
    const fileHash = hashFile(filePath);
    const previous = manifest.files[rel];

    if (!full && !args.dir && previous?.hash === fileHash) {
      skipped += 1;
      continue;
    }

    const sourceText = fs.readFileSync(filePath, "utf8");
    const extracted = extractMessagesFromSource(filePath, sourceText);
    const messageFile = getMessageFile(ENTRY_LOCALE, filePath);

    scanned += 1;

    if (Object.keys(extracted.messages).length > 0) {
      writeJson(messageFile, extracted.messages);
      withMessages += 1;
    } else if (prune) {
      removeFileIfExists(messageFile);
    }

    manifest.files[rel] = {
      entries: extracted.entries,
      hash: fileHash,
      messageFile: fromRoot(messageFile),
      namespace: extracted.namespace,
    };
  }

  writeManifest(manifest);
  console.log(
    [
      "i18n scan finished",
      `scope=${dir}`,
      `scanned=${scanned}`,
      `skipped=${skipped}`,
      `filesWithMessages=${withMessages}`,
    ].join(" | "),
  );
}

function listJsonFiles(baseDir) {
  const files = [];
  if (!fs.existsSync(baseDir)) return files;

  function walk(current) {
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        walk(path.join(current, entry));
      }
      return;
    }

    if (current.endsWith(".json")) files.push(current);
  }

  walk(baseDir);
  return files.sort();
}

function readLocaleMessages(locale) {
  const baseDir = path.join(root, LOCALES_DIR, locale, MESSAGES_DIR);
  const messages = {};

  for (const filePath of listJsonFiles(baseDir)) {
    const rel = path.relative(baseDir, filePath).replace(/\.json$/, "");
    const namespace = rel.split(path.sep).join("/");
    const content = readJson(filePath, {});

    for (const [key, value] of Object.entries(content)) {
      messages[`${namespace}.${key}`] =
        typeof value === "string" ? decodeJsxEntities(value) : value;
    }
  }

  return messages;
}

function getCompiledMessages(locale) {
  const fallbackMessages = readLocaleMessages(DEFAULT_LOCALE);
  const localeMessages =
    locale === DEFAULT_LOCALE ? {} : readLocaleMessages(String(locale));
  const fallbackKeys = new Set(Object.keys(fallbackMessages));

  return sortObject({
    ...fallbackMessages,
    ...Object.fromEntries(
      Object.entries(localeMessages)
        .filter(
          ([key, value]) =>
            fallbackKeys.has(key) &&
            Boolean(value) &&
            !EXACT_PRESERVED_MESSAGE_VALUES.has(fallbackMessages[key]),
        )
        .map(([key, value]) => [
          key,
          preserveProtectedTermsInCompiledValue(
            fallbackMessages[key],
            value,
            locale,
          ),
        ]),
    ),
  });
}

function normalizePathForMatch(value) {
  return value
    .split(path.sep)
    .join("/")
    .replace(/^\.?\//, "")
    .replace(/\/$/, "");
}

function getScopedMessageFiles(sourceDir, args) {
  const files = listJsonFiles(sourceDir);
  if (!args.dir) return files;

  const scope = normalizePathForMatch(args.dir);
  return files.filter((filePath) => {
    const rel = normalizePathForMatch(path.relative(sourceDir, filePath));
    return rel === `${scope}.json` || rel.startsWith(`${scope}/`);
  });
}

function getProviderConfig(args) {
  return {
    apiKey:
      args.apiKey ||
      process.env.I18N_LLM_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.LLM_API_KEY,
    baseUrl:
      args.baseUrl ||
      process.env.I18N_LLM_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      process.env.LLM_BASE_URL ||
      "https://api.openai.com/v1",
    model:
      args.model ||
      process.env.I18N_LLM_MODEL ||
      process.env.OPENAI_MODEL ||
      process.env.LLM_MODEL ||
      "gpt-4o-mini",
  };
}

function getProtectedTerms(args) {
  const defaults = [
    "Novita AI",
    "GPU",
    "GPUs",
    "API",
    "APIs",
    "CUDA",
    "GitHub",
    "Github",
    "Google",
    "Hugging Face",
    "LoRA",
    "LLM",
    "LLMs",
    "OpenAI",
    "Serverless",
    "Serverless Endpoints",
    "vCPU",
    "VRAM",
  ];
  const extra = String(args.terms || process.env.I18N_PROTECTED_TERMS || "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

  return [...new Set([...defaults, ...extra])];
}

function chunkEntries(entries, maxEntries) {
  const chunks = [];
  for (let index = 0; index < entries.length; index += maxEntries) {
    chunks.push(entries.slice(index, index + maxEntries));
  }
  return chunks;
}

function buildTranslatePrompt({ entries, locale, protectedTerms }) {
  return [
    {
      role: "system",
      content: [
        "You are a professional product localization translator.",
        `Translate the JSON values from English to ${locale}.`,
        "Return only a valid JSON object with exactly the same keys.",
        "Do not add explanations, markdown fences, comments, or extra keys.",
        "Preserve placeholders like {name}, %s, <tag>, URLs, code snippets, model names, API parameters, and whitespace-significant symbols.",
        `Do not translate these protected terms unless grammar absolutely requires it: ${protectedTerms.join(", ")}.`,
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(Object.fromEntries(entries), null, 2),
    },
  ];
}

function parseJsonObject(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("LLM response did not contain a valid JSON object");
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runNext() {
    const index = nextIndex;
    nextIndex += 1;

    if (index >= items.length) return;

    results[index] = await worker(items[index], index);
    await runNext();
  }

  const workerCount = Math.min(items.length, Math.max(1, concurrency));
  await Promise.all(
    Array.from({ length: workerCount }, () => {
      return runNext();
    }),
  );

  return results;
}

async function requestChatCompletion(provider, body, args) {
  const retries = Number(
    args.retries ?? process.env.I18N_TRANSLATE_RETRIES ?? 3,
  );
  const timeoutMs = Number(
    args.timeoutMs ?? process.env.I18N_TRANSLATE_TIMEOUT_MS ?? 90000,
  );
  const url = `${provider.baseUrl.replace(/\/$/, "")}/chat/completions`;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `LLM request failed: ${response.status} ${await response.text()}`,
        );
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt >= retries) break;
      console.warn(
        `[translate] request failed, retrying ${attempt}/${retries - 1}: ${error.message}`,
      );
      await sleep(Math.min(1000 * 2 ** attempt, 10000));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function translateEntriesWithLLM(entries, locale, args) {
  const provider = getProviderConfig(args);
  if (!provider.apiKey) {
    throw new Error(
      "Missing LLM API key. Set I18N_LLM_API_KEY in .env.local or pass --api-key.",
    );
  }

  const response = await requestChatCompletion(
    provider,
    {
      messages: buildTranslatePrompt({
        entries,
        locale,
        protectedTerms: getProtectedTerms(args),
      }),
      model: provider.model,
      response_format: { type: "json_object" },
      temperature: Number(
        args.temperature ?? process.env.I18N_LLM_TEMPERATURE ?? 0,
      ),
    },
    args,
  );

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM response did not include choices[0].message.content");
  }

  const translated = parseJsonObject(content);
  const result = {};
  for (const [key, fallback] of entries) {
    result[key] =
      typeof translated[key] === "string" && translated[key].trim()
        ? translated[key]
        : fallback;
  }
  return result;
}

function writePublicMessages(locale, messages) {
  const relativePath = path.join("i18n", `${locale}.json`);
  const outputTargets = [
    path.join(root, "public", relativePath),
    path.join(root, LOCALES_DIR, ENTRY_LOCALE, "public", relativePath),
  ];

  for (const outputPath of outputTargets) {
    writeJson(outputPath, messages);
  }
}

async function compile() {
  const outputPath = path.join(root, "src/i18n/generated/messages.ts");
  const messagesByLocale = sortObject(
    SUPPORTED_LOCALES.reduce((acc, locale) => {
      const messages = getCompiledMessages(locale);
      acc[locale] = messages;
      writePublicMessages(locale, messages);
      return acc;
    }, {}),
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const content = [
    "/* eslint-disable */",
    "// This file is generated by scripts/i18n. Do not edit manually.",
    `export const supportedLocales = ${JSON.stringify(SUPPORTED_LOCALES)} as const;`,
    `const messagesByLocale: Record<(typeof supportedLocales)[number], Record<string, string>> = ${JSON.stringify(messagesByLocale, null, 2)};`,
    "export default messagesByLocale;",
    "",
  ].join("\n");
  fs.writeFileSync(
    outputPath,
    await prettier.format(content, { parser: "typescript" }),
  );

  console.log(
    [
      "i18n compile finished",
      `locales=${SUPPORTED_LOCALES.join(",")}`,
      `messages=${Object.keys(messagesByLocale[DEFAULT_LOCALE]).length}`,
    ].join(" | "),
  );
}

function report(args) {
  const dir = args.dir || DEFAULT_SOURCE_DIR;
  const files = walkSourceFiles(dir);
  const reportFiles = [];
  const kindCounts = {};
  let totalMessages = 0;

  for (const filePath of files) {
    const sourceText = fs.readFileSync(filePath, "utf8");
    const extracted = extractMessagesFromSource(filePath, sourceText);
    const count = extracted.entries.length;
    if (count === 0) continue;

    totalMessages += count;
    for (const entry of extracted.entries) {
      kindCounts[entry.kind] = (kindCounts[entry.kind] || 0) + 1;
    }

    reportFiles.push({
      count,
      file: fromRoot(filePath),
      kinds: extracted.entries.reduce((acc, entry) => {
        acc[entry.kind] = (acc[entry.kind] || 0) + 1;
        return acc;
      }, {}),
      namespace: getNamespace(filePath),
      sample: extracted.entries.slice(0, 5).map((entry) => ({
        key: entry.key,
        kind: entry.kind,
        loc: entry.loc,
        text: entry.text,
      })),
    });
  }

  reportFiles.sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));

  const payload = {
    generatedAt: new Date().toISOString(),
    scope: dir,
    summary: {
      filesWithMessages: reportFiles.length,
      kindCounts: sortObject(kindCounts),
      scannedFiles: files.length,
      totalMessages,
    },
    topFiles: reportFiles.slice(0, Number(args.top || 30)),
  };

  const outputPath = path.join(root, ".i18n/report.json");
  writeJson(outputPath, payload);

  console.log(
    [
      "i18n report finished",
      `scope=${dir}`,
      `scanned=${files.length}`,
      `filesWithMessages=${reportFiles.length}`,
      `messages=${totalMessages}`,
      `output=${fromRoot(outputPath)}`,
    ].join(" | "),
  );

  console.log("Kinds:", JSON.stringify(payload.summary.kindCounts));
}

async function translate(args) {
  const locale = args.locale;
  if (!locale || locale === ENTRY_LOCALE) {
    throw new Error(
      "Usage: node scripts/i18n/index.js translate --locale <locale>",
    );
  }

  const sourceDir = path.join(root, LOCALES_DIR, ENTRY_LOCALE, MESSAGES_DIR);
  const targetDir = path.join(root, LOCALES_DIR, locale, MESSAGES_DIR);
  const files = getScopedMessageFiles(sourceDir, args);
  const maxEntries = Number(
    args.chunkSize || process.env.I18N_TRANSLATE_CHUNK_SIZE || 40,
  );
  const dryRun = Boolean(args.dryRun);
  const scaffold = Boolean(args.scaffold);
  let created = 0;
  let updated = 0;
  let translatedCount = 0;
  let missingCount = 0;

  for (const [fileIndex, sourceFile] of files.entries()) {
    const rel = path.relative(sourceDir, sourceFile);
    const targetFile = path.join(targetDir, rel);
    const source = readJson(sourceFile, {});
    const target = readJson(targetFile, {});
    const next = { ...target };
    const missingEntries = Object.entries(source).filter(
      ([key]) => next[key] === undefined || next[key] === "",
    );

    missingCount += missingEntries.length;

    if (missingEntries.length > 0) {
      if (dryRun) {
        console.log(
          `[dry-run] ${rel}: ${missingEntries.length} missing translations`,
        );
      } else if (scaffold) {
        for (const [key, value] of missingEntries) {
          next[key] = value;
        }
        translatedCount += missingEntries.length;
      } else {
        const chunks = chunkEntries(missingEntries, maxEntries);
        console.log(
          `[translate:${locale}] ${fileIndex + 1}/${files.length} ${rel}: ${missingEntries.length} missing, ${chunks.length} request(s)`,
        );
        for (const [chunkIndex, chunk] of chunks.entries()) {
          const translated = await translateEntriesWithLLM(chunk, locale, args);
          Object.assign(next, translated);
          translatedCount += Object.keys(translated).length;
          if (chunks.length > 1) {
            console.log(
              `[translate:${locale}] ${rel}: chunk ${chunkIndex + 1}/${chunks.length} finished`,
            );
          }
        }
      }
    }

    if (args.prune) {
      for (const key of Object.keys(next)) {
        if (source[key] === undefined) {
          delete next[key];
        }
      }
    }

    const changed =
      JSON.stringify(sortObject(target)) !== JSON.stringify(sortObject(next));
    if (!dryRun && (changed || !fs.existsSync(targetFile))) {
      const existed = fs.existsSync(targetFile);
      writeJson(targetFile, next);
      existed ? (updated += 1) : (created += 1);
    }
  }

  console.log(
    [
      "i18n translate finished",
      `locale=${locale}`,
      args.dir ? `scope=${args.dir}` : "scope=all",
      `files=${files.length}`,
      `missing=${missingCount}`,
      `translated=${dryRun ? 0 : translatedCount}`,
      `updated=${updated}`,
      `created=${created}`,
      dryRun ? "dryRun=true" : null,
      scaffold ? "scaffold=true" : null,
    ]
      .filter(Boolean)
      .join(" | "),
  );
}

async function translateAll(args) {
  const locales = SUPPORTED_LOCALES.filter((locale) => locale !== ENTRY_LOCALE);
  const concurrency = toPositiveInteger(
    args.localeConcurrency ||
      args.concurrency ||
      process.env.I18N_TRANSLATE_LOCALE_CONCURRENCY ||
      locales.length,
    locales.length,
  );
  const normalizedConcurrency = Math.min(locales.length, concurrency);

  console.log(
    [
      "i18n translate all started",
      `locales=${locales.join(",")}`,
      `localeConcurrency=${normalizedConcurrency}`,
      args.dir ? `scope=${args.dir}` : "scope=all",
      args.dryRun ? "dryRun=true" : null,
      args.scaffold ? "scaffold=true" : null,
    ]
      .filter(Boolean)
      .join(" | "),
  );

  const results = await runWithConcurrency(
    locales,
    normalizedConcurrency,
    async (locale) => {
      try {
        await translate({ ...args, all: false, locale });
        return { locale, status: "fulfilled" };
      } catch (error) {
        return { error, locale, status: "rejected" };
      }
    },
  );

  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(
        `[translate:${failure.locale}] failed: ${failure.error?.message || failure.error}`,
      );
    }
    throw new Error(
      `i18n translate all failed | failedLocales=${failures.map((failure) => failure.locale).join(",")}`,
    );
  }

  console.log(
    `i18n translate all finished | locales=${locales.join(",")} | failed=0`,
  );
}

function check(args) {
  const normalizeEntry = (entry) => JSON.stringify(entry);
  const currentManifestPath = manifestPath();
  const originalManifestText = fs.existsSync(currentManifestPath)
    ? fs.readFileSync(currentManifestPath, "utf8")
    : null;
  const before = readManifest().files;
  scan({ ...args, full: false });
  const after = readManifest().files;

  const staleFiles = [];
  for (const rel of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (normalizeEntry(before[rel]) !== normalizeEntry(after[rel])) {
      staleFiles.push(rel);
    }
  }

  if (staleFiles.length > 0) {
    console.error(
      [
        "",
        "✖ i18n check failed: generated messages are out of date.",
        "",
        "  The following source files contain i18n changes that have not been",
        "  scanned (their extracted messages / manifest entries are stale):",
        "",
        ...staleFiles.map((rel) => `    - ${rel}`),
        "",
        "  How to fix:",
        "    1. Run:  npm run i18n:scan && npm run i18n:compile",
        "    2. Review the regenerated files (messages catalogs + manifest)",
        "    3. Stage them:  git add <generated files>",
        "    4. Commit again",
        "",
        "  Tip: this check has already regenerated the stale message files in",
        "  your working tree, so usually you only need to `git add` them.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
  if (originalManifestText !== null) {
    fs.writeFileSync(currentManifestPath, originalManifestText);
  }
}

function getLintFiles(args) {
  if (args.files) {
    const explicitFiles = typeof args.files === "string" ? [args.files] : [];
    return [...explicitFiles, ...args._.slice(1)]
      .map((filePath) => path.resolve(root, filePath))
      .filter((filePath) => {
        if (!fs.existsSync(filePath)) return false;
        if (!/\.[tj]sx?$/.test(filePath)) return false;
        if (filePath.endsWith(".d.ts")) return false;
        if (!fromRoot(filePath).startsWith(`${DEFAULT_SOURCE_DIR}/`))
          return false;
        return fs.statSync(filePath).isFile();
      });
  }

  return walkSourceFiles(args.dir || DEFAULT_SOURCE_DIR);
}

function readLintBaseline() {
  return readJson(path.join(root, LINT_BASELINE_PATH), {
    issues: [],
    version: 1,
  });
}

function writeLintBaseline(issues) {
  const deduped = Array.from(
    new Map(
      issues
        .sort(
          (a, b) => a.file.localeCompare(b.file) || a.loc.localeCompare(b.loc),
        )
        .map((issue) => [
          issue.hash,
          {
            context: issue.context,
            file: issue.file,
            hash: issue.hash,
            kind: issue.kind,
            text: issue.text,
          },
        ]),
    ).values(),
  );

  // 同 writeManifest：不写 generatedAt，避免固定行时间戳造成合并冲突。
  writeJson(path.join(root, LINT_BASELINE_PATH), {
    issues: deduped,
    version: 1,
  });
}

function lint(args) {
  const files = getLintFiles(args);
  const issues = [];

  for (const filePath of files) {
    const sourceText = fs.readFileSync(filePath, "utf8");
    issues.push(...findUnsupportedMessagesFromSource(filePath, sourceText));
  }

  if (args.updateBaseline) {
    writeLintBaseline(issues);
    console.log(
      [
        "i18n lint baseline updated",
        `files=${files.length}`,
        `issues=${issues.length}`,
        `output=${LINT_BASELINE_PATH}`,
      ].join(" | "),
    );
    return;
  }

  const baseline = new Set(
    readLintBaseline()
      .issues.map((issue) => issue.hash)
      .filter(Boolean),
  );
  const newIssues = issues.filter((issue) => !baseline.has(issue.hash));

  if (newIssues.length === 0) {
    console.log(
      [
        "i18n lint passed",
        `files=${files.length}`,
        `issues=${issues.length}`,
        `newIssues=0`,
      ].join(" | "),
    );
    return;
  }

  const maxReport = Number(args.maxReport || 50);
  console.error(
    [
      "i18n lint failed: found user-facing text that the automatic extractor cannot safely translate.",
      `files=${files.length}`,
      `newIssues=${newIssues.length}`,
    ].join("\n"),
  );
  console.error("");
  console.error(
    "Move the text inline into JSX/supported props, rename supported object fields, or add i18n-disable-next-line for intentional non-translatable strings.",
  );
  console.error("");

  for (const issue of newIssues.slice(0, maxReport)) {
    console.error(
      `${issue.file}:${issue.loc} [${issue.context}] ${issue.text}`,
    );
  }

  if (newIssues.length > maxReport) {
    console.error(`...and ${newIssues.length - maxReport} more.`);
  }

  process.exit(1);
}

function printHelp() {
  console.log(`novita i18n

Commands:
  scan [--dir <path>] [--full] [--no-prune]
  report [--dir <path>] [--top <number>]
  lint [--dir <path>] [--files <file...>] [--update-baseline] [--max-report <number>]
  compile [--locale <locale>]
  compile --all
  translate --locale <locale> [--dir <path>] [--dry-run] [--scaffold] [--base-url <url>] [--model <name>] [--api-key <key>] [--prune]
  translate --all [--dir <path>] [--locale-concurrency <number>] [--dry-run] [--scaffold] [--base-url <url>] [--model <name>] [--api-key <key>] [--prune]
  check [--dir <path>]
`);
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || "scan";

if (command === "scan") scan(args);
else if (command === "report") report(args);
else if (command === "lint") lint(args);
else if (command === "compile")
  compile(args).catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
else if (command === "translate")
  (args.all ? translateAll(args) : translate(args)).catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
else if (command === "check") check(args);
else {
  printHelp();
  process.exit(command === "help" || command === "--help" ? 0 : 1);
}
