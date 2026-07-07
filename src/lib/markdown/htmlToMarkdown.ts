const BLOCK_TAGS = [
  "article",
  "aside",
  "div",
  "footer",
  "header",
  "main",
  "nav",
  "section",
];

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function cleanupMarkdown(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function stripAttributes(html: string, tagName: string): string {
  return html.replace(new RegExp(`<${tagName}\\b[^>]*>`, "gi"), `<${tagName}>`);
}

function getAttribute(tag: string, attr: string): string {
  const match = tag.match(new RegExp(`${attr}=["']([^"']*)["']`, "i"));
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}

function extractTagContent(html: string, tagName: string): string {
  const match = html.match(
    new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"),
  );
  return match ? match[1] : "";
}

function extractMetaContent(html: string, name: string): string {
  const match = html.match(
    new RegExp(
      `<meta\\b(?=[^>]*(?:name|property)=["']${name}["'])[^>]*content=["']([^"']*)["'][^>]*>`,
      "i",
    ),
  );
  return match ? decodeHtmlEntities(match[1].trim()) : "";
}

function removeNonContent(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function convertContentHtml(html: string): string {
  let markdown = removeNonContent(html);

  markdown = markdown.replace(
    /<pre\b[^>]*>([\s\S]*?)<\/pre>/gi,
    (_, content) => {
      const code = content
        .replace(/<code\b[^>]*>/gi, "")
        .replace(/<\/code>/gi, "")
        .replace(/<[^>]+>/g, "");
      return `\n\n\`\`\`\n${decodeHtmlEntities(code).trim()}\n\`\`\`\n\n`;
    },
  );

  markdown = markdown.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");

  for (let level = 1; level <= 6; level += 1) {
    markdown = markdown.replace(
      new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi"),
      `\n\n${"#".repeat(level)} $1\n\n`,
    );
  }

  markdown = markdown
    .replace(
      /<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href, text) => {
        const label = text.replace(/<[^>]+>/g, "").trim();
        return label ? `[${label}](${decodeHtmlEntities(href)})` : "";
      },
    )
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const alt = getAttribute(tag, "alt");
      const src = getAttribute(tag, "src");
      return src ? `![${alt}](${src})` : alt;
    })
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<\/?(ul|ol)\b[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p\b[^>]*>/gi, "");

  for (const tag of BLOCK_TAGS) {
    markdown = stripAttributes(markdown, tag)
      .replace(new RegExp(`<${tag}>`, "gi"), "\n\n")
      .replace(new RegExp(`</${tag}>`, "gi"), "\n\n");
  }

  return cleanupMarkdown(markdown.replace(/<[^>]+>/g, ""));
}

function removeDocumentationChrome(markdown: string): string {
  const lines = markdown.split("\n");
  const firstHeadingIndex = lines.findIndex((line) => /^#\s+\S/.test(line));
  const contentLines =
    firstHeadingIndex >= 0 ? lines.slice(firstHeadingIndex) : lines;
  const footerIndex = contentLines.findIndex((line) =>
    /^(Was this page helpful\?|Powered by\b|⌘I\b)/i.test(line.trim()),
  );
  const trimmedLines =
    footerIndex >= 0 ? contentLines.slice(0, footerIndex) : contentLines;

  return cleanupMarkdown(
    trimmedLines.filter((line) => !/^Copy page$/i.test(line.trim())).join("\n"),
  );
}

export function htmlToMarkdown(html: string, sourcePath: string): string {
  const title = cleanupMarkdown(extractTagContent(html, "title"));
  const description =
    extractMetaContent(html, "description") ||
    extractMetaContent(html, "og:description") ||
    extractMetaContent(html, "twitter:description");
  const main = extractTagContent(html, "main");
  const body = extractTagContent(html, "body");
  const rawContent = convertContentHtml(main || body || html);
  const content = sourcePath.startsWith("/docs/")
    ? removeDocumentationChrome(rawContent)
    : rawContent;
  const sections = [
    title ? `# ${title}` : "",
    description ? `> ${description}` : "",
    "> For the complete documentation index, see [llms.txt](/llms.txt). Markdown is available with `Accept: text/markdown` and `.md` URL variants.",
    `Source: ${sourcePath || "/"}`,
    content,
  ];

  return cleanupMarkdown(sections.filter(Boolean).join("\n\n")) + "\n";
}

export function countApproxMarkdownTokens(markdown: string): number {
  return Math.ceil(markdown.trim().split(/\s+/).filter(Boolean).length * 1.33);
}
