const axios = require("axios");
const fs = require("fs");
const path = require("path");
const {
  getBaseUrl,
  renderUrlEntry,
  renderUrlset,
  writeSitemap,
  LOCALES,
} = require("./localized");

const formatDateToUTC = () => {
  return new Date().toISOString();
};

function readExistingLastmods(filePath) {
  if (!fs.existsSync(filePath)) return new Map();

  const content = fs.readFileSync(filePath, "utf8");
  return new Map(
    Array.from(
      content.matchAll(
        /<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g,
      ),
    ).map(([, loc, lastmod]) => [loc, lastmod]),
  );
}

async function getLLMModels() {
  try {
    const response = await axios.get(`https://api.novita.ai/openai/v1/models`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = response.data;

    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching LLM models:", error);
    return [];
  }
}

function generateModelDetailUrl(model) {
  return model.id?.replaceAll("/", "-");
}

async function generateLLMModel() {
  const dirPath = path.join(__dirname, "../../locales/en/public");
  const filePath = path.join(dirPath, "sitemap-llm-model.xml");
  const existingLastmods = readExistingLastmods(filePath);
  const generatedAt = formatDateToUTC();

  try {
    const models = await getLLMModels();

    const entries = [];
    models.forEach((model) => {
      const modelId = generateModelDetailUrl(model);
      if (modelId) {
        const url = `https://novita.ai/models/model-detail/${modelId}`;
        const baseUrl = getBaseUrl(url);
        entries.push(
          renderUrlEntry(baseUrl, {
            changefreq: "weekly",
            lastmod: existingLastmods.get(baseUrl) || generatedAt,
            priority: "0.7",
          }),
        );
      }
    });

    writeSitemap(filePath, renderUrlset(entries));

    console.log("Model detail sitemap generated successfully.");
    console.log(
      `Generated ${models.length} model detail URLs, ${
        models.length * LOCALES.length
      } localized URLs`,
    );
  } catch (error) {
    console.error("Error generating model detail sitemap:", error);
  }
}

module.exports = {
  generateLLMModel,
};
