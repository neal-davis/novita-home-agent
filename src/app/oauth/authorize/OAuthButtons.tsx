"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import Cookies from "js-cookie";
// import { getOAuthAuthorize } from "@/api/oauth";

interface OAuthButtonsProps {
  clientId: string;
  redirectUri: string;
  responseType: string;
  state?: string;
  scope?: string;
  clientName?: string;
}

export default function OAuthButtons({
  clientId,
  redirectUri,
  responseType,
  state,
  scope,
  clientName,
}: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthorize = () => {
    console.log("handleAuthorize*******************");
    console.log("clientId", clientId);
    console.log("redirectUri", redirectUri);
    console.log("responseType", responseType);
    console.log("clientName", clientName);
    if (!clientId || !redirectUri || !responseType) {
      return;
    }

    setIsLoading(true);

    // Build parameters object
    const params: Record<string, string> = {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: responseType,
    };
    console.log("state", state);
    console.log("scope", scope);

    if (state) {
      params.state = state;
    }

    if (scope) {
      params.scope = scope;
    }

    if (clientName) {
      params.client_name = clientName;
    }

    // getOAuthAuthorize(
    //   clientId,
    //   redirectUri,
    //   responseType,
    //   state || "",
    //   scope || "",
    //   Cookies.get("token") || "",
    // ).then((res) => {
    //   console.log("res", res);
    // });

    const queryString = new URLSearchParams(params).toString();

    const apiUrl = `/api/oauth/authorize?${queryString}`;
    console.log("apiUrl", apiUrl);
    window.location.href = apiUrl;
  };

  const handleDeny = () => {
    if (!redirectUri) {
      return;
    }

    try {
      // Directly build the authorization denial redirect URL
      const url = new URL(redirectUri);

      // Add OAuth 2.0 standard error parameters
      url.searchParams.append("error", "access_denied");
      url.searchParams.append(
        "error_description",
        "The user denied the request",
      );

      // If the original request contains a state parameter, return it as is
      if (state) {
        url.searchParams.append("state", state);
      }

      // Directly redirect to the client application
      window.location.href = url.toString();
    } catch (error) {
      console.error("Invalid redirect_uri:", error);
      // If redirect_uri is invalid, fall back to previous page
      window.history.back();
    }
  };

  return (
    <>
      <div className="flex justify-between gap-x-4">
        <div className="flex-1">
          {clientId === "481bde767e2c4a1f933ab36c" ? (
            <Button
              asChild
              // id={CLICK_BTN_IDs.OAUTH.REFUSE}
              variant="outline"
              className="w-full h-9"
            >
              <Link href="/oauth/authorize/refuse">Decline</Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full h-9"
              onClick={handleDeny}
            >
              Decline
            </Button>
          )}
        </div>
        <div className="flex-1">
          <Button
            className="w-full bg-[var(--black)] hover:bg-[var(--dark-2)] text-white h-9"
            onClick={handleAuthorize}
            disabled={isLoading}
          >
            {isLoading ? "Authorizing..." : "Authorize"}
          </Button>
        </div>
      </div>
    </>
  );
}
