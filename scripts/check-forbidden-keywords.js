const fs = require("fs");
const path = require("path");

const FORBIDDEN_KEYWORDS = [
  "ppinfra",
  "派欧",
  '"zh"',
  "_zh",
  "jiekou",
  "接口",
  "antd",
  "@ant-design/icons",
  "@ant-design/static-style-extract",
  "@mui/material",
  "@mui/system",
  "@mui/icons-material",
  "@material-ui/core",
  "@material-ui/icons",
];
const DIRS_TO_CHECK = [path.join(process.cwd(), "src")];
const FILES_TO_IGNORE = new Set([
  path.join(process.cwd(), "src/i18n/generated/messages.ts"),
]);

function searchFiles(dirs, keywords) {
  const results = [];

  function searchInFile(filePath) {
    if (FILES_TO_IGNORE.has(filePath)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        keywords.forEach((keyword) => {
          if (line.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({
              file: path.relative(process.cwd(), filePath),
              line: index + 1,
              keyword: keyword,
              content: line.trim(),
            });
          }
        });
      });
    } catch (error) {
      console.error(`Failed to read file: ${filePath}`, error);
    }
  }

  function walkDir(currentDir) {
    if (!fs.existsSync(currentDir)) {
      console.warn(`Directory does not exist: ${currentDir}`);
      return;
    }

    const files = fs.readdirSync(currentDir);

    files.forEach((file) => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile()) {
        searchInFile(filePath);
      }
    });
  }

  dirs.forEach((dir) => walkDir(dir));

  return results;
}

try {
  console.log(
    `Starting to check forbidden keywords: ${FORBIDDEN_KEYWORDS.join(
      ", ",
    )} in directories: ${DIRS_TO_CHECK.join(", ")}`,
  );

  const matches = searchFiles(DIRS_TO_CHECK, FORBIDDEN_KEYWORDS);

  if (matches.length > 0) {
    console.error("\nForbidden keywords found in following locations:\n");
    matches.forEach((match) => {
      console.error(`\x1b[31mFile: ${match.file}\x1b[0m`);
      console.error(`Line: ${match.line}`);
      console.error(`Keyword: ${match.keyword}`);
      console.error(`Content: ${match.content}`);
      console.error("\n");
    });
    process.exit(1);
  } else {
    console.log("Check passed: No forbidden keywords found");
    process.exit(0);
  }
} catch (error) {
  console.error("Error occurred during check:", error);
  process.exit(1);
}
