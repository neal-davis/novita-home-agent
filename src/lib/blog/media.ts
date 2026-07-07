import {
  BLOG_MEDIA_ORIGIN,
  BLOG_ROUTE_BASE,
  LEGACY_BLOG_ORIGIN,
} from "./config";

const UPLOADS_PREFIX = "/uploads/";

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) || url.startsWith("//");
}

/**
 * Resolve a media URL (cover image or inline `<img>` src) per the archive's
 * media contract:
 *
 * - `/uploads/...` → prefixed with the Vercel Blob origin.
 * - absolute URLs (e.g. existing S3 links) → returned unchanged.
 * - empty / missing → null.
 */
export function resolveAssetUrl(
  url: string | undefined | null,
  mediaOrigin: string = BLOG_MEDIA_ORIGIN,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith(UPLOADS_PREFIX)) {
    return mediaOrigin.replace(/\/$/, "") + trimmed;
  }
  return trimmed;
}

/**
 * Resolve an in-article link href to this site's routing:
 *
 * - absolute URLs, anchors and `mailto:` → unchanged.
 * - `/uploads/...` → Blob origin (rare for links, handled for safety).
 * - other site-relative `/some-slug/` → `/blog/some-slug` when the slug is
 *   known (migrated), otherwise the legacy blog origin as a fallback.
 * - relative paths → unchanged.
 */
export function resolveLinkUrl(
  url: string | undefined | null,
  options: { knownSlugs?: Iterable<string>; legacyOrigin?: string } = {},
): string {
  const href = url?.trim();
  if (!href) return "";
  if (isAbsoluteUrl(href)) return href;
  if (href.startsWith("#") || href.startsWith("mailto:")) return href;
  if (href.startsWith(UPLOADS_PREFIX)) return resolveAssetUrl(href) as string;
  if (!href.startsWith("/")) return href;

  const slug = href.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!slug) return BLOG_ROUTE_BASE;

  const known = options.knownSlugs ? new Set(options.knownSlugs) : null;
  if (!known || known.has(slug)) {
    return `${BLOG_ROUTE_BASE}/${slug}`;
  }
  const legacy = (options.legacyOrigin || LEGACY_BLOG_ORIGIN).replace(
    /\/$/,
    "",
  );
  return `${legacy}/${slug}/`;
}

/**
 * Rewrite inline Markdown image/link targets so they resolve against this site:
 * image `src` via {@link resolveAssetUrl}, link `href` via {@link resolveLinkUrl}.
 *
 * Operates on standard inline syntax — `![alt](url)`, `[text](url)` and an
 * optional `"title"`. Intended for trusted, curated content only.
 */
export function resolveMarkdownUrls(
  markdown: string,
  options: { knownSlugs?: Iterable<string>; legacyOrigin?: string } = {},
): string {
  return markdown.replace(
    /(!?)\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g,
    (_match, bang: string, text: string, url: string, title = "") => {
      const resolved = bang
        ? (resolveAssetUrl(url) ?? url)
        : resolveLinkUrl(url, options) || url;
      return `${bang}[${text}](${resolved}${title})`;
    },
  );
}
