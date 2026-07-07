import { requestInServerEnv } from "./api";

/**
 * Query OAuth2.0 configuration
 * @param {string} clientId - Application ID
 * @param {string} scope - List of granted permissions, connected by spaces, e.g.: openid profile api balance:read
 */
export function getOAuthClient(
  clientId: string,
  scope: string,
  token: string,
): Promise<
  | {
      name: string;
      logo_url: string;
      homepage_url?: string;
      scopes: Array<{
        scope: string;
        description: string;
      }>;
    }
  | APICommonErrorResponse
> {
  return requestInServerEnv({
    url: "/oauth/client",
    method: "GET",
    token,
    query: {
      client_id: clientId,
      scope,
    },
  });
}

// export function getOAuthAuthorize(
//   client_id: string,
//   redirect_uri: string,
//   response_type: string,
//   state: string,
//   scope: string,
//   token: string,
// ): Promise<any> {
//   return requestInServerEnv({
//     url: "/oauth/authorize",
//     method: "GET",
//     token,
//     query: {
//       client_id,
//       redirect_uri,
//       response_type,
//       state,
//       scope,
//     },
//   });
// }
