const fs = require("fs");
const path = require("path");

const SITE_ORIGIN = "https://novita.ai";
const DEFAULT_LOCALE = "en";
const LOCALES = [
  { locale: "en", prefix: "", hreflang: "en" },
  { locale: "zh-CN", prefix: "zh", hreflang: "zh-CN" },
  { locale: "es", prefix: "es", hreflang: "es" },
  { locale: "pt-BR", prefix: "pt", hreflang: "pt-BR" },
  { locale: "fr", prefix: "fr", hreflang: "fr" },
  { locale: "de", prefix: "de", hreflang: "de" },
  { locale: "ja", prefix: "ja", hreflang: "ja" },
];

const LOCALIZED_PREFIXES = new Set(
  LOCALES.map((item) => item.prefix).filter(Boolean),
);

const URLSET_OPEN = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

const STATIC_SITEMAP_FILES = [
  "sitemap-page.xml",
  "sitemap-gpu.xml",
  "sitemap-image.xml",
  "sitemap-image-x.xml",
];

const ROOT_SITEMAP_FILES = [
  "sitemap-page.xml",
  "sitemap-image.xml",
  "sitemap-image-x.xml",
  "sitemap-gpu.xml",
  "sitemap-llm-model.xml",
  "sitemap-multimodal-model.xml",
  "sitemap-blog.xml",
  "sitemap-docs.xml",
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSiteUrl(value) {
  return new URL(value, SITE_ORIGIN);
}

function stripLocalePrefix(pathname) {
  const segments = pathname.split("/");
  const firstSegment = segments[1] || "";
  if (!LOCALIZED_PREFIXES.has(firstSegment)) return pathname || "/";

  const stripped = `/${segments.slice(2).join("/")}`.replace(/\/+$/, "");
  return stripped || "/";
}

function getBaseUrl(value) {
  const url = getSiteUrl(value);
  if (url.origin !== SITE_ORIGIN) return value;
  const pathname = stripLocalePrefix(url.pathname);
  const normalizedPathname = pathname === "/" ? "" : pathname;
  return `${SITE_ORIGIN}${normalizedPathname}${url.search}`;
}

function getLocalizedUrl(baseUrl, localeConfig) {
  const url = getSiteUrl(getBaseUrl(baseUrl));
  if (url.origin !== SITE_ORIGIN) return baseUrl;

  const pathname = stripLocalePrefix(url.pathname);
  const normalizedPathname = pathname === "/" ? "" : pathname;
  const localizedPathname =
    localeConfig.locale === DEFAULT_LOCALE
      ? normalizedPathname
      : `/${localeConfig.prefix}${normalizedPathname}`;

  return `${SITE_ORIGIN}${localizedPathname || ""}${url.search}`;
}

function isLocalizedSiteUrl(value) {
  const url = getSiteUrl(value);
  if (url.origin !== SITE_ORIGIN) return false;
  const firstSegment = url.pathname.split("/")[1] || "";
  return LOCALIZED_PREFIXES.has(firstSegment);
}

function getLocaleConfigs(localeConfigs = LOCALES) {
  const requestedLocales = new Set(
    localeConfigs.map((item) =>
      typeof item === "string" ? item : item.locale,
    ),
  );

  return LOCALES.filter((item) => requestedLocales.has(item.locale));
}

function getDefaultLocaleConfig() {
  return LOCALES.find((item) => item.locale === DEFAULT_LOCALE) || LOCALES[0];
}

function renderAlternateLinks(baseUrl, localeConfigs = LOCALES) {
  const configs = getLocaleConfigs(localeConfigs);
  const links = configs.map((localeConfig) => {
    return `        <xhtml:link rel="alternate" hreflang="${localeConfig.hreflang}" href="${escapeXml(
      getLocalizedUrl(baseUrl, localeConfig),
    )}" />`;
  });

  links.push(
    `        <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
      getLocalizedUrl(baseUrl, getDefaultLocaleConfig()),
    )}" />`,
  );

  return links.join("\n");
}

function renderUrlEntry(baseUrl, metadata = {}, localeConfigs = LOCALES) {
  return getLocaleConfigs(localeConfigs)
    .map((localeConfig) => {
      const loc = getLocalizedUrl(baseUrl, localeConfig);
      return [
        "    <url>",
        `        <loc>${escapeXml(loc)}</loc>`,
        metadata.lastmod
          ? `        <lastmod>${escapeXml(metadata.lastmod)}</lastmod>`
          : "",
        metadata.changefreq
          ? `        <changefreq>${escapeXml(metadata.changefreq)}</changefreq>`
          : "",
        metadata.priority
          ? `        <priority>${escapeXml(metadata.priority)}</priority>`
          : "",
        renderAlternateLinks(baseUrl, localeConfigs),
        "    </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
}

function renderUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${URLSET_OPEN}\n${entries.join(
    "\n",
  )}\n</urlset>`;
}

function renderSitemapIndex(fileNames) {
  const entries = fileNames.map((fileName) => {
    return [
      "    <sitemap>",
      `        <loc>${escapeXml(`${SITE_ORIGIN}/${fileName}`)}</loc>`,
      "    </sitemap>",
    ].join("\n");
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join(
    "\n",
  )}\n</sitemapindex>\n`;
}

function parseUrlEntries(xmlContent) {
  return Array.from(xmlContent.matchAll(/<url>([\s\S]*?)<\/url>/g)).map(
    ([, block]) => {
      const readTag = (tag) => {
        const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
        return match?.[1]?.trim() || "";
      };

      return {
        loc: readTag("loc"),
        lastmod: readTag("lastmod"),
        changefreq: readTag("changefreq"),
        priority: readTag("priority"),
      };
    },
  );
}

function writeSitemap(filePath, xmlContent) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, xmlContent);
}

function syncLocalizedStaticSitemaps() {
  const baseDir = path.join(__dirname, "../../locales/en/public");

  STATIC_SITEMAP_FILES.forEach((fileName) => {
    const filePath = path.join(baseDir, fileName);
    if (!fs.existsSync(filePath)) return;

    const entries = parseUrlEntries(fs.readFileSync(filePath, "utf8"))
      .filter((entry) => entry.loc)
      .filter((entry) => !isLocalizedSiteUrl(entry.loc));
    const xmlContent = renderUrlset(
      entries.map((entry) =>
        renderUrlEntry(entry.loc, {
          changefreq: entry.changefreq,
          lastmod: entry.lastmod,
          priority: entry.priority,
        }),
      ),
    );

    writeSitemap(filePath, xmlContent);
    console.log(
      `Localized ${fileName}: base=${entries.length}, total=${
        entries.length * LOCALES.length
      }`,
    );
  });
}

function generateRootSitemapIndex() {
  const filePath = path.join(__dirname, "../../locales/en/public/sitemap.xml");
  writeSitemap(filePath, renderSitemapIndex(ROOT_SITEMAP_FILES));
  console.log(
    `Root sitemap index generated with ${ROOT_SITEMAP_FILES.length} child sitemaps.`,
  );
}

module.exports = {
  DEFAULT_LOCALE,
  LOCALES,
  SITE_ORIGIN,
  generateRootSitemapIndex,
  getBaseUrl,
  getLocaleConfigs,
  renderUrlEntry,
  renderSitemapIndex,
  renderUrlset,
  syncLocalizedStaticSitemaps,
  writeSitemap,
};
