const fs = require("fs");
const path = require("path");
const COS = require("cos-nodejs-sdk-v5");

const args = process.argv.slice(2);
const nextStaticFile = path.resolve(__dirname, "../../.next/static");
const publicFile = path.resolve(__dirname, "../../public");

const Bucket = process.env.Bucket;
const Region = process.env.Region;
const SecretId = process.env.SecretId;
const SecretKey = process.env.SecretKey;

const cos = new COS({
  SecretId: SecretId,
  SecretKey: SecretKey,
});

const version = args[0] ? `${args[0]}` : `${new Date().getTime()}`;

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });

  return arrayOfFiles;
}

async function uploadFile(bucket, key, filePath) {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: bucket,
        Region: Region,
        Key: key,
        StorageClass: "STANDARD",
        Body: fs.createReadStream(filePath),
        Headers: {
          "Access-Control-Allow-Origin": "*",
        }
      },
      function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      },
    );
  });
}

async function retry(operation, maxRetries) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      await operation();
      return; // 成功执行，不再重试
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        throw error; // 达到最大重试次数，抛出错误
      }
      console.log(`Retrying (${attempts}/${maxRetries})...`);
    }
  }
}

async function main() {
  const files = getAllFiles(nextStaticFile);
  const totalFiles = files.length;
  let uploadedFiles = 0;

  for (const filePath of files) {
    const relativeFilePath = path
      .relative(nextStaticFile, filePath)
      .replace(/\\/g, "/");
    const key = `${version}/_next/static/${relativeFilePath}`;

    await retry(() => uploadFile(Bucket, key, filePath), 3);
    uploadedFiles++;
    console.log(`Uploaded ${uploadedFiles}/${totalFiles} files`);
  }

  const publicFiles = getAllFiles(publicFile);
  const totalPublicFiles = publicFiles.length;
  let uploadedPublicFiles = 0;
  for (const filePath of publicFiles) {
    const relativeFilePath = path
      .relative(publicFile, filePath)
      .replace(/\\/g, "/");
    const key = `${relativeFilePath}`;

    await retry(() => uploadFile(Bucket, key, filePath), 3);
    uploadedPublicFiles++;
    console.log(`Uploaded ${uploadedPublicFiles}/${totalPublicFiles} public files`);
  }
}

main().catch((err) => {
  console.error("Failed to upload files:", err);
  process.exit(1);
});
