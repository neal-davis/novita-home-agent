import { BLOG_MEDIA_ORIGIN } from "@/lib/blog/config";
import {
  resolveAssetUrl,
  resolveLinkUrl,
  resolveMarkdownUrls,
} from "@/lib/blog/media";

describe("resolveAssetUrl", () => {
  it("prefixes /uploads/ paths with the media origin", () => {
    expect(resolveAssetUrl("/uploads/2025/01/cover.webp")).toBe(
      `${BLOG_MEDIA_ORIGIN}/uploads/2025/01/cover.webp`,
    );
  });

  it("leaves absolute URLs unchanged", () => {
    const s3 = "https://novita-blog.s3.ap-southeast-1.amazonaws.com/x.png";
    expect(resolveAssetUrl(s3)).toBe(s3);
  });

  it("returns null for empty / missing input", () => {
    expect(resolveAssetUrl(null)).toBeNull();
    expect(resolveAssetUrl(undefined)).toBeNull();
    expect(resolveAssetUrl("   ")).toBeNull();
  });

  it("honours a custom media origin and strips its trailing slash", () => {
    expect(resolveAssetUrl("/uploads/a.webp", "https://cdn.test/")).toBe(
      "https://cdn.test/uploads/a.webp",
    );
  });
});

describe("resolveLinkUrl", () => {
  it("leaves absolute, anchor and mailto links unchanged", () => {
    expect(resolveLinkUrl("https://novita.ai")).toBe("https://novita.ai");
    expect(resolveLinkUrl("#section")).toBe("#section");
    expect(resolveLinkUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
  });

  it("maps site-relative slugs to the blog route by default", () => {
    expect(resolveLinkUrl("/some-article/")).toBe("/blog/some-article");
  });

  it("maps to /blog when the slug is known", () => {
    expect(resolveLinkUrl("/known-slug/", { knownSlugs: ["known-slug"] })).toBe(
      "/blog/known-slug",
    );
  });

  it("falls back to the legacy origin for unknown slugs", () => {
    expect(
      resolveLinkUrl("/missing/", {
        knownSlugs: ["other"],
        legacyOrigin: "https://blogs.novita.ai",
      }),
    ).toBe("https://blogs.novita.ai/missing/");
  });

  it("leaves relative paths untouched and handles empty input", () => {
    expect(resolveLinkUrl("./rel")).toBe("./rel");
    expect(resolveLinkUrl("")).toBe("");
    expect(resolveLinkUrl(undefined)).toBe("");
  });
});

describe("resolveMarkdownUrls", () => {
  it("rewrites /uploads image sources to the Blob origin", () => {
    expect(resolveMarkdownUrls("![cover](/uploads/a.webp)")).toBe(
      `![cover](${BLOG_MEDIA_ORIGIN}/uploads/a.webp)`,
    );
  });

  it("preserves an image title", () => {
    expect(resolveMarkdownUrls('![c](/uploads/a.webp "Title")')).toBe(
      `![c](${BLOG_MEDIA_ORIGIN}/uploads/a.webp "Title")`,
    );
  });

  it("leaves absolute links untouched", () => {
    const md = "see [vLLM](https://github.com/vllm-project/vllm)";
    expect(resolveMarkdownUrls(md)).toBe(md);
  });

  it("maps internal slug links into the blog route", () => {
    expect(
      resolveMarkdownUrls("[next](/another-post/)", {
        knownSlugs: ["another-post"],
      }),
    ).toBe("[next](/blog/another-post)");
  });

  it("falls back to the legacy origin for unmigrated slugs", () => {
    expect(
      resolveMarkdownUrls("[old](/legacy-post/)", {
        knownSlugs: ["something-else"],
        legacyOrigin: "https://blogs.novita.ai",
      }),
    ).toBe("[old](https://blogs.novita.ai/legacy-post/)");
  });
});
