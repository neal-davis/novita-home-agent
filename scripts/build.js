const { execSync } = require("child_process");

const env = process.env.VERCEL_ENV;
const branch = process.env.VERCEL_GIT_COMMIT_REF;

// 质量门禁（pre-build-check + i18n:check）已移到 GitHub Actions（.github/workflows/ci.yml），
// 作为 PR 合并的 required status check。构建阶段只负责 next build。

if (env === "production" || branch === "main") {
  console.log("Building for production...");
  execSync("npm run build", { stdio: "inherit" });
} else {
  console.log("Building for test environment...");
  execSync("npm run build:test", { stdio: "inherit" });
}
