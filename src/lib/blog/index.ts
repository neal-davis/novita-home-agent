import type { Locale } from "@/i18n/config";
import { parseArticle, toSummary } from "./parse";
import { fetchArticleRaw, listArticleSlugs } from "./source";
import type { Post, PostSummary } from "./types";

export type { Post, PostSummary, PostFrontmatter } from "./types";
export { BLOG_ROUTE_BASE, BLOG_CACHE_TAG, BLOG_MEDIA_ORIGIN } from "./config";
export { resolveAssetUrl, resolveLinkUrl, resolveMarkdownUrls } from "./media";
export { formatPostDate } from "./parse";

/** Sort newest-first by publish date; undated posts sink to the bottom. */
function byNewest(a: PostSummary, b: PostSummary): number {
  return (b.pubDateMs ?? -Infinity) - (a.pubDateMs ?? -Infinity);
}

/**
 * Return all article slugs (used for static params and the sitemap). Degrades
 * to an empty list when the source is unreachable so callers never throw.
 */
export async function getAllSlugs(locale?: Locale): Promise<string[]> {
  try {
    return await listArticleSlugs(locale);
  } catch (error) {
    console.warn("[blog] failed to list articles:", error);
    return [];
  }
}

/**
 * Fetch and parse a single article by slug. Returns null when the article is
 * missing or the source is unreachable, so the route renders a 404 rather than
 * a 500.
 */
export async function getPostBySlug(
  slug: string,
  locale?: Locale,
): Promise<Post | null> {
  try {
    const raw = await fetchArticleRaw(slug, locale);
    return raw === null ? null : parseArticle(raw, slug);
  } catch (error) {
    console.warn(`[blog] failed to load article "${slug}":`, error);
    return null;
  }
}

/**
 * Fetch, parse and summarise every article, sorted newest-first.
 *
 * Fetches are tagged and revalidated, so the Next data cache serves repeated
 * calls cheaply between revalidations. A single article that fails to load is
 * skipped rather than failing the whole list.
 */
export async function getAllPosts(locale?: Locale): Promise<PostSummary[]> {
  const slugs = await getAllSlugs(locale);
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const raw = await fetchArticleRaw(slug, locale);
        return raw === null ? null : toSummary(parseArticle(raw, slug));
      } catch (error) {
        console.warn(`[blog] failed to load article "${slug}":`, error);
        return null;
      }
    }),
  );
  return posts
    .filter((post): post is PostSummary => post !== null)
    .sort(byNewest);
}

/** Distinct tags across all posts, with counts, sorted by frequency. */
export async function getAllTags(
  locale?: Locale,
): Promise<Array<{ tag: string; count: number }>> {
  const posts = await getAllPosts(locale);
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
