import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { service_base_url } from "@/api/api";
import { NOVITA_URL } from "@/constants/urls";

const AuthSuccPageUrl =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? `http://localhost:3000${NOVITA_URL.OAUTH_SUCCESS}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}${NOVITA_URL.OAUTH_SUCCESS}`;

export async function GET(request: NextRequest) {
  // 1. Extract all query parameters from the request
  const searchParams = request.nextUrl.searchParams;
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope");
  const client_name = searchParams.get("client_name");

  // Ensure required parameters exist
  if (!clientId || !redirectUri || !responseType) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  // 2. Get token from cookie
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 3. Build request URL and parameters
  const query: Record<string, string> = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
  };

  if (state) {
    query.state = state;
  }

  if (scope) {
    query.scope = scope;
  }

  if (client_name) {
    query.client_name = client_name;
  }

  const queryString = new URLSearchParams(query).toString();
  const url = `${service_base_url}/oauth/authorize?${queryString}`;

  try {
    // 4. Call OAuth endpoint on the server
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      redirect: "manual", // Don't automatically follow redirects
    });

    console.log("auth response", response);
    // 5. Handle redirect response
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get("Location");
      if (location) {
        // Encode redirect URL
        const encodedRedirectUrl = btoa(encodeURIComponent(location));

        // Redirect to success page instead of directly to third-party application
        return NextResponse.redirect(
          new URL(
            `${AuthSuccPageUrl}?redirect=${encodedRedirectUrl}&client_name=${
              client_name || ""
            }`,
          ),
        );
      }
    }

    // 6. If not a redirect response, try to parse JSON
    try {
      const data = await response.json();
      if (data.redirect_url) {
        // Encode redirect URL
        const encodedRedirectUrl = btoa(encodeURIComponent(data.redirect_url));

        // Redirect to success page
        return NextResponse.redirect(
          new URL(
            `${AuthSuccPageUrl}?redirect=${encodedRedirectUrl}&client_name=${
              client_name || ""
            }`,
          ),
        );
      } else {
        // Return original response
        return NextResponse.json(data, { status: response.status });
      }
    } catch (error) {
      // If not JSON, return original response content
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "text/plain",
        },
      });
    }
  } catch (error) {
    console.error("Error calling OAuth endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process authorization request" },
      { status: 500 },
    );
  }
}
