const path = require("path");
const { transformSource } = require("./shared");

module.exports = function i18nLoader(source) {
  const callback = this.async();
  const filePath = path.resolve(this.resourcePath);

  try {
    const result = transformSource(filePath, source);
    callback(null, result.code);
  } catch (error) {
    callback(error);
  }
};
