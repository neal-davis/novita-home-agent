const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const { copyDir } = require("./utils");
const WebSocket = require("ws");
const { exec } = require("child_process");

const localEnv = process.argv.slice(2)[0];

if (!localEnv) {
  console.error("Error: No environment specified.");
  process.exit(1);
}

const envFolderPath = path.join(__dirname, `../../locales/${localEnv}/.env`);
const realEnvPath = path.join(__dirname, `../../.env`);
const publicFolderPath = path.join(
  __dirname,
  `../../locales/${localEnv}/public`,
);
const realPublicPath = path.join(__dirname, `../../public`);
const removeImageCacheJs = path.join(__dirname, `./remove-next-image-cache.js`);

const envWatcher = chokidar.watch(envFolderPath, { persistent: true });
const publicWatcher = chokidar.watch(publicFolderPath, { persistent: true });

const noticeReload = () => {
  console.log("noticeReload");
  try {
    const command = `node ${removeImageCacheJs}`;
    console.log(`Executing command: ${command}`);
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      if (stdout) {
        console.log(`stdout: ${stdout}`);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      console.log("clear cache image success");
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send("reload");
        }
      });
    });
  } catch (error) {
    console.log("error", error);
  }
};

const delFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting ${filePath}:`, err);
    }
  });
};

const delFolder = (dirPath) => {
  fs.rm(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.error(`Error removing ${dirPath}:`, err);
    }
  });
};

const copyFile = (destPath, sourcePath) => {
  fs.copyFile(sourcePath, destPath, (err) => {
    if (err) {
      console.error(`Error copying ${sourcePath}:`, err);
    }
  });
};

const getSuccFilename = (filePath, splitStr) => {
  return filePath.split(`${splitStr}`)[1];
};

const WS_PORT = 9999;
const wss = new WebSocket.Server({ port: WS_PORT });
wss.on("connection", (ws) => {
  console.log("WebSocket connection established");
});
wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});

const handlePublicWatcher = () => {
  const fileWatcher = publicWatcher;
  const realPath = realPublicPath;
  const connect = path.sep;
  const splitStr = `${connect}public${connect}`;

  fileWatcher
    .on("addDir", (filePath) => {
      const succFileName = getSuccFilename(filePath, splitStr);
      const realDirPath = succFileName
        ? `${realPath}${connect}${succFileName}`
        : realPath;
      if (!fs.existsSync(realDirPath)) {
        console.log(`Folder add: ${filePath}`);
        copyDir(filePath, realDirPath);
        noticeReload(succFileName);
      }
    })
    .on("add", (filePath) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error fetching file stats:", err);
          return;
        }
        const realFileName = `${realPath}${connect}${getSuccFilename(
          filePath,
          splitStr,
        )}`;
        if (!fs.existsSync(realFileName)) {
          console.log(`File add: ${filePath}`);
          copyFile(realFileName, filePath);
          noticeReload(getSuccFilename(filePath, splitStr));
        }
      });
    })
    .on("change", (filePath) => {
      console.log(`File changed: ${filePath}`);
      const succFileName = getSuccFilename(filePath, splitStr);
      const destPath = `${realPath}${connect}${succFileName}`;
      copyFile(destPath, filePath);
      noticeReload(succFileName);
    })
    .on("unlinkDir", (filePath) => {
      const succFileName = getSuccFilename(filePath, splitStr);
      const realDirPath = succFileName
        ? `${realPath}${connect}${succFileName}`
        : realPath;
      if (fs.existsSync(realDirPath)) {
        console.log(`Folder removed: ${filePath}`);
        delFolder(realDirPath);
        noticeReload(succFileName);
      }
    })
    .on("unlink", (filePath) => {
      const realFileName = `${realPath}${connect}${getSuccFilename(
        filePath,
        splitStr,
      )}`;
      if (fs.existsSync(realFileName)) {
        console.log(`File removed: ${filePath}`);
        delFile(realFileName);
        noticeReload(getSuccFilename(filePath, splitStr));
      }
    });
};

setTimeout(() => {
  envWatcher
    .on("add", (filePath) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error fetching file stats:", err);
          return;
        }
        if (!fs.existsSync(realEnvPath)) {
          console.log(`File add: ${filePath}`);
          copyFile(realEnvPath, filePath);
        }
      });
    })
    .on("change", (filePath) => {
      console.log(`File changed: ${filePath}`);
      copyFile(realEnvPath, filePath);
    })
    .on("unlink", (filePath) => {
      console.log(`File removed: ${filePath}`);
      delFile(realEnvPath);
    });

  handlePublicWatcher();
}, 1000);
