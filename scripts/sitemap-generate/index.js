const { generateLLMModel } = require("./generatellm");
const { generateMultimodalSitemap } = require("./generateMultimodal");
const { generateBlog } = require("./generateblog");
const {
  generateRootSitemapIndex,
  syncLocalizedStaticSitemaps,
} = require("./localized");

(async () => {
  await generateLLMModel();
  await generateMultimodalSitemap();
  await generateBlog();
  syncLocalizedStaticSitemaps();
  generateRootSitemapIndex();
})();
