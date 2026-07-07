import { NextResponse } from "next/server";

const SITE_ORIGIN = "https://novita.ai";
const API_SERVER_ORIGIN = "https://api-server.novita.ai";

const authMd = `# Auth.md

Novita AI supports agent-facing authentication and registration through OAuth discovery metadata and user-approved OAuth authorization.

## Service

- Name: Novita AI
- Website: ${SITE_ORIGIN}
- Documentation: ${SITE_ORIGIN}/docs/guides/introduction
- OAuth authorization server metadata: ${SITE_ORIGIN}/.well-known/oauth-authorization-server
- OAuth protected resource metadata: ${SITE_ORIGIN}/.well-known/oauth-protected-resource

## Agent Registration

Agents should register or request access by using the OAuth authorization code flow with PKCE.

1. Fetch ${SITE_ORIGIN}/.well-known/oauth-protected-resource to discover the protected resource and authorization server.
2. Fetch ${SITE_ORIGIN}/.well-known/oauth-authorization-server and read the agent_auth block.
3. Send the user to the register_uri with a client_id, redirect_uri, response_type=code, requested scope, state, and S256 PKCE challenge.
4. Exchange the returned authorization code at ${API_SERVER_ORIGIN}/oauth/token.
5. Use the issued access token as a Bearer token for Novita APIs that accept OAuth credentials.

## Supported Identity Types

- user_claimed: the user signs in to Novita AI and approves the agent or OAuth client.

## Supported Credential Types

- oauth_access_token: issued by the OAuth token endpoint after user approval.
- api_key: available from the Novita console for APIs that require API key authentication.

## Scopes

- openid
- profile
- email
- api
- balance:read

## Claim and Revocation

- Claim URI: ${SITE_ORIGIN}/oauth/authorize
- Credential management URI: ${SITE_ORIGIN}/settings/key-management
- Revocation: users can revoke or delete API keys from the credential management URI. OAuth token revocation is not advertised as a machine endpoint until a public revocation endpoint is available.

## Security Notes

- Agents must request only the minimum scopes needed for the task.
- Agents must keep access tokens and API keys secret.
- Agents must send API keys with Authorization: Bearer <NOVITA_API_KEY> where API key authentication is required.
- Agents must send OAuth access tokens with Authorization: Bearer <ACCESS_TOKEN> where OAuth authentication is supported.
`;

export const dynamic = "force-static";

export async function GET() {
  return new NextResponse(authMd, {
    headers: {
      // i18n-disable-next-line
      "Content-Type": "text/markdown; charset=utf-8",
      // i18n-disable-next-line
      "Cache-Control": "public, max-age=3600",
      // i18n-disable-next-line
      "Access-Control-Allow-Origin": "*",
      // i18n-disable-next-line
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      // i18n-disable-next-line
      "Access-Control-Allow-Origin": "*",
      // i18n-disable-next-line
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      // i18n-disable-next-line
      "Access-Control-Allow-Headers": "Content-Type",
      // i18n-disable-next-line
      "Access-Control-Max-Age": "86400",
    },
  });
}
