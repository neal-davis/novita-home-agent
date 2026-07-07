import { oauthDiscoveryMetadata } from "@/lib/oauth/discovery";

describe("OAuth discovery metadata", () => {
  it("publishes WorkOS-compatible authorization server metadata", () => {
    expect(oauthDiscoveryMetadata).toMatchObject({
      resource: "https://novita.ai",
      authorization_servers: ["https://novita.ai"],
      issuer: "https://novita.ai",
      token_endpoint: "https://api-server.novita.ai/oauth/token",
      revocation_endpoint: "https://novita.ai/settings/key-management",
      grant_types_supported: [
        "authorization_code",
        "refresh_token",
        "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "urn:workos:agent-auth:grant-type:claim",
      ],
    });
  });

  it("publishes Auth.md agent registration metadata", () => {
    expect(oauthDiscoveryMetadata.agent_auth).toEqual({
      skill: "https://novita.ai/auth.md",
      register_uri: "https://novita.ai/oauth/authorize",
      claim_uri: "https://novita.ai/oauth/authorize",
      identity_endpoint: "https://novita.ai/oauth/authorize",
      claim_endpoint: "https://novita.ai/oauth/authorize",
      events_endpoint: "https://novita.ai/.well-known/oauth-protected-resource",
      credential_management_uri: "https://novita.ai/settings/key-management",
      revocation_endpoint: "https://novita.ai/settings/key-management",
      identity_types_supported: ["user_claimed", "identity_assertion"],
      credential_types_supported: ["oauth_access_token", "api_key"],
      identity_assertion: {
        assertion_types_supported: ["verified_email"],
      },
      events_supported: [
        "https://schemas.workos.com/events/agent/auth/identity/assertion/revoked",
      ],
      token_endpoint: "https://api-server.novita.ai/oauth/token",
      scopes_supported: ["openid", "profile", "email", "api", "balance:read"],
    });
  });
});
