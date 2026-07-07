const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = process.cwd();
const maxLines = 1000;
const checkedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".sass",
  ".less",
]);
const ignoredDirectories = new Set([
  ".git",
  ".husky",
  ".next",
  ".swc",
  "coverage",
  "dist",
  "node_modules",
  "public",
]);
const ignoredRelativeDirectories = new Set([
  path.join("locales"),
  path.join("src", "i18n", "generated"),
]);

function isIgnoredDirectory(relativePath, name) {
  if (ignoredDirectories.has(name)) {
    return true;
  }

  return ignoredRelativeDirectories.has(relativePath);
}

function isIgnoredFile(relativePath) {
  const parts = relativePath.split(path.sep);
  for (let index = 0; index < parts.length - 1; index += 1) {
    const directoryPath = parts.slice(0, index + 1).join(path.sep);
    if (isIgnoredDirectory(directoryPath, parts[index])) {
      return true;
    }
  }

  return false;
}

function countContentLines(content) {
  if (content.length === 0) {
    return 0;
  }

  const normalizedContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const newlineCount = (normalizedContent.match(/\n/g) || []).length;
  return normalizedContent.endsWith("\n") ? newlineCount : newlineCount + 1;
}

function countLines(filePath) {
  return countContentLines(fs.readFileSync(filePath, "utf8"));
}

function countStagedLines(relativePath) {
  const content = execFileSync("git", ["show", `:${relativePath}`], {
    cwd: root,
    encoding: "utf8",
  });
  return countContentLines(content);
}

function getStagedFiles() {
  const output = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
    { cwd: root, encoding: "utf8" },
  );

  return output.split(/\r?\n/).filter(Boolean);
}

function collectFilesFromDirectory(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (isIgnoredDirectory(relativePath, entry.name)) {
        continue;
      }

      collectFilesFromDirectory(fullPath, files);
      continue;
    }

    if (entry.isFile()) {
      files.push(relativePath);
    }
  }
}

function walk(dir) {
  const files = [];
  collectFilesFromDirectory(dir, files);
  return files;
}

const args = process.argv.slice(2);
const stagedMode = args.includes("--staged");

function resolveInputFiles() {
  if (stagedMode) {
    return getStagedFiles();
  }

  const explicitFiles = args.filter((arg) => !arg.startsWith("--"));
  if (explicitFiles.length > 0) {
    return explicitFiles;
  }

  return walk(root);
}

const violations = [];

for (const file of resolveInputFiles()) {
  const relativePath = path.normalize(file);
  const fullPath = path.resolve(root, relativePath);

  if (
    !fullPath.startsWith(root + path.sep) ||
    isIgnoredFile(relativePath) ||
    !checkedExtensions.has(path.extname(relativePath))
  ) {
    continue;
  }

  if (
    !stagedMode &&
    (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile())
  ) {
    continue;
  }

  const lineCount = stagedMode
    ? countStagedLines(relativePath)
    : countLines(fullPath);
  if (lineCount > maxLines) {
    violations.push({ file: relativePath, lineCount });
  }
}

if (violations.length > 0) {
  console.error(`Files must not exceed ${maxLines} lines.`);
  console.error("Split these files before committing:");
  for (const violation of violations.sort((a, b) =>
    a.file.localeCompare(b.file),
  )) {
    console.error(`- ${violation.file} (${violation.lineCount} lines)`);
  }
  process.exit(1);
}

console.log("file line limit check passed");
