import matter from "gray-matter";
import { resolveAssetUrl } from "./media";
import type { Post, PostFrontmatter, PostSummary } from "./types";

/** Coerce a frontmatter value into a trimmed non-empty string, or null. */
function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number") return String(value);
  return null;
}

/** Coerce a frontmatter value into a string array (tolerates a single string). */
function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => asString(item))
      .filter((item): item is string => item !== null);
  }
  const single = asString(value);
  return single ? [single] : [];
}

/**
 * Parse a publish-date string into epoch ms.
 *
 * Accepts date-only ("2025-02-19") and datetime ("2025-02-19 23:31:46", the
 * shape used by the source archive). Returns null when missing/unparseable.
 */
export function parsePubDateMs(value: unknown): number | null {
  const raw = asString(value);
  if (!raw) return null;
  // The source separates date and time with a space; normalise to ISO-ish.
  const normalised = raw.includes(" ") ? raw.replace(" ", "T") : raw;
  const ms = Date.parse(normalised);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Parse a raw Markdown article into a `Post`.
 *
 * Frontmatter is parsed leniently per the archive's contract: optional fields
 * may be missing, `tags`/`categories` are arrays, `pubDate` may be a date or
 * datetime, and unknown fields are preserved on `frontmatter`.
 */
export function parseArticle(raw: string, slug: string): Post {
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  return {
    slug,
    title: asString(frontmatter.title) || slug,
    description: asString(frontmatter.description) || "",
    author: asString(frontmatter.author) || "",
    tags: asStringArray(frontmatter.tags),
    categories: asStringArray(frontmatter.categories),
    cover: resolveAssetUrl(asString(frontmatter.cover)),
    isSticky: frontmatter.isSticky === true,
    readingMinutes:
      typeof frontmatter.readingMinutes === "number"
        ? frontmatter.readingMinutes
        : null,
    pubDate: asString(frontmatter.pubDate),
    pubDateMs: parsePubDateMs(frontmatter.pubDate),
    updatedDate: asString(frontmatter.updatedDate),
    content,
    frontmatter,
  };
}

/** Project a full `Post` down to its summary (drops the Markdown body). */
export function toSummary(post: Post): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    author: post.author,
    tags: post.tags,
    categories: post.categories,
    cover: post.cover,
    isSticky: post.isSticky,
    readingMinutes: post.readingMinutes,
    pubDate: post.pubDate,
    pubDateMs: post.pubDateMs,
    updatedDate: post.updatedDate,
  };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Format a publish date as "Mon D, YYYY" (e.g. "Feb 19, 2025").
 *
 * Reads the calendar date directly from the leading `YYYY-MM-DD` of the raw
 * string, so the result is timezone-independent. Returns "" when the value is
 * absent or malformed.
 */
export function formatPostDate(pubDate: string | null): string {
  if (!pubDate) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(pubDate.trim());
  if (!match) return "";
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return "";
  return `${monthName} ${Number(day)}, ${year}`;
}
