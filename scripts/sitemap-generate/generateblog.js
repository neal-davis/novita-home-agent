const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const {
  DEFAULT_LOCALE,
  LOCALES,
  SITE_ORIGIN,
  renderUrlEntry,
  renderUrlset,
  writeSitemap,
} = require("./localized");

// Mirrors src/lib/blog/config.ts defaults; this build script is CJS and cannot
// import the TS lib, so it reads the same env vars / defaults independently.
const GITHUB_API = "https://api.github.com";
const BLOG_REPO = process.env.BLOG_REPO || "novitalabs/Novita-home-blogs";
const BLOG_REPO_BRANCH = process.env.BLOG_REPO_BRANCH || "main";
const BLOG_CONTENT_REF =
  process.env.BLOG_CONTENT_REF ||
  process.env.BLOG_REPO_COMMIT ||
  process.env.BLOG_REPO_SHA ||
  "";
const BLOG_ARTICLES_DIR = process.env.BLOG_ARTICLES_DIR || "articles";
const BLOG_TRANSLATIONS_DIR =
  process.env.BLOG_TRANSLATIONS_DIR || "translations";
const BLOG_ROUTE_BASE = "/blog";

function githubHeaders(accept) {
  const headers = { Accept: accept, "X-GitHub-Api-Version": "2022-11-28" };
  const token = process.env.BLOG_REPO_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function encodeGitHubPath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}

function getGitRefPath(branch) {
  return branch.split("/").map(encodeURIComponent).join("/");
}

function getArticleDirectory(locale = DEFAULT_LOCALE) {
  if (locale === DEFAULT_LOCALE) return BLOG_ARTICLES_DIR;
  return `${BLOG_TRANSLATIONS_DIR}/${locale}`;
}

function getContentsUrl(filePath, ref) {
  return `${GITHUB_API}/repos/${BLOG_REPO}/contents/${encodeGitHubPath(
    filePath,
  )}?ref=${encodeURIComponent(ref)}`;
}

async function resolveBlogContentRef() {
  if (BLOG_CONTENT_REF) return BLOG_CONTENT_REF;

  const url = `${GITHUB_API}/repos/${BLOG_REPO}/git/ref/heads/${getGitRefPath(
    BLOG_REPO_BRANCH,
  )}`;
  const response = await fetch(url, {
    headers: githubHeaders("application/vnd.github+json"),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to resolve blog content ref (${response.status} ${response.statusText})`,
    );
  }

  const data = await response.json();
  const sha = data?.object?.sha;
  if (!sha) {
    throw new Error("Failed to resolve blog content ref: missing object SHA");
  }
  return sha;
}

async function listArticleSlugs(contentRef, locale = DEFAULT_LOCALE) {
  const url = getContentsUrl(getArticleDirectory(locale), contentRef);
  const response = await fetch(url, {
    headers: githubHeaders("application/vnd.github+json"),
  });
  if (response.status === 404 && locale !== DEFAULT_LOCALE) {
    return [];
  }
  if (!response.ok) {
    throw new Error(
      `Failed to list blog articles (${response.status} ${response.statusText})`,
    );
  }
  const entries = await response.json();
  return entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".md"))
    .map((entry) => entry.name.replace(/\.md$/, ""))
    .filter((slug) => slug.toLowerCase() !== "readme");
}

/** Best-effort article `updatedDate`/`pubDate` as an ISO lastmod, or null. */
async function fetchArticleLastmod(slug, contentRef) {
  try {
    const url = getContentsUrl(`${BLOG_ARTICLES_DIR}/${slug}.md`, contentRef);
    const response = await fetch(url, {
      headers: githubHeaders("application/vnd.github.raw"),
    });
    if (!response.ok) return null;
    const { data } = matter(await response.text());
    const raw = data.updatedDate || data.pubDate;
    if (!raw) return null;
    const text = String(raw);
    const ms = Date.parse(text.includes(" ") ? text.replace(" ", "T") : text);
    return Number.isNaN(ms) ? null : new Date(ms).toISOString();
  } catch {
    return null;
  }
}

async function listTranslatedSlugs(contentRef) {
  const translatedSlugs = new Map();
  const translatedLocales = LOCALES.filter(
    (item) => item.locale !== DEFAULT_LOCALE,
  );

  await Promise.all(
    translatedLocales.map(async (localeConfig) => {
      try {
        const slugs = await listArticleSlugs(contentRef, localeConfig.locale);
        translatedSlugs.set(localeConfig.locale, new Set(slugs));
      } catch (error) {
        console.warn(
          `Blog sitemap: skipped ${localeConfig.locale} translations (${error.message}).`,
        );
        translatedSlugs.set(localeConfig.locale, new Set());
      }
    }),
  );

  return translatedSlugs;
}

function getArticleLocaleConfigs(slug, translatedSlugs) {
  return LOCALES.filter((localeConfig) => {
    if (localeConfig.locale === DEFAULT_LOCALE) return true;
    return translatedSlugs.get(localeConfig.locale)?.has(slug);
  });
}

async function generateBlog() {
  const filePath = path.join(
    __dirname,
    "../../locales/en/public/sitemap-blog.xml",
  );
  const generatedAt = new Date().toISOString();
  const entries = [];

  try {
    const contentRef = await resolveBlogContentRef();
    const slugs = await listArticleSlugs(contentRef);
    const translatedSlugs = await listTranslatedSlugs(contentRef);

    entries.push(
      renderUrlEntry(`${SITE_ORIGIN}${BLOG_ROUTE_BASE}`, {
        changefreq: "daily",
        lastmod: generatedAt,
        priority: "0.7",
      }),
    );

    const lastmods = await Promise.all(
      slugs.map((slug) => fetchArticleLastmod(slug, contentRef)),
    );
    slugs.forEach((slug, index) => {
      const localeConfigs = getArticleLocaleConfigs(slug, translatedSlugs);
      entries.push(
        renderUrlEntry(
          `${SITE_ORIGIN}${BLOG_ROUTE_BASE}/${slug}`,
          {
            changefreq: "weekly",
            lastmod: lastmods[index] || generatedAt,
            priority: "0.6",
          },
          localeConfigs,
        ),
      );
    });

    console.log(
      `Blog sitemap: ${slugs.length} articles generated from ${contentRef.slice(
        0,
        12,
      )}.`,
    );
    writeSitemap(filePath, renderUrlset(entries));
  } catch (error) {
    console.error(
      `Error generating blog sitemap (preserving existing sitemap): ${error.message}`,
    );

    if (!fs.existsSync(filePath)) {
      entries.push(
        renderUrlEntry(`${SITE_ORIGIN}${BLOG_ROUTE_BASE}`, {
          changefreq: "daily",
          lastmod: generatedAt,
          priority: "0.7",
        }),
      );
      writeSitemap(filePath, renderUrlset(entries));
    }
  }
}

module.exports = {
  generateBlog,
};
