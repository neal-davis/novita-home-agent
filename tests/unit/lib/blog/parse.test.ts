import { BLOG_MEDIA_ORIGIN } from "@/lib/blog/config";
import {
  formatPostDate,
  parseArticle,
  parsePubDateMs,
  toSummary,
} from "@/lib/blog/parse";

const FULL = `---
title: "Sample Title"
description: "A short summary"
pubDate: "2025-02-19 23:31:46"
updatedDate: "2025-03-01 10:00:00"
author: "Novita AI"
categories: ["Novita AI"]
tags: ["Partnerships", "LLM"]
cover: "/uploads/2025/02/cover.webp"
isSticky: true
readingMinutes: 5
wpSlug: "sample-title"
wordpressId: 1234
---

## Heading

Body with an image ![alt](/uploads/2025/02/inline.webp).
`;

const MINIMAL = `---
title: "Only Title"
---
Just body.
`;

describe("parsePubDateMs", () => {
  it("parses datetime with a space separator", () => {
    expect(parsePubDateMs("2025-02-19 23:31:46")).toBe(
      Date.parse("2025-02-19T23:31:46"),
    );
  });

  it("parses date-only values", () => {
    expect(parsePubDateMs("2025-02-19")).toBe(Date.parse("2025-02-19"));
  });

  it("returns null for missing or unparseable values", () => {
    expect(parsePubDateMs(undefined)).toBeNull();
    expect(parsePubDateMs("not-a-date")).toBeNull();
  });
});

describe("formatPostDate", () => {
  it("formats a datetime string as 'Mon D, YYYY'", () => {
    expect(formatPostDate("2025-02-19 23:31:46")).toBe("Feb 19, 2025");
  });

  it("formats a date-only string without a leading zero on the day", () => {
    expect(formatPostDate("2024-11-05")).toBe("Nov 5, 2024");
  });

  it("returns empty string for null or malformed input", () => {
    expect(formatPostDate(null)).toBe("");
    expect(formatPostDate("nope")).toBe("");
  });
});

describe("parseArticle", () => {
  it("parses full frontmatter and resolves the cover", () => {
    const post = parseArticle(FULL, "sample-title");
    expect(post.slug).toBe("sample-title");
    expect(post.title).toBe("Sample Title");
    expect(post.description).toBe("A short summary");
    expect(post.tags).toEqual(["Partnerships", "LLM"]);
    expect(post.categories).toEqual(["Novita AI"]);
    expect(post.isSticky).toBe(true);
    expect(post.readingMinutes).toBe(5);
    expect(post.cover).toBe(`${BLOG_MEDIA_ORIGIN}/uploads/2025/02/cover.webp`);
    expect(post.pubDateMs).toBe(Date.parse("2025-02-19T23:31:46"));
    expect(post.content).toContain("## Heading");
    // unknown / migration fields preserved on frontmatter
    expect(post.frontmatter.wordpressId).toBe(1234);
    expect(post.frontmatter.wpSlug).toBe("sample-title");
  });

  it("is lenient when optional fields are missing", () => {
    const post = parseArticle(MINIMAL, "only-title");
    expect(post.title).toBe("Only Title");
    expect(post.description).toBe("");
    expect(post.author).toBe("");
    expect(post.tags).toEqual([]);
    expect(post.categories).toEqual([]);
    expect(post.cover).toBeNull();
    expect(post.isSticky).toBe(false);
    expect(post.readingMinutes).toBeNull();
    expect(post.pubDate).toBeNull();
    expect(post.pubDateMs).toBeNull();
  });

  it("falls back to the slug when the title is absent", () => {
    const post = parseArticle(`---\nauthor: "x"\n---\nbody`, "fallback-slug");
    expect(post.title).toBe("fallback-slug");
  });

  it("coerces a single tag string into an array", () => {
    const post = parseArticle(`---\ntitle: "t"\ntags: "Research"\n---\nx`, "t");
    expect(post.tags).toEqual(["Research"]);
  });
});

describe("toSummary", () => {
  it("drops the body and frontmatter", () => {
    const summary = toSummary(parseArticle(FULL, "sample-title"));
    expect(summary).not.toHaveProperty("content");
    expect(summary).not.toHaveProperty("frontmatter");
    expect(summary.title).toBe("Sample Title");
  });
});
