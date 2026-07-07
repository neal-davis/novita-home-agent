/** Raw YAML frontmatter as authored in the source Markdown. */
export interface PostFrontmatter {
  title?: string;
  description?: string;
  pubDate?: string;
  updatedDate?: string;
  author?: string;
  categories?: string[];
  tags?: string[];
  cover?: string;
  isSticky?: boolean;
  readingMinutes?: number;
  // WordPress / migration fields (optional, preserved as-is):
  wpSlug?: string;
  canonical?: string;
  wordpressId?: number;
  /** Any other fields present in the source frontmatter are preserved here. */
  [key: string]: unknown;
}

/** Lightweight article metadata for list/index views (no Markdown body). */
export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  categories: string[];
  /** Absolute cover image URL, or null when none is set. */
  cover: string | null;
  isSticky: boolean;
  readingMinutes: number | null;
  /** Original publish date string from frontmatter (date or datetime). */
  pubDate: string | null;
  /** Publish date as epoch ms for sorting; null when missing/unparseable. */
  pubDateMs: number | null;
  updatedDate: string | null;
}

/** A full article including its Markdown body and original frontmatter. */
export interface Post extends PostSummary {
  /** Raw Markdown body; media URLs are resolved at render time. */
  content: string;
  /** Original parsed frontmatter, with unknown fields preserved. */
  frontmatter: PostFrontmatter;
}
