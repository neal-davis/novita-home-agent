#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const standaloneDir = path.join(root, ".next/standalone");
const standaloneServer = path.join(standaloneDir, "server.js");

function copyDir(source, target) {
  if (!fs.existsSync(source)) return;
  fs.rmSync(target, { force: true, recursive: true });
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

if (!fs.existsSync(standaloneServer)) {
  console.error(
    "Missing .next/standalone/server.js. Run npm run build or npm run build:zh first.",
  );
  process.exit(1);
}

copyDir(
  path.join(root, ".next/static"),
  path.join(standaloneDir, ".next/static"),
);
copyDir(path.join(root, "public"), path.join(standaloneDir, "public"));
