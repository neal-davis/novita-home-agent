import { htmlToMarkdown } from "@/lib/markdown/htmlToMarkdown";

describe("htmlToMarkdown", () => {
  it("removes Mintlify navigation before documentation content", () => {
    const html = `<!doctype html>
      <html>
        <head>
          <title>Vision Language Models - Documentation</title>
          <meta name="description" content="Vision docs" />
        </head>
        <body>
          <main>
            <nav>
              <a href="/docs">Documentation</a>
              <h3>Get started</h3>
              <ul><li>Introduction</li><li>Quickstart</li></ul>
            </nav>
            <aside>
              <h2>On this page</h2>
              <ul><li>Overview</li><li>Billing</li></ul>
            </aside>
            <div>LLM</div>
            <h1>Vision Language Models</h1>
            <button>Copy page</button>
            <h2>Overview</h2>
            <p>Vision-Language Models process image and text inputs.</p>
            <p>Was this page helpful?</p>
            <footer>Powered by Mintlify</footer>
          </main>
        </body>
      </html>`;

    const markdown = htmlToMarkdown(html, "/docs/guides/llm-vision");

    expect(markdown).toContain("# Vision Language Models");
    expect(markdown).toContain("## Overview");
    expect(markdown).not.toContain("Get started");
    expect(markdown).not.toContain("On this page");
    expect(markdown).not.toContain("Copy page");
    expect(markdown).not.toContain("Was this page helpful?");
  });
});
