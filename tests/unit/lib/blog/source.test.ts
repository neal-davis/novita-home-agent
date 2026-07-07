import {
  fetchArticleRaw,
  listArticleSlugs,
  resetBlogContentRefCache,
  resolveBlogContentRef,
} from "@/lib/blog/source";

const mockFetch = global.fetch as jest.Mock;

function okResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  };
}

function useStaticContentRef() {
  process.env.BLOG_CONTENT_REF = "test-sha";
  delete process.env.BLOG_REPO_COMMIT;
  delete process.env.BLOG_REPO_SHA;
}

describe("resolveBlogContentRef", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    resetBlogContentRefCache();
    delete process.env.BLOG_CONTENT_REF;
    delete process.env.BLOG_REPO_COMMIT;
    delete process.env.BLOG_REPO_SHA;
  });

  it("uses an explicit content ref without a network request", async () => {
    process.env.BLOG_CONTENT_REF = "pinned-sha";
    await expect(resolveBlogContentRef()).resolves.toBe("pinned-sha");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("resolves and caches the configured branch head", async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse({ object: { sha: "head-sha" } }),
    );
    await expect(resolveBlogContentRef()).resolves.toBe("head-sha");
    await expect(resolveBlogContentRef()).resolves.toBe("head-sha");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("/git/ref/heads/main");
  });
});

describe("listArticleSlugs", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    resetBlogContentRefCache();
    useStaticContentRef();
  });

  it("returns slugs of .md files, excluding README and non-markdown", async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse([
        { name: "a.md", path: "articles/a.md", type: "file" },
        { name: "b.md", path: "articles/b.md", type: "file" },
        { name: "README.md", path: "articles/README.md", type: "file" },
        { name: "img.png", path: "articles/img.png", type: "file" },
        { name: "sub", path: "articles/sub", type: "dir" },
      ]),
    );
    await expect(listArticleSlugs()).resolves.toEqual(["a", "b"]);
  });

  it("throws on a non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    });
    await expect(listArticleSlugs()).rejects.toThrow(/403/);
  });

  it("targets the configured repo and articles directory", async () => {
    mockFetch.mockResolvedValueOnce(okResponse([]));
    await listArticleSlugs();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain(
      "/repos/novitalabs/Novita-home-blogs/contents/articles",
    );
    expect(url).toContain("ref=test-sha");
  });

  it("targets the translation directory for localized articles", async () => {
    mockFetch.mockResolvedValueOnce(okResponse([]));
    await listArticleSlugs("zh-CN");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/contents/translations/zh-CN");
  });

  it("treats a missing translation directory as an empty localized list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
    await expect(listArticleSlugs("fr")).resolves.toEqual([]);
  });
});

describe("fetchArticleRaw", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    resetBlogContentRefCache();
    useStaticContentRef();
    delete process.env.BLOG_REPO_TOKEN;
  });

  it("returns the raw Markdown text", async () => {
    mockFetch.mockResolvedValueOnce(okResponse("# Hello"));
    await expect(fetchArticleRaw("hello")).resolves.toBe("# Hello");
  });

  it("returns null on a 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });
    await expect(fetchArticleRaw("missing")).resolves.toBeNull();
  });

  it("throws on other error responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });
    await expect(fetchArticleRaw("boom")).rejects.toThrow(/500/);
  });

  it("sends an Authorization header when a token is set", async () => {
    process.env.BLOG_REPO_TOKEN = "test-token";
    mockFetch.mockResolvedValueOnce(okResponse("x"));
    await fetchArticleRaw("hello");
    const init = mockFetch.mock.calls[0][1];
    expect(init.headers.Authorization).toBe("Bearer test-token");
  });

  it("omits Authorization when no token is set", async () => {
    mockFetch.mockResolvedValueOnce(okResponse("x"));
    await fetchArticleRaw("hello");
    const init = mockFetch.mock.calls[0][1];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("targets the translation directory for localized raw Markdown", async () => {
    mockFetch.mockResolvedValueOnce(okResponse("# Ola"));
    await fetchArticleRaw("hello", "pt-BR");
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/contents/translations/pt-BR/hello.md");
    expect(url).toContain("ref=test-sha");
  });
});
