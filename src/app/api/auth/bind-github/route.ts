import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_BIND_GITHUB_RESULT,
  AUTH_FAILED_REASON,
  AUTH_RESULT,
  AUTH_RESULT_FAILED,
  AUTH_RESULT_SUCCESS,
} from "@/constants/auth";
import { NOVITA_URL } from "@/constants/urls";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * This API endpoint is only called when binding GitHub authorization from the NOVITA_URL.REFERRAL page
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);

  const code = searchParams.get("code");

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const redirectUrl = `${origin}${NOVITA_URL.REFERRAL}`;

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  const handleLoginSuccess = () => {
    const url = new URL(redirectUrl);
    url.searchParams.set(AUTH_BIND_GITHUB_RESULT, AUTH_RESULT_SUCCESS);
    return NextResponse.redirect(url);
  };

  try {
    const response = await fetch(`${BASE_URL}/v1/activity/related-github`, {
      method: "POST",
      body: JSON.stringify({
        code,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("data", data);
    if (data && data.code && data.code !== 200) {
      const url = new URL(redirectUrl);
      url.searchParams.set(AUTH_RESULT, AUTH_RESULT_FAILED);
      url.searchParams.set(AUTH_FAILED_REASON, data.reason || data.message);
      return NextResponse.redirect(url);
    }
    return handleLoginSuccess();
  } catch (error) {
    console.log("error", error);
    const url = new URL(redirectUrl);
    url.searchParams.set(AUTH_RESULT, AUTH_RESULT_FAILED);
    return NextResponse.redirect(url);
  }
}
