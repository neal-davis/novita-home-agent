import {
  countApproxMarkdownTokens,
  htmlToMarkdown,
} from "@/lib/markdown/htmlToMarkdown";

describe("htmlToMarkdown extra conversion branches", () => {
  it("converts pre/code blocks into fenced code", () => {
    const md = htmlToMarkdown(
      "<body><pre><code>const x = 1;</code></pre></body>",
      "/page",
    );
    expect(md).toContain("```");
    expect(md).toContain("const x = 1;");
  });

  it("converts headings, inline code, links, images, and lists", () => {
    const html = `<body>
      <h2>Title</h2>
      <p>Use <code>npm</code> now</p>
      <a href="https://x.test">Link</a>
      <a href="https://y.test"></a>
      <img src="/a.png" alt="pic" />
      <ul><li>one</li><li>two</li></ul>
      <br/>
    </body>`;
    const md = htmlToMarkdown(html, "/page");
    expect(md).toContain("## Title");
    expect(md).toContain("`npm`");
    expect(md).toContain("[Link](https://x.test)");
    // empty-label anchor is dropped
    expect(md).not.toContain("(https://y.test)");
    expect(md).toContain("![pic](/a.png)");
    expect(md).toContain("- one");
  });

  it("uses title and meta description in the header", () => {
    const html = `<html><head><title>My Page</title>
      <meta name="description" content="A great page"></head>
      <body><p>Hello</p></body></html>`;
    const md = htmlToMarkdown(html, "/page");
    expect(md).toContain("# My Page");
    expect(md).toContain("> A great page");
    expect(md).toContain("Source: /page");
  });

  it("strips documentation chrome for /docs/ paths", () => {
    const html = `<body>
      <p>Copy page</p>
      <h1>Doc Heading</h1>
      <p>Body text</p>
      <p>Was this page helpful?</p>
      <p>footer junk</p>
    </body>`;
    const md = htmlToMarkdown(html, "/docs/guide");
    expect(md).toContain("# Doc Heading");
    expect(md).toContain("Body text");
    expect(md).not.toContain("Was this page helpful?");
    expect(md).not.toContain("footer junk");
  });

  it("removes scripts, styles and comments", () => {
    const html =
      "<body><script>evil()</script><style>.a{}</style><!-- c --><p>safe</p></body>";
    const md = htmlToMarkdown(html, "/page");
    expect(md).not.toContain("evil");
    expect(md).not.toContain(".a{}");
    expect(md).toContain("safe");
  });

  it("falls back to a default source path when none is given", () => {
    const md = htmlToMarkdown("<body><p>hi</p></body>", "");
    expect(md).toContain("Source: /");
  });
});

describe("countApproxMarkdownTokens", () => {
  it("estimates tokens from word count", () => {
    expect(countApproxMarkdownTokens("one two three")).toBe(
      Math.ceil(3 * 1.33),
    );
  });
  it("returns 0 for empty input", () => {
    expect(countApproxMarkdownTokens("   ")).toBe(0);
  });
});
