const path = require("path");
const { rimraf } = require("rimraf");

const cacheDir = path.join(__dirname, "../.next/cache/images");
const globPattern = `${cacheDir}/**/*`;

console.log("Deleting all files in:", globPattern);

rimraf(globPattern, { glob: true })
  .then(() => {
    console.log(`All cache files in 'images' directory have been deleted.`);
  })
  .catch((err) => {
    console.error(`Error removing cache files: ${err}`);
    process.exit(1);
  });
