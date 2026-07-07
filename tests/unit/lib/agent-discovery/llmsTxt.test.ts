import {
  extractSitemapUrls,
  getSitemapMarkdownLinks,
} from "@/lib/agent-discovery/llmsTxt";

describe("llms.txt sitemap coverage", () => {
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset>
      <url><loc>https://novita.ai/docs/api-reference/basic-authentication</loc></url>
      <url><loc>https://novita.ai/docs/guides/llm-api</loc></url>
      <url><loc>https://novita.ai/docs/changelog/29-05-26</loc></url>
      <url><loc>https://novita.ai/pricing</loc></url>
    </urlset>`;

  it("extracts same-origin docs sitemap URLs", () => {
    expect(extractSitemapUrls(sitemapXml)).toEqual([
      "https://novita.ai/docs/api-reference/basic-authentication",
      "https://novita.ai/docs/guides/llm-api",
      "https://novita.ai/docs/changelog/29-05-26",
    ]);
  });

  it("maps sitemap URLs to markdown variants", () => {
    expect(getSitemapMarkdownLinks(sitemapXml)).toEqual([
      ["Basic Authentication", "/docs/api-reference/basic-authentication.md"],
      ["LLM API", "/docs/guides/llm-api.md"],
      ["29 05 26", "/docs/changelog/29-05-26.md"],
    ]);
  });
});
