import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_RESULT_SUCCESS,
  AUTH_RESULT,
  AUTH_IS_NEW_REGISTER,
  AUTH_RESULT_FAILED,
  AUTH_CB_URL_KEY,
  AUTH_TYPE,
  AUTH_TYPE_GOOGLE,
  AUTH_TYPE_HUGGINGFACE,
  AUTH_TYPE_GITHUB,
  AUTH_STATE,
} from "@/constants/auth";
import { NOVITA_URL } from "@/constants/urls";
import {
  isTestEnvironmentOrigin,
  isUnifiedAuthRelayOrigin,
  isWhitelistedRedirectUrl,
} from "@/lib/utils/url";
import { nanoid } from "nanoid";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// vercel 分支预览环境下的 API 地址
const PREVIEW_BASE_URL =
  process.env.NEXT_PUBLIC_PREVIEW_BASE_URL ||
  "https://dev-api-server.novita.ai";
const COOKIE_EXPIRE_TIME = 60 * 60 * 24 * 7; // 7 days

// 类型定义
interface AuthResponse {
  token: string;
  isReg: string;
}

interface AuthParams {
  code: string;
  authType: string;
  state?: string;
  authState?: string;
}

interface CookieData {
  authCallbackUrl?: string;
  source?: string;
  campaignId?: string;
  campaignName?: string;
  medium?: string;
  ref?: string;
  collect?: string;
  user_agent?: string;
  landingpage?: string;
  utm_adgroup?: string;
  utm_content?: string;
  utm_term?: string;
  templateId?: string;
  sharer?: string;
  redirectUrl?: string;
  campaignCode?: string;
  refferalCode?: string;
  inviteToken?: string;
}

interface StateData {
  origin?: string;
  authType?: string;
  callbackUrl?: string;
  redirectUrl?: string;
  inviteToken?: string;
}

const getCookieData = (
  cookieStore: ReturnType<typeof cookies>,
): CookieData => ({
  authCallbackUrl: cookieStore.get(AUTH_CB_URL_KEY)?.value,
  source: cookieStore.get("source")?.value,
  campaignId: cookieStore.get("utm_id")?.value,
  campaignName: cookieStore.get("utm_campaign")?.value,
  medium: cookieStore.get("utm_medium")?.value,
  ref: cookieStore.get("ref")?.value,
  collect: cookieStore.get("collect")?.value,
  user_agent: cookieStore.get("user_agent")?.value,
  landingpage: cookieStore.get("landingpage")?.value,
  utm_adgroup: cookieStore.get("utm_adgroup")?.value,
  utm_content: cookieStore.get("utm_content")?.value,
  utm_term: cookieStore.get("utm_term")?.value,
  templateId: cookieStore.get("share_template_id")?.value,
  sharer: cookieStore.get("share_sharer_uuid")?.value,
  redirectUrl: cookieStore.get("redirect")?.value,
  campaignCode: cookieStore.get("campaign_code")?.value,
  refferalCode: cookieStore.get("invited_code")?.value,
  inviteToken: cookieStore.get("invite_token")?.value,
});

const buildFormData = (code: string, cookieData: CookieData) => ({
  code,
  source: cookieData.source || "Direct",
  campaignId: cookieData.campaignId,
  campaignName: cookieData.campaignName,
  medium: cookieData.medium,
  ref: cookieData.ref,
  collect: cookieData.collect,
  user_agent: cookieData.user_agent,
  redirectUrl: decodeURIComponent(cookieData.authCallbackUrl || ""),
  fromInviteCode: cookieData.campaignCode || cookieData.refferalCode,
  landingPage: cookieData.landingpage,
  utm_adgroup: cookieData.utm_adgroup,
  utm_content: cookieData.utm_content,
  utm_term: cookieData.utm_term,
  templateId: cookieData.templateId,
  sharer: cookieData.sharer,
  verify_code: `website_${nanoid(10)}`,
});

const validateAuthParams = (params: AuthParams): boolean => {
  const { code, authType, state, authState } = params;

  if (!code || !authType) {
    return false;
  }

  if (authType === AUTH_TYPE_HUGGINGFACE && (!state || state !== authState)) {
    return false;
  }

  return true;
};

const setAuthStatusParams = (url: URL, isNewRegister: boolean): void => {
  url.searchParams.set(AUTH_RESULT, AUTH_RESULT_SUCCESS);
  url.searchParams.set(AUTH_IS_NEW_REGISTER, isNewRegister ? "true" : "false");
};

const clearAuthCookies = (cookieStore: ReturnType<typeof cookies>): void => {
  cookieStore.set("share_template_id", "");
  cookieStore.set("share_sharer_uuid", "");
};

const parseStateData = (state: string | null): StateData => {
  if (!state) return {};

  try {
    return JSON.parse(atob(state));
  } catch {
    return {};
  }
};

const isAbsoluteUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return !!urlObj.protocol;
  } catch {
    return false;
  }
};

const buildRedirectUrl = (url: string, origin: string): URL => {
  if (isAbsoluteUrl(url)) {
    return new URL(url);
  }
  const path = url.startsWith("/") ? url : `/${url}`;
  return new URL(path, origin);
};

const handleLoginSuccess = (
  data: AuthResponse,
  cookieStore: ReturnType<typeof cookies>,
  origin: string,
  cookieData: CookieData,
  stateData: StateData,
): NextResponse => {
  const isNewRegister = data.isReg === "true";

  clearAuthCookies(cookieStore);

  if (stateData.origin && isUnifiedAuthRelayOrigin(stateData.origin)) {
    const tokenUrl = new URL("/api/auth/token", stateData.origin);
    tokenUrl.searchParams.set("token", data.token);
    tokenUrl.searchParams.set("is_reg", String(isNewRegister));
    const inviteToken = stateData.inviteToken || cookieData.inviteToken;
    const redirectUrl = stateData.redirectUrl || cookieData.redirectUrl;

    if (inviteToken) {
      tokenUrl.searchParams.set("invite_token", inviteToken);
    } else if (redirectUrl && redirectUrl !== "/") {
      tokenUrl.searchParams.set("redirect", redirectUrl);
    }
    return NextResponse.redirect(tokenUrl);
  }

  const cookieOptions: any = {
    maxAge: COOKIE_EXPIRE_TIME,
  };
  if (origin.includes("novita.ai")) {
    cookieOptions.domain = ".novita.ai";
  }
  cookieStore.set("token", data.token, cookieOptions);

  if (cookieData.inviteToken) {
    const inviteUrl = new URL(`${origin}/${NOVITA_URL.TEAM_INVITE}`);
    inviteUrl.searchParams.set("token", cookieData.inviteToken);
    setAuthStatusParams(inviteUrl, isNewRegister);
    cookieStore.delete("invite_token");
    return NextResponse.redirect(inviteUrl);
  }

  if (cookieData.redirectUrl && cookieData.redirectUrl !== "/") {
    const redirectUrlValue = cookieData.redirectUrl;
    if (isAbsoluteUrl(redirectUrlValue)) {
      const isWhitelisted = isWhitelistedRedirectUrl(redirectUrlValue);
      if (!isWhitelisted) {
        const defaultUrl = new URL(`${origin}/${NOVITA_URL.CONSOLE}`);
        setAuthStatusParams(defaultUrl, isNewRegister);
        return NextResponse.redirect(defaultUrl);
      }
    }
    const redirectUrl = buildRedirectUrl(redirectUrlValue, origin);
    setAuthStatusParams(redirectUrl, isNewRegister);
    return NextResponse.redirect(redirectUrl);
  }

  const defaultUrl = new URL(`${origin}/${NOVITA_URL.CONSOLE}`);
  setAuthStatusParams(defaultUrl, isNewRegister);
  return NextResponse.redirect(defaultUrl);
};

const handleLoginError = (origin: string): NextResponse => {
  const errorUrl = new URL(origin);
  errorUrl.searchParams.set(AUTH_RESULT, AUTH_RESULT_FAILED);
  return NextResponse.redirect(errorUrl);
};

const getAuthEndpoint = (
  authType: string,
  stateData: StateData,
): string | null => {
  const baseUrl =
    stateData.origin && isTestEnvironmentOrigin(stateData.origin)
      ? PREVIEW_BASE_URL
      : BASE_URL;

  const authEndpoints = {
    [AUTH_TYPE_GOOGLE]: `${baseUrl}/v1/user/googleAuth`,
    [AUTH_TYPE_GITHUB]: `${baseUrl}/v2/user/githubAuth`,
    [AUTH_TYPE_HUGGINGFACE]: `${baseUrl}/v1/user/huggingfaceAuth`,
  };

  return authEndpoints[authType as keyof typeof authEndpoints] || null;
};

const sendAuthRequest = async (
  endpoint: string,
  formData: any,
): Promise<AuthResponse | null> => {
  const fetchConfig = {
    method: "POST",
    body: JSON.stringify(formData),
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(endpoint, fetchConfig);

    if (!response.ok) {
      console.error(
        "Auth request failed:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const data = await response.json();
    console.info("Auth response:", data);

    return data?.token ? data : null;
  } catch (error) {
    console.error("Auth request error:", error);
    return null;
  }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const cookieStore = cookies();
    const stateData = parseStateData(state);
    const authType = stateData.authType || cookieStore.get(AUTH_TYPE)?.value;
    const authState = cookieStore.get(AUTH_STATE)?.value;

    const url = new URL(req.url);
    const origin = url.origin;

    const authParams: AuthParams = {
      code: code || "",
      authType: authType || "",
      state: state || undefined,
      authState,
    };

    if (!validateAuthParams(authParams)) {
      console.info("Invalid auth params:", authParams);
      return NextResponse.redirect(origin);
    }

    const cookieData = getCookieData(cookieStore);
    if (!cookieData.authCallbackUrl && stateData.callbackUrl) {
      cookieData.authCallbackUrl = encodeURIComponent(stateData.callbackUrl);
    }

    const formData = buildFormData(code!, cookieData);
    console.info("Auth form data:", formData);

    const endpoint = getAuthEndpoint(authType!, stateData);
    if (!endpoint) {
      console.error("Unknown auth type:", authType);
      return handleLoginError(origin);
    }

    const authResult = await sendAuthRequest(endpoint, formData);

    if (authResult) {
      return handleLoginSuccess(
        authResult,
        cookieStore,
        origin,
        cookieData,
        stateData,
      );
    } else {
      return handleLoginError(origin);
    }
  } catch (error) {
    console.error("Unexpected error in auth handler:", error);
    const url = new URL(req.url);
    return handleLoginError(url.origin);
  }
}
