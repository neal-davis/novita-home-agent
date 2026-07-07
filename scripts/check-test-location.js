const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcDir = path.join(root, "src");
const testFilePattern = /\.(test|spec)\.(ts|tsx)$/;
const violations = [];

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (entry.name === "__tests__") {
        violations.push(relativePath);
      }
      walk(fullPath);
      continue;
    }

    if (entry.isFile() && testFilePattern.test(entry.name)) {
      violations.push(relativePath);
    }
  }
}

walk(srcDir);

if (violations.length > 0) {
  console.error("Test files must live under tests/unit/**.");
  console.error("Move these files or directories out of src:");
  for (const file of violations.sort()) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("test location check passed");
