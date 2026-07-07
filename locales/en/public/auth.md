# Novita AI Authentication

> Authentication and access summary for agents using Novita AI.

## API Authentication

Novita APIs use bearer token authentication.

- [Create or manage API keys](https://novita.ai/console/key-management): Use the Novita console to create and rotate API keys.
- [Authentication guide](https://novita.ai/docs/api-reference/basic-authentication): Full API authentication reference.
- [OpenAPI description](https://novita.ai/.well-known/openapi.json): Machine-readable API description.

Send API keys in the `Authorization` header:

```http
Authorization: Bearer <NOVITA_API_KEY>
```

Do not place API keys in query strings, client-side code, issue comments, logs, or public repositories.

## API Origins

- [REST API base URL](https://api.novita.ai): `https://api.novita.ai`
- [OpenAI-compatible base URL](https://api.novita.ai/openai): `https://api.novita.ai/openai`

## OAuth Discovery

- [OAuth authorization server metadata](https://novita.ai/.well-known/oauth-authorization-server): Authorization server metadata.
- [OpenID configuration](https://novita.ai/.well-known/openid-configuration): OpenID Connect discovery metadata.
- [OAuth protected resource metadata](https://novita.ai/.well-known/oauth-protected-resource): Resource metadata for agent clients.

## Access Notes

- Public documentation can be accessed without authentication.
- Console workflows require a signed-in Novita account.
- API calls require a valid Novita API key with sufficient balance, quota, and permissions.
- Billing, team settings, API key management, and usage pages are intentionally private.

## Related Links

- [Pricing](https://novita.ai/pricing): Public product pricing.
- [Terms of Service](https://novita.ai/legal/terms-of-service): Terms for using Novita AI.
- [Privacy Policy](https://novita.ai/legal/privacy-policy): Privacy policy.
- [llms.txt](https://novita.ai/llms.txt): Agent documentation index.
