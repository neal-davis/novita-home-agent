const fs = require("fs");
const path = require("path");

async function copyFile(source, destination, callback) {
  await fs.copyFile(source, destination, (err) => {
    if (err) {
      console.error("❌【copy file】", source, " ==> ", destination, err);
    }
  });
}

async function copyDir(src, dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  fs.mkdirSync(dest, { recursive: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath, (err) => {
        if (err) {
          console.error("❌【copy file】", srcPath, " ==> ", destPath, err);
        }
      });
    }
  }
}

async function CopyFileFun(locale, env) {
  await Promise.all([
    copyDir(
      path.join(__dirname, `../../locales/${locale}/public`),
      path.join(__dirname, "../../public"),
    ),
    copyFile(
      path.join(
        __dirname,
        `../../locales/${locale}/.env${env === "test" ? ".test" : ""}`,
      ),
      path.join(__dirname, `../../.env`),
    ),
  ]);
  console.log("🚀 copy resource finished");
}

module.exports = {
  CopyFileFun,
  copyFile,
  copyDir,
};
