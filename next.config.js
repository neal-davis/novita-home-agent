/** @type {import('next').NextConfig} */

const path = require("path");
const isDev = process.env.NEXT_PUBLIC_ENV == "dev";
const isTest = process.env.NEXT_PUBLIC_ENV == "test";

const allowImageDomains = [
  "next-app-static.s3.ap-southeast-1.amazonaws.com",
  "next-app-static.s3.amazonaws.com",
  "faas-output-image.s3.ap-southeast-1.amazonaws.com",
  // Blog media: Vercel Blob store backing /uploads/... + legacy S3 images
  "ajldkp7ny4bysrxe.public.blob.vercel-storage.com",
  "novita-blog.s3.ap-southeast-1.amazonaws.com",
];

const withPWA = require("next-pwa")({
  dest: "public",
  // E2E build:test 不需要 service worker；跳过 workbox 生成可显著缩短 CI next build。
  disable: isDev || isTest,
});

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const sitemapXmlHeaders = [
  {
    key: "Content-Type",
    value: "application/xml; charset=utf-8",
  },
];

const config = {
  reactStrictMode: true,
  transpilePackages: ["streamdown", "shiki"],
  env: {
    KV_URL: process.env.KV_URL,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
    NEXT_PUBLIC_USE_MOCK: process.env.MOCK,
  },
  output: "standalone",
  experimental: {
    outputFileTracingIncludes: {
      "/*": ["./public/i18n/*.json"],
    },
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/api-catalog",
        destination: "/well-known/api-catalog",
      },
      {
        source: "/.well-known/openapi.json",
        destination: "/well-known/openapi.json",
      },
      {
        source: "/openapi.json",
        destination: "/well-known/openapi.json",
      },
      {
        source: "/.well-known/mcp/server-card.json",
        destination: "/well-known/mcp/server-card.json",
      },
      {
        source: "/.well-known/mcp.json",
        destination: "/well-known/mcp.json",
      },
      {
        source: "/.well-known/mcp/server-cards.json",
        destination: "/well-known/mcp/server-cards.json",
      },
      {
        source: "/.well-known/agent-skills/index.json",
        destination: "/well-known/agent-skills/index.json",
      },
      {
        source: "/.well-known/agent-card.json",
        destination: "/well-known/agent-card.json",
      },
      {
        source: "/.well-known/oauth-authorization-server",
        destination: "/well-known/oauth-authorization-server",
      },
      {
        source: "/.well-known/oauth-protected-resource",
        destination: "/well-known/oauth-protected-resource",
      },
      {
        source: "/.well-known/openid-configuration",
        destination: "/well-known/openid-configuration",
      },
      {
        source: "/.well-known/jwks.json",
        destination: "/well-known/jwks.json",
      },
    ];
  },
  async headers() {
    const headers = [
      {
        // Message catalogs are requested with a ?v=<buildId> version param,
        // so the content behind a given URL never changes and can be cached
        // hard by browsers and the CDN.
        source: "/i18n/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Hero art (poster 16-3.png + the logo.png WebGL texture, ~900KB
        // combined) is otherwise served with Vercel's default
        // `max-age=0, must-revalidate`, forcing a revalidation round-trip on
        // every visit even when the bytes are unchanged — the long
        // "Waiting"/"Content Download" segments seen in the hero waterfall.
        // These filenames are stable, so cache them hard.
        //
        // CAVEAT: these URLs are NOT content-hashed. With `immutable`, replacing
        // an image in place (same filename) leaves users on the cached copy for
        // up to a year. When updating hero art, change the filename (or append a
        // ?v= query) so the URL changes.
        source: "/home/hero/unicon/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: sitemapXmlHeaders,
      },
      {
        source: "/sitemap-page.xml",
        headers: sitemapXmlHeaders,
      },
      {
        source: "/sitemap-image.xml",
        headers: sitemapXmlHeaders,
      },
      {
        source: "/sitemap-image-x.xml",
        headers: sitemapXmlHeaders,
      },
      {
        source: "/sitemap-gpu.xml",
        headers: sitemapXmlHeaders,
      },
      {
        source: "/sitemap-llm-model.xml",
        headers: sitemapXmlHeaders,
      },
      {
        source: "/sitemap-multimodal-model.xml",
        headers: sitemapXmlHeaders,
      },
      {
        source: "/sitemap-blog.xml",
        headers: sitemapXmlHeaders,
      },
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value:
              '</llms.txt>; rel="alternate"; type="text/markdown", </auth.md>; rel="authorization"; type="text/markdown", </.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", </.well-known/openapi.json>; rel="service-desc"; type="application/openapi+json", </.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json", </.well-known/mcp.json>; rel="service-desc"; type="application/json", </mcp>; rel="mcp"; type="application/json", </.well-known/agent-card.json>; rel="agent-card"; type="application/json", </.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json", </.well-known/oauth-authorization-server>; rel="oauth-authorization-server"; type="application/json", </.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json", </.well-known/openid-configuration>; rel="openid-configuration"; type="application/json", </docs/api-reference/model-apis-introduction>; rel="service-doc", </models>; rel="service", </docs/guides/sandbox-overview>; rel="service-doc"',
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];

    if (isDev) {
      headers.push(
        {
          source: "/_next/image(.*)",
          headers: [
            {
              key: "Cache-Control",
              value:
                "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
            {
              key: "Pragma",
              value: "no-cache",
            },
            {
              key: "Expires",
              value: "0",
            },
          ],
        },
        {
          source: "/public/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value:
                "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
            {
              key: "Pragma",
              value: "no-cache",
            },
            {
              key: "Expires",
              value: "0",
            },
          ],
        },
      );
    }

    return headers;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        port: "",
        pathname: "/**",
      },
      ...allowImageDomains.map((domain) => ({
        protocol: "https",
        hostname: domain.replace("https://", ""),
        port: "",
        pathname: "/**",
      })),
    ],
    formats: ["image/webp"],
    minimumCacheTTL: isDev ? 0 : 60,
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["info"] } : false,
  },
  webpack(config) {
    config.module.rules.unshift({
      test: /\.[jt]sx?$/,
      include: path.resolve(__dirname, "src"),
      exclude: [path.resolve(__dirname, "src/i18n")],
      enforce: "pre",
      use: [
        {
          loader: path.resolve(__dirname, "scripts/i18n/loader.js"),
        },
      ],
    });

    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "./src/styles")],
    prependData: `@import "mixins.scss";`,
  },
};

const nextConfig = withBundleAnalyzer(withPWA(config));

module.exports = nextConfig;
