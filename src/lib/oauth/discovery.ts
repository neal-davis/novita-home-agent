const SITE_ORIGIN = "https://novita.ai";
const API_SERVER_ORIGIN = "https://api-server.novita.ai";

export const oauthDiscoveryMetadata = {
  resource: SITE_ORIGIN,
  authorization_servers: [SITE_ORIGIN],
  issuer: SITE_ORIGIN,
  authorization_endpoint: `${SITE_ORIGIN}/oauth/authorize`,
  token_endpoint: `${API_SERVER_ORIGIN}/oauth/token`,
  revocation_endpoint: `${SITE_ORIGIN}/settings/key-management`,
  jwks_uri: `${SITE_ORIGIN}/.well-known/jwks.json`,
  response_types_supported: ["code"],
  grant_types_supported: [
    "authorization_code",
    "refresh_token",
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "urn:workos:agent-auth:grant-type:claim",
  ],
  token_endpoint_auth_methods_supported: [
    "client_secret_basic",
    "client_secret_post",
    "none",
  ],
  scopes_supported: ["openid", "profile", "email", "api", "balance:read"],
  code_challenge_methods_supported: ["S256"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
  agent_auth: {
    skill: `${SITE_ORIGIN}/auth.md`,
    register_uri: `${SITE_ORIGIN}/oauth/authorize`,
    claim_uri: `${SITE_ORIGIN}/oauth/authorize`,
    identity_endpoint: `${SITE_ORIGIN}/oauth/authorize`,
    claim_endpoint: `${SITE_ORIGIN}/oauth/authorize`,
    events_endpoint: `${SITE_ORIGIN}/.well-known/oauth-protected-resource`,
    credential_management_uri: `${SITE_ORIGIN}/settings/key-management`,
    revocation_endpoint: `${SITE_ORIGIN}/settings/key-management`,
    identity_types_supported: ["user_claimed", "identity_assertion"],
    credential_types_supported: ["oauth_access_token", "api_key"],
    identity_assertion: {
      assertion_types_supported: ["verified_email"],
    },
    events_supported: [
      "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked",
    ],
    token_endpoint: `${API_SERVER_ORIGIN}/oauth/token`,
    scopes_supported: ["openid", "profile", "email", "api", "balance:read"],
  },
};
