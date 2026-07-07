/**
 * Detects __t() calls that the i18n loader emits at module scope.
 *
 * A module-scope __t() is evaluated once, when the chunk loads, and the
 * resulting string is frozen in whatever locale was active at that moment —
 * it never updates when the user switches languages (see
 * src/app/homepage/components/Testimonials.tsx for the canonical fix:
 * convert the constant into a function called during render).
 *
 * Usage:
 *   node scripts/i18n/check-frozen-module-scope.js            # check vs allowlist
 *   node scripts/i18n/check-frozen-module-scope.js --list     # print all findings
 *   node scripts/i18n/check-frozen-module-scope.js --list <file...>  # findings for files
 *   node scripts/i18n/check-frozen-module-scope.js --update-allowlist
 *
 * The default mode fails (exit 1) when a file has more module-scope __t()
 * calls than the committed allowlist permits, so new regressions are caught
 * while the existing backlog is burned down incrementally.
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { transformSource } = require("./shared");

const ROOT = path.resolve(__dirname, "..", "..");
const SRC_DIR = path.join(ROOT, "src");
const ALLOWLIST_PATH = path.join(
  __dirname,
  "frozen-module-scope-allowlist.json",
);

function* walkFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^(node_modules|__tests__|generated)$/.test(entry.name)) continue;
      yield* walkFiles(fullPath);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) {
      yield fullPath;
    }
  }
}

function isFunctionLike(node) {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isGetAccessor(node) ||
    ts.isConstructorDeclaration(node)
  );
}

function findModuleScopeTranslations(filePath) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  let transformed;
  try {
    transformed = transformSource(filePath, sourceText);
  } catch {
    return [];
  }
  if (!transformed.code.includes("__t(")) return [];

  const sourceFile = ts.createSourceFile(
    filePath,
    transformed.code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const findings = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "__t"
    ) {
      let current = node.parent;
      let insideFunction = false;
      while (current) {
        if (isFunctionLike(current)) {
          insideFunction = true;
          break;
        }
        current = current.parent;
      }
      if (!insideFunction) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile),
        );
        const keyArgument = node.arguments[0];
        findings.push({
          key:
            keyArgument && ts.isStringLiteral(keyArgument)
              ? keyArgument.text
              : "<dynamic>",
          line: line + 1,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return findings;
}

function scan(files) {
  const counts = {};
  const details = {};
  for (const filePath of files) {
    const findings = findModuleScopeTranslations(filePath);
    if (!findings.length) continue;
    const relativePath = path.relative(ROOT, filePath);
    counts[relativePath] = findings.length;
    details[relativePath] = findings;
  }
  return { counts, details };
}

function readAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return {};
  return JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
}

function main() {
  const args = process.argv.slice(2);
  const listMode = args.includes("--list");
  const updateMode = args.includes("--update-allowlist");
  const fileArgs = args.filter((arg) => !arg.startsWith("--"));

  const files = fileArgs.length
    ? fileArgs.map((file) => path.resolve(ROOT, file))
    : [...walkFiles(SRC_DIR)];
  const { counts, details } = scan(files);

  if (listMode) {
    for (const [file, findings] of Object.entries(details)) {
      console.log(`${file} (${findings.length})`);
      for (const finding of findings) {
        console.log(`  line ${finding.line}  ${finding.key}`);
      }
    }
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    console.log(`\nTOTAL: ${Object.keys(counts).length} files, ${total} calls`);
    return;
  }

  if (updateMode) {
    const sorted = Object.fromEntries(
      Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)),
    );
    fs.writeFileSync(ALLOWLIST_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
    console.log(
      `Allowlist updated: ${Object.keys(sorted).length} files in ${path.relative(ROOT, ALLOWLIST_PATH)}`,
    );
    return;
  }

  const allowlist = readAllowlist();
  const violations = [];
  for (const [file, count] of Object.entries(counts)) {
    const allowed = allowlist[file] || 0;
    if (count > allowed) {
      violations.push({ allowed, count, file });
    }
  }

  if (violations.length) {
    console.error(
      "Module-scope __t() calls found — these strings freeze in the locale active at chunk load and never update on language switch.\n" +
        "Fix: move the constant into a function called during render (see src/app/homepage/components/Testimonials.tsx), or run with --list <file> for details.\n",
    );
    for (const violation of violations) {
      console.error(
        `  ${violation.file}: ${violation.count} (allowlisted: ${violation.allowed})`,
      );
    }
    process.exit(1);
  }

  console.log("No new module-scope __t() calls.");
}

main();
