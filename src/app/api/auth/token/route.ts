import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_IS_NEW_REGISTER,
  AUTH_RESULT,
  AUTH_RESULT_SUCCESS,
} from "@/constants/auth";
import { NOVITA_URL } from "@/constants/urls";
import { isWhitelistedRedirectUrl } from "@/lib/utils/url";

const COOKIE_EXPIRE_TIME = 60 * 60 * 24 * 7;

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

const isAllowedRedirect = (url: string): boolean => {
  if (!isAbsoluteUrl(url)) return true;
  return isWhitelistedRedirectUrl(url);
};

const setAuthStatusParams = (url: URL, isReg: string | null): void => {
  url.searchParams.set(AUTH_RESULT, AUTH_RESULT_SUCCESS);
  if (isReg) {
    url.searchParams.set(AUTH_IS_NEW_REGISTER, isReg);
  }
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const isReg = url.searchParams.get("is_reg");
  const inviteToken = url.searchParams.get("invite_token");
  const redirect = url.searchParams.get("redirect");

  if (!token) {
    return NextResponse.redirect(new URL(url.origin));
  }

  const cookieStore = cookies();
  cookieStore.set("token", token, { maxAge: COOKIE_EXPIRE_TIME });

  if (inviteToken) {
    const inviteUrl = new URL(`${url.origin}/${NOVITA_URL.TEAM_INVITE}`);
    inviteUrl.searchParams.set("token", inviteToken);
    setAuthStatusParams(inviteUrl, isReg);
    return NextResponse.redirect(inviteUrl);
  }

  if (redirect && redirect !== "/" && isAllowedRedirect(redirect)) {
    const redirectUrl = buildRedirectUrl(redirect, url.origin);
    setAuthStatusParams(redirectUrl, isReg);
    return NextResponse.redirect(redirectUrl);
  }

  const defaultUrl = new URL(NOVITA_URL.CONSOLE, url.origin);
  setAuthStatusParams(defaultUrl, isReg);
  return NextResponse.redirect(defaultUrl);
}
