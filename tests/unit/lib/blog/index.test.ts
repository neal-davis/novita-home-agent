jest.mock("@/lib/blog/source", () => ({
  listArticleSlugs: jest.fn(),
  fetchArticleRaw: jest.fn(),
}));

import {
  getAllPosts,
  getAllSlugs,
  getAllTags,
  getPostBySlug,
} from "@/lib/blog";
import { fetchArticleRaw, listArticleSlugs } from "@/lib/blog/source";

const mockList = listArticleSlugs as jest.Mock;
const mockFetchRaw = fetchArticleRaw as jest.Mock;

function article(opts: { title: string; pubDate?: string; tags?: string[] }) {
  const fm = [
    `title: "${opts.title}"`,
    opts.pubDate ? `pubDate: "${opts.pubDate}"` : "",
    opts.tags ? `tags: [${opts.tags.map((t) => `"${t}"`).join(", ")}]` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return `---\n${fm}\n---\nBody of ${opts.title}.`;
}

beforeEach(() => {
  mockList.mockReset();
  mockFetchRaw.mockReset();
});

describe("getAllPosts", () => {
  it("returns summaries sorted newest-first and drops the body", async () => {
    mockList.mockResolvedValue(["old", "new"]);
    mockFetchRaw.mockImplementation(async (slug: string) =>
      slug === "old"
        ? article({ title: "Old", pubDate: "2024-01-01 00:00:00" })
        : article({ title: "New", pubDate: "2025-01-01 00:00:00" }),
    );
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
    expect(posts[0]).not.toHaveProperty("content");
  });

  it("skips articles that fail to load instead of failing the whole list", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockList.mockResolvedValue(["good", "bad"]);
    mockFetchRaw.mockImplementation(async (slug: string) => {
      if (slug === "bad") throw new Error("boom");
      return article({ title: "Good" });
    });
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual(["good"]);
    warnSpy.mockRestore();
  });

  it("filters out slugs that 404 (null raw)", async () => {
    mockList.mockResolvedValue(["here", "gone"]);
    mockFetchRaw.mockImplementation(async (slug: string) =>
      slug === "gone" ? null : article({ title: "Here" }),
    );
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual(["here"]);
  });

  it("returns an empty list when the article listing fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockList.mockRejectedValue(new Error("github down"));
    await expect(getAllPosts()).resolves.toEqual([]);
    warnSpy.mockRestore();
  });
});

describe("getAllTags", () => {
  it("counts tags across posts, most frequent first", async () => {
    mockList.mockResolvedValue(["a", "b", "c"]);
    mockFetchRaw.mockImplementation(async (slug: string) =>
      article({
        title: slug,
        tags: slug === "c" ? ["Research"] : ["Partnerships"],
      }),
    );
    await expect(getAllTags()).resolves.toEqual([
      { tag: "Partnerships", count: 2 },
      { tag: "Research", count: 1 },
    ]);
  });
});

describe("getPostBySlug", () => {
  it("returns a full post with its body", async () => {
    mockFetchRaw.mockResolvedValueOnce(article({ title: "Solo" }));
    const post = await getPostBySlug("solo");
    expect(post?.title).toBe("Solo");
    expect(post?.content).toContain("Body of Solo.");
  });

  it("returns null when the article is not found", async () => {
    mockFetchRaw.mockResolvedValueOnce(null);
    await expect(getPostBySlug("ghost")).resolves.toBeNull();
  });

  it("returns null when the source errors", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockFetchRaw.mockRejectedValueOnce(new Error("boom"));
    await expect(getPostBySlug("x")).resolves.toBeNull();
    warnSpy.mockRestore();
  });
});

describe("getAllSlugs", () => {
  it("delegates to the source listing", async () => {
    mockList.mockResolvedValueOnce(["x", "y"]);
    await expect(getAllSlugs()).resolves.toEqual(["x", "y"]);
  });

  it("returns an empty list when the source listing fails", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockList.mockRejectedValueOnce(new Error("down"));
    await expect(getAllSlugs()).resolves.toEqual([]);
    warnSpy.mockRestore();
  });
});
