import { oauthDiscoveryMetadata } from "@/lib/oauth/discovery";

const SITE_ORIGIN = "https://novita.ai";

export const oauthProtectedResourceMetadata = {
  resource: SITE_ORIGIN,
  authorization_servers: [oauthDiscoveryMetadata.issuer],
  scopes_supported: oauthDiscoveryMetadata.scopes_supported,
  bearer_methods_supported: ["header"],
  // i18n-disable-next-line
  resource_name: "Novita AI",
  resource_documentation: `${SITE_ORIGIN}/docs/guides/introduction`,
  resource_tos_uri: `${SITE_ORIGIN}/legal/terms-of-service`,
  resource_policy_uri: `${SITE_ORIGIN}/legal/privacy-policy`,
};

export const discoveryHeaders = {
  // i18n-disable-next-line
  "Content-Type": "application/json; charset=utf-8",
  // i18n-disable-next-line
  "Cache-Control": "public, max-age=3600",
  // i18n-disable-next-line
  "Access-Control-Allow-Origin": "*",
  // i18n-disable-next-line
  "X-Content-Type-Options": "nosniff",
};
