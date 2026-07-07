#!/usr/bin/env node

/**
 * One-shot migration for i18n key scheme changes.
 *
 * Renames keys inside locales/<locale>/messages/** so existing translations
 * follow their source text when the key derivation changes (e.g. the move
 * from order-dependent counter suffixes to content-hash suffixes). The old
 * assignment is read from .i18n/manifest.json (written by the last scan), the
 * new assignment is recomputed from the current sources, and the two are
 * matched by source-text hash.
 *
 * Run BEFORE `i18n:scan` rewrites the manifest, then run
 * `i18n:scan -- --full` and `i18n:compile`.
 */

const fs = require("fs");
const path = require("path");
const {
  LOCALES_DIR,
  MANIFEST_PATH,
  MESSAGES_DIR,
  extractMessagesFromSource,
  readJson,
  writeJson,
} = require("./shared");

const root = process.cwd();
const SUPPORTED_LOCALES = ["en", "zh-CN", "es", "pt-BR", "fr", "de", "ja"];

function migrate() {
  const manifest = readJson(path.join(root, MANIFEST_PATH), { files: {} });
  let renamedKeys = 0;
  let touchedSourceFiles = 0;
  let touchedLocaleFiles = 0;

  for (const [rel, info] of Object.entries(manifest.files)) {
    const absolute = path.join(root, rel);
    if (!fs.existsSync(absolute) || !Array.isArray(info.entries)) continue;

    const sourceText = fs.readFileSync(absolute, "utf8");
    const next = extractMessagesFromSource(absolute, sourceText);
    const newKeyByHash = new Map(
      next.entries.map((entry) => [entry.hash, entry.key]),
    );

    const renames = new Map();
    for (const entry of info.entries) {
      const newKey = newKeyByHash.get(entry.hash);
      if (newKey && newKey !== entry.key) {
        renames.set(entry.key, newKey);
      }
    }
    if (renames.size === 0) continue;

    touchedSourceFiles += 1;

    for (const locale of SUPPORTED_LOCALES) {
      const messageFile = path.join(
        root,
        LOCALES_DIR,
        locale,
        MESSAGES_DIR,
        `${info.namespace}.json`,
      );
      if (!fs.existsSync(messageFile)) continue;

      const content = readJson(messageFile, {});
      let changed = false;
      for (const [oldKey, newKey] of renames) {
        if (
          Object.prototype.hasOwnProperty.call(content, oldKey) &&
          !Object.prototype.hasOwnProperty.call(content, newKey)
        ) {
          content[newKey] = content[oldKey];
          delete content[oldKey];
          changed = true;
          renamedKeys += 1;
        }
      }

      if (changed) {
        writeJson(messageFile, content);
        touchedLocaleFiles += 1;
      }
    }
  }

  console.log(
    [
      "i18n migrate-keys finished",
      `sourceFiles=${touchedSourceFiles}`,
      `localeFiles=${touchedLocaleFiles}`,
      `renamedKeys=${renamedKeys}`,
    ].join(" | "),
  );
}

migrate();
