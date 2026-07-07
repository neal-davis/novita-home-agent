/**
 * Configuration for the blog content source.
 *
 * Articles live in a private GitHub repository (`novitalabs/Novita-home-blogs`),
 * a curated Markdown archive. Values come from environment variables with
 * sensible defaults so local development and tests work without extra setup;
 * the GitHub token is only required at fetch time (see `source.ts`).
 *
 * Environment variables (set these in the deploy environment, never in git):
 * - `BLOG_REPO_TOKEN`   GitHub token with read access to the private archive.
 * - `BLOG_REPO`         `owner/repo` override (defaults to the archive below).
 * - `BLOG_REPO_BRANCH`  Branch to read (defaults to `main`).
 * - `BLOG_CONTENT_REF`  Optional exact content ref (commit SHA/tag/branch).
 * - `BLOG_ARTICLES_DIR` Directory holding `<slug>.md` files (defaults to `articles`).
 * - `BLOG_TRANSLATIONS_DIR` Directory holding translated articles by locale.
 * - `BLOG_MEDIA_ORIGIN` Origin backing `/uploads/...` media (Vercel Blob store).
 * - `BLOG_REVALIDATE_SECONDS` ISR window for content fetched from GitHub.
 */

import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/i18n/config";

/** `owner/repo` of the curated Markdown archive. */
export const BLOG_REPO =
  process.env.BLOG_REPO || "novitalabs/Novita-home-blogs";

/** Branch to read articles from. */
export const BLOG_REPO_BRANCH = process.env.BLOG_REPO_BRANCH || "main";

/**
 * Exact content ref to read. When unset, the build/runtime resolves
 * `BLOG_REPO_BRANCH` to a commit SHA once and reuses that SHA for all blog
 * fetches in the process.
 */
export const BLOG_CONTENT_REF =
  process.env.BLOG_CONTENT_REF ||
  process.env.BLOG_REPO_COMMIT ||
  process.env.BLOG_REPO_SHA ||
  "";

/** Exact content ref override, read lazily so tests and serverless envs stay fresh. */
export function getBlogContentRef(): string {
  return (
    process.env.BLOG_CONTENT_REF ||
    process.env.BLOG_REPO_COMMIT ||
    process.env.BLOG_REPO_SHA ||
    BLOG_CONTENT_REF ||
    ""
  );
}

/** Directory inside the repo holding `<slug>.md` article files. */
export const BLOG_ARTICLES_DIR = process.env.BLOG_ARTICLES_DIR || "articles";

/**
 * Directory inside the repo holding translated article files, grouped by app
 * locale, e.g. `translations/zh-CN/<slug>.md`.
 */
export const BLOG_TRANSLATIONS_DIR =
  process.env.BLOG_TRANSLATIONS_DIR || "translations";

export function getBlogArticleDirectory(locale: Locale = DEFAULT_LOCALE) {
  const normalizedLocale = normalizeLocale(locale);
  if (normalizedLocale === DEFAULT_LOCALE) return BLOG_ARTICLES_DIR;
  return `${BLOG_TRANSLATIONS_DIR}/${normalizedLocale}`;
}

/**
 * Origin that backs `/uploads/...` media paths (Vercel Blob store).
 * Documented in the archive's AGENTS.md.
 */
export const BLOG_MEDIA_ORIGIN =
  process.env.BLOG_MEDIA_ORIGIN ||
  "https://ajldkp7ny4bysrxe.public.blob.vercel-storage.com";

/**
 * Public origin of the legacy blog, used as a fallback target for in-article
 * links whose slug has not been migrated into this site.
 */
export const LEGACY_BLOG_ORIGIN =
  process.env.LEGACY_BLOG_ORIGIN || "https://blogs.novita.ai";

/** Route prefix where articles are published on this site. */
export const BLOG_ROUTE_BASE = "/blog";

/** Cache tag for all blog data fetches; invalidated by the revalidate route. */
export const BLOG_CACHE_TAG = "blog-posts";

/** ISR window (seconds) for blog content fetched from GitHub. Defaults to 1h. */
export const BLOG_REVALIDATE_SECONDS = Number(
  process.env.BLOG_REVALIDATE_SECONDS || 60 * 60,
);

/** GitHub token for reading the private archive. Read lazily at fetch time. */
export function getBlogRepoToken(): string | undefined {
  return process.env.BLOG_REPO_TOKEN || undefined;
}
