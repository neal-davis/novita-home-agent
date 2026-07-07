import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/i18n/config";
import {
  BLOG_CACHE_TAG,
  BLOG_REPO,
  BLOG_REPO_BRANCH,
  BLOG_REVALIDATE_SECONDS,
  getBlogArticleDirectory,
  getBlogContentRef,
  getBlogRepoToken,
} from "./config";

const GITHUB_API = "https://api.github.com";

interface ContentsEntry {
  name: string;
  path: string;
  type: "file" | "dir" | string;
}

interface GitRefResponse {
  object?: {
    sha?: string;
  };
}

let blogContentRefPromise: Promise<string> | null = null;

function githubHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = getBlogRepoToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Shared fetch options: tag + revalidate so the data cache can be purged. */
function githubFetchOptions(accept: string) {
  return {
    method: "GET",
    headers: githubHeaders(accept),
    next: { revalidate: BLOG_REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] },
  };
}

function encodeGitHubPath(value: string): string {
  return value.split("/").map(encodeURIComponent).join("/");
}

function getGitRefPath(branch: string): string {
  return branch.split("/").map(encodeURIComponent).join("/");
}

function getContentsUrl(filePath: string, ref: string): string {
  return `${GITHUB_API}/repos/${BLOG_REPO}/contents/${encodeGitHubPath(
    filePath,
  )}?ref=${encodeURIComponent(ref)}`;
}

async function fetchBranchHeadRef(): Promise<string> {
  const url = `${GITHUB_API}/repos/${BLOG_REPO}/git/ref/heads/${getGitRefPath(
    BLOG_REPO_BRANCH,
  )}`;
  const response = await fetch(
    url,
    githubFetchOptions("application/vnd.github+json"),
  );
  if (!response.ok) {
    throw new Error(
      `Failed to resolve blog content ref (${response.status} ${response.statusText})`,
    );
  }

  const data = (await response.json()) as GitRefResponse;
  const sha = data.object?.sha;
  if (!sha) {
    throw new Error(`Failed to resolve blog content ref: missing object SHA`);
  }
  return sha;
}

/**
 * Return the exact content ref used for blog fetches.
 *
 * Resolving a branch once keeps a build/runtime pass internally consistent
 * even if the content repo branch moves while articles are being fetched.
 */
export async function resolveBlogContentRef(): Promise<string> {
  const configuredRef = getBlogContentRef();
  if (configuredRef) return configuredRef;

  if (!blogContentRefPromise) {
    blogContentRefPromise = fetchBranchHeadRef().catch((error) => {
      blogContentRefPromise = null;
      throw error;
    });
  }
  return blogContentRefPromise;
}

/** Clear the cached branch -> commit resolution after an explicit revalidate. */
export function resetBlogContentRefCache() {
  blogContentRefPromise = null;
}

/** List the slugs of all `<slug>.md` articles in the archive directory. */
export async function listArticleSlugs(
  locale: Locale = DEFAULT_LOCALE,
): Promise<string[]> {
  const normalizedLocale = normalizeLocale(locale);
  const contentRef = await resolveBlogContentRef();
  const articleDirectory = getBlogArticleDirectory(normalizedLocale);
  const url = getContentsUrl(articleDirectory, contentRef);
  const response = await fetch(
    url,
    githubFetchOptions("application/vnd.github+json"),
  );
  if (response.status === 404 && normalizedLocale !== DEFAULT_LOCALE) {
    return [];
  }
  if (!response.ok) {
    throw new Error(
      `Failed to list blog articles (${response.status} ${response.statusText})`,
    );
  }
  const entries = (await response.json()) as ContentsEntry[];
  return entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".md"))
    .map((entry) => entry.name.replace(/\.md$/, ""))
    .filter((slug) => slug.toLowerCase() !== "readme");
}

/** Fetch the raw Markdown of a single article, or null when it does not exist. */
export async function fetchArticleRaw(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<string | null> {
  const normalizedLocale = normalizeLocale(locale);
  const contentRef = await resolveBlogContentRef();
  const articleDirectory = getBlogArticleDirectory(normalizedLocale);
  const url = getContentsUrl(`${articleDirectory}/${slug}.md`, contentRef);
  const response = await fetch(
    url,
    githubFetchOptions("application/vnd.github.raw"),
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `Failed to fetch blog article "${slug}" (${response.status} ${response.statusText})`,
    );
  }
  return response.text();
}
