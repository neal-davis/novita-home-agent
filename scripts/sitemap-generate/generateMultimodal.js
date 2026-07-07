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

async function getMultimodalModels() {
  try {
    const response = await axios.get(
      `https://api-server.novita.ai/v1/product/multimodal-model/list`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const res = response.data;

    if (res?.configs && Array.isArray(res.configs)) {
      return res.configs;
    }
    return [];
  } catch (error) {
    console.error("Error fetching multimodal models:", error);
    return [];
  }
}

async function generateMultimodalSitemap() {
  const dirPath = path.join(__dirname, "../../locales/en/public");
  const filePath = path.join(dirPath, "sitemap-multimodal-model.xml");

  console.log("Starting multimodal sitemap generation...");
  console.log("Output directory:", dirPath);
  console.log("Output file:", filePath);
  const existingLastmods = readExistingLastmods(filePath);
  const generatedAt = formatDateToUTC();

  try {
    console.log("Fetching multimodal models from API...");
    const models = await getMultimodalModels();
    console.log(`Found ${models.length} multimodal models`);

    let urlCount = 0;
    const entries = [];
    models.forEach((model) => {
      const modelSeries = model.fusionConfig?.series;
      const modelName = model.fusionConfig?.name;

      // 只有当 series 和 name 都存在且 series 不为空时才生成 URL
      if (modelSeries && modelName && modelSeries.trim() !== "") {
        const url = `https://novita.ai/models/${modelSeries.toLowerCase()}/${modelName.toLowerCase()}`;
        const baseUrl = getBaseUrl(url);
        entries.push(
          renderUrlEntry(baseUrl, {
            changefreq: "weekly",
            lastmod: existingLastmods.get(baseUrl) || generatedAt,
            priority: "0.7",
          }),
        );
        urlCount++;
      }
    });

    writeSitemap(filePath, renderUrlset(entries));

    console.log("Multimodal sitemap generated successfully.");
    console.log(
      `Generated ${urlCount} multimodal model URLs, ${
        urlCount * LOCALES.length
      } localized URLs`,
    );
  } catch (error) {
    console.error("Error generating multimodal sitemap:", error);
  }
}

// If this script is run directly, generate the sitemap
if (require.main === module) {
  generateMultimodalSitemap().catch(console.error);
}

module.exports = {
  generateMultimodalSitemap,
};
