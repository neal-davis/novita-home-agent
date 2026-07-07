const SITE_ORIGIN = "https://novita.ai";
const API_BASE_URL = "https://api.novita.ai";
const OPENAI_COMPATIBLE_BASE_URL = "https://api.novita.ai/openai";
const DOCS_SITEMAP_URL = `${SITE_ORIGIN}/docs/sitemap.xml`;

type LlmsLink = readonly [string, string];

const fallbackApiReferenceLinks = [
  ["Authentication", "/docs/api-reference/basic-authentication.md"],
  ["Error Codes", "/docs/api-reference/basic-error-code.md"],
  ["Get User Balance", "/docs/api-reference/basic-get-user-balance.md"],
  ["Query Monthly Bill", "/docs/api-reference/basic-query-monthly-bill.md"],
  [
    "Create Chat Completion",
    "/docs/api-reference/model-apis-llm-create-chat-completion.md",
  ],
  [
    "Create Completion",
    "/docs/api-reference/model-apis-llm-create-completion.md",
  ],
  [
    "Create Embeddings",
    "/docs/api-reference/model-apis-llm-create-embeddings.md",
  ],
  ["Create Rerank", "/docs/api-reference/model-apis-llm-create-rerank.md"],
  ["List Models", "/docs/api-reference/model-apis-llm-list-models.md"],
  ["Retrieve Model", "/docs/api-reference/model-apis-llm-retrieve-model.md"],
  ["Create Batch", "/docs/api-reference/model-apis-llm-create-batch.md"],
  ["Retrieve Batch", "/docs/api-reference/model-apis-llm-retrieve-batch.md"],
  ["Cancel Batch", "/docs/api-reference/model-apis-llm-cancel-batch.md"],
  ["List Batches", "/docs/api-reference/model-apis-llm-list-batches.md"],
  [
    "Upload Batch Input File",
    "/docs/api-reference/model-apis-llm-upload-batch-input-file.md",
  ],
  ["Text to Image", "/docs/api-reference/model-apis-txt2img.md"],
  ["Image to Image", "/docs/api-reference/model-apis-img2img.md"],
  ["FLUX.1 Schnell", "/docs/api-reference/model-apis-flux-1-schnell.md"],
  ["Seedream 3.0", "/docs/api-reference/model-apis-seedream-3-0-t2i.md"],
  ["Seedream 4.0", "/docs/api-reference/model-apis-seedream-4-0.md"],
  ["Qwen Image", "/docs/api-reference/model-apis-qwen-image-txt2img.md"],
  ["Upscale", "/docs/api-reference/model-apis-upscale.md"],
  ["Remove Background", "/docs/api-reference/model-apis-remove-background.md"],
  [
    "Replace Background",
    "/docs/api-reference/model-apis-replace-background.md",
  ],
  ["Inpainting", "/docs/api-reference/model-apis-inpainting.md"],
  ["Text to Video", "/docs/api-reference/model-apis-txt2video.md"],
  ["Image to Video", "/docs/api-reference/model-apis-img2video.md"],
  [
    "Hunyuan Video Fast",
    "/docs/api-reference/model-apis-hunyuan-video-fast.md",
  ],
  [
    "Kling V2.1 Master",
    "/docs/api-reference/model-apis-kling-v2.1-t2v-master.md",
  ],
  ["Minimax Hailuo 02", "/docs/api-reference/model-apis-minimax-hailuo-02.md"],
  [
    "Minimax Speech 02 HD",
    "/docs/api-reference/model-apis-minimax-speech-02-hd.md",
  ],
  [
    "Minimax Speech 2.8 HD",
    "/docs/api-reference/model-apis-minimax-speech-2.8-hd.md",
  ],
  ["GLM TTS", "/docs/api-reference/model-apis-glm-tts.md"],
  ["GLM ASR", "/docs/api-reference/model-apis-glm-asr.md"],
  ["Create Instance", "/docs/api-reference/gpu-instance-create-instance.md"],
  ["List Instances", "/docs/api-reference/gpu-instance-list-instances.md"],
  ["Get Instance", "/docs/api-reference/gpu-instance-get-instance.md"],
  ["Start Instance", "/docs/api-reference/gpu-instance-start-instance.md"],
  ["Stop Instance", "/docs/api-reference/gpu-instance-stop-instance.md"],
  ["Delete Instance", "/docs/api-reference/gpu-instance-delete-instance.md"],
  ["List Products", "/docs/api-reference/gpu-instance-list-products.md"],
  ["Create Endpoint", "/docs/api-reference/serverless-create-endpoint.md"],
  ["List Endpoint", "/docs/api-reference/serverless-list-endpoint.md"],
  ["Get Endpoint", "/docs/api-reference/serverless-get-endpoint.md"],
  ["Update Endpoint", "/docs/api-reference/serverless-update-endpoint.md"],
  ["Delete Endpoint", "/docs/api-reference/serverless-delete-endpoint.md"],
] as const;

const fallbackGuideLinks = [
  ["LLM API", "/docs/guides/llm-api.md"],
  ["Vision", "/docs/guides/llm-vision.md"],
  ["Function Calling", "/docs/guides/llm-function-calling.md"],
  ["Structured Outputs", "/docs/guides/llm-structured-outputs.md"],
  ["Reasoning", "/docs/guides/llm-reasoning.md"],
  ["Prompt Cache", "/docs/guides/llm-prompt-cache.md"],
  ["Batch API", "/docs/guides/llm-batch-api.md"],
  ["Dedicated Endpoints", "/docs/guides/llm-dedicated-endpoint.md"],
  ["Agent Sandbox Overview", "/docs/guides/sandbox-overview.md"],
  ["Sandbox SDK and CLI", "/docs/guides/sandbox-sdk-and-cli.md"],
  ["NovitaClaw", "/docs/guides/novitaclaw.md"],
  ["NovitaClaw Configuration", "/docs/guides/novitaclaw-configuration.md"],
  ["NovitaClaw Commands", "/docs/guides/novitaclaw-commands.md"],
  [
    "Create GPU Instance",
    "/docs/guides/gpu-instance-quickstart-create-instances.md",
  ],
  [
    "Connect to GPU Instance",
    "/docs/guides/gpu-instance-quickstart-connect-to-instance.md",
  ],
  ["Claude Code", "/docs/guides/claude-code.md"],
  ["OpenAI Agents SDK", "/docs/guides/openai-agents-sdk.md"],
  ["LangChain", "/docs/guides/langchain.md"],
  ["Cursor", "/docs/guides/cursor.md"],
  ["Dify", "/docs/guides/dify.md"],
  ["LiteLLM", "/docs/guides/litellm.md"],
] as const;

function renderLinks(links: readonly LlmsLink[]) {
  return links.map(([label, href]) => `- [${label}](${href})`).join("\n");
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function extractSitemapUrls(sitemapXml: string) {
  return [...sitemapXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXmlEntities(match[1].trim()))
    .filter((url) => url.startsWith(`${SITE_ORIGIN}/docs/`));
}

function getMarkdownHref(url: string) {
  const { pathname } = new URL(url);
  return pathname.endsWith(".md") ? pathname : `${pathname}.md`;
}

function getLinkLabel(url: string) {
  const { pathname } = new URL(url);
  const slug = pathname.split("/").filter(Boolean).at(-1) || "Documentation";
  return slug
    .replace(/[-_]+/g, " ")
    .replace(
      /\b(api|asr|cpu|faq|glm|gpu|gpus|i2v|llm|mcp|ocr|sdk|sdks|sso|tts|vpc)\b/gi,
      (value) => value.toUpperCase(),
    )
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function dedupeLinks(links: LlmsLink[]) {
  const seen = new Set<string>();
  return links.filter(([, href]) => {
    if (seen.has(href)) return false;
    seen.add(href);
    return true;
  });
}

export function getSitemapMarkdownLinks(sitemapXml: string) {
  return dedupeLinks(
    extractSitemapUrls(sitemapXml).map((url) => [
      getLinkLabel(url),
      getMarkdownHref(url),
    ]),
  );
}

function groupDocsLinks(links: readonly LlmsLink[]) {
  return {
    apiReference: links.filter(([, href]) =>
      href.startsWith("/docs/api-reference/"),
    ),
    guides: links.filter(([, href]) => href.startsWith("/docs/guides/")),
    changelog: links.filter(([, href]) => href.startsWith("/docs/changelog/")),
    other: links.filter(
      ([, href]) =>
        !href.startsWith("/docs/api-reference/") &&
        !href.startsWith("/docs/guides/") &&
        !href.startsWith("/docs/changelog/"),
    ),
  };
}

async function getDocsSitemapLinks() {
  const response = await fetch(DOCS_SITEMAP_URL, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch docs sitemap: ${response.status}`);
  }

  return getSitemapMarkdownLinks(await response.text());
}

export async function getLlmsTxt() {
  let docsLinks: LlmsLink[];

  try {
    docsLinks = await getDocsSitemapLinks();
  } catch {
    docsLinks = [...fallbackApiReferenceLinks, ...fallbackGuideLinks];
  }

  const groupedLinks = groupDocsLinks(docsLinks);

  return `# Novita AI

> Novita AI provides APIs for LLMs, image, video and audio generation, GPU cloud, and agent sandboxes.

Website: ${SITE_ORIGIN}
Documentation: ${SITE_ORIGIN}/docs
API Base URL: ${API_BASE_URL}
OpenAI-Compatible Base URL: ${OPENAI_COMPATIBLE_BASE_URL}
Authentication: Bearer token via \`Authorization: Bearer <token>\`

All same-origin documentation links in this file are generated from the docs sitemap and point to Markdown URL variants so agents can fetch Markdown directly.

## API Reference

${renderLinks(groupedLinks.apiReference)}

## Guides

${renderLinks(groupedLinks.guides)}

## Changelog

${renderLinks(groupedLinks.changelog)}

## Other Documentation

${renderLinks(groupedLinks.other)}

## Agent Discovery Metadata

- Auth.md: /auth.md
- API Catalog: /.well-known/api-catalog
- OpenAPI: /.well-known/openapi.json
- MCP Server Card: /.well-known/mcp/server-card.json
- A2A Agent Card: /.well-known/agent-card.json
- Agent Skills: /.well-known/agent-skills/index.json
- OAuth Authorization Server: /.well-known/oauth-authorization-server
- OAuth Protected Resource: /.well-known/oauth-protected-resource

## Common Queries

- How to authenticate: see /docs/api-reference/basic-authentication.md
- Generate images from text: see /docs/api-reference/model-apis-txt2img.md
- Create a chatbot: see /docs/api-reference/model-apis-llm-create-chat-completion.md
- Generate video: see /docs/api-reference/model-apis-txt2video.md
- Deploy GPU instance: see /docs/api-reference/gpu-instance-create-instance.md
- Check balance: see /docs/api-reference/basic-get-user-balance.md
- OpenAI compatible API: see /docs/guides/llm-api.md
- Deploy an AI agent: see /docs/guides/novitaclaw.md
`;
}

export const llmsTxtHeaders = {
  // i18n-disable-next-line
  "Content-Type": "text/markdown; charset=utf-8",
  // i18n-disable-next-line
  "Cache-Control": "public, max-age=3600",
  // i18n-disable-next-line
  "Access-Control-Allow-Origin": "*",
  // i18n-disable-next-line
  "X-Content-Type-Options": "nosniff",
};
