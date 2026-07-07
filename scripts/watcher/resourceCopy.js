const { CopyFileFun } = require("./utils");

(async () => {
  const localeEnv = process.argv.slice(2)[0];
  const env = process.argv.slice(2)[1];
  console.log("🚀 locale: ", localeEnv, env);
  if (env === "test") {
    await CopyFileFun(localeEnv, "test")
  } else {
    await CopyFileFun(localeEnv);
  }
})();
