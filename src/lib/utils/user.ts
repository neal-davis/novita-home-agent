import {
  getServerlessAccess,
  getServerlessAccessEmail,
  reportInternalEvent,
} from "@/api/config";
import { DEBUG_MODE } from "@/constants/constants";
import { LOGIN_NOT_REDIRECT_URL, NOVITA_URL } from "@/constants/urls";
import { setIsReg, setShowLoginModal } from "@/store/slice/configSlice";
import { fetchUserInfo } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { AnyAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";
import { Dispatch } from "react";
import { REDIRECT_WHITELIST_DOMAINS } from "@/constants/auth";
import { dataLayerPushEvent, GA_ENVENT } from "../event";
import { info } from "@/api/user";
import {
  getLocalizedPath,
  getPathnameLocale,
  getPathnameWithoutLocale,
} from "@/i18n/config";

export const SERVERLESS_ACCESS_KEY = "SERVERLESS_ACCESS_KEY";

export function getSanitizedUserId(uuid: string | number) {
  const id = uuid.toString();
  if (id.length < 3) {
    return id;
  }
  const sliceLength = Math.min(Math.floor(id.length / 3), 5);
  return `${id.slice(0, sliceLength)}****${id.slice(-sliceLength)}`;
}

export async function syncServerlessAccessEmail({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) {
  if (!email && !uuid) {
    return;
  }
  try {
    const data = await getServerlessAccessEmail({ email, uuid });
    localStorage.setItem(SERVERLESS_ACCESS_KEY, JSON.stringify(data));
  } catch {
    //
  }
}

export async function syncServerlessAccess({
  mobilePhone,
  uuid,
}: {
  mobilePhone: string;
  uuid: string;
}) {
  if (!mobilePhone && !uuid) {
    return;
  }
  try {
    const data = await getServerlessAccess({ mobilePhone, uuid });
    localStorage.setItem(SERVERLESS_ACCESS_KEY, JSON.stringify(data));
  } catch {
    //
  }
}

export function checkServerlessAccess({
  email,
  mobilePhone,
  uuid,
}: {
  email: string;
  mobilePhone: string;
  uuid: string;
}): boolean {
  if ((!mobilePhone || !email) && !uuid) {
    return false;
  }
  try {
    const result = localStorage.getItem(SERVERLESS_ACCESS_KEY);
    const data = JSON.parse(result || "");
    if (Array.isArray(data)) {
      console.log(
        "serverless Auth:",
        data[0]?.email === email || data[0]?.uuid === uuid,
      );
      return data[0]?.email === email || data[0]?.uuid === uuid;
    }
  } catch {
    //
  }
  return false;
}

export function handleLoginSuccessCb({
  response,
  searchParams,
  router,
  dispatch,
  pathname,
}: {
  response: {
    token?: string;
    isReg?: string; // is first log in
  };
  searchParams: ReadonlyURLSearchParams;
  router: AppRouterInstance;
  dispatch: Dispatch<AnyAction>;
  pathname: string;
}) {
  if (response.token) {
    const cookieOptions: any = { expires: 7 };
    if (
      typeof window !== "undefined" &&
      window.location.hostname.includes("novita.ai")
    ) {
      cookieOptions.domain = ".novita.ai";
    }
    Cookies.set("token", response.token, cookieOptions);
  }

  const redirectStr =
    searchParams.get("redirect") || localStorage.getItem("redirect");
  const locale = getPathnameLocale(pathname).locale;
  const businessPathname = getPathnameWithoutLocale(pathname);
  const localizePath = (href: string) =>
    locale ? getLocalizedPath(href, locale) : href;
  // open celebrate modal

  if (redirectStr && redirectStr !== NOVITA_URL.REFERRAL) {
    if (localStorage.getItem(DEBUG_MODE)) {
      dispatch(setIsReg(true) as any);
    } else {
      dispatch(setIsReg(response.isReg == "true" ? true : false) as any);
    }
  }

  setTimeout(async () => {
    if (response.token) {
      const userInfo = await info();
      if (userInfo.uid && userInfo.uuid) {
        await reportInternalEvent({
          uid: userInfo.uid,
          action: "LOGIN",
        });
      }
    }
  });

  const inviteToken = searchParams.get("invite_token");
  if (inviteToken) {
    router.push(localizePath(`${NOVITA_URL.TEAM_INVITE}?token=${inviteToken}`));
    return;
  }

  if (redirectStr) {
    localStorage.removeItem("redirect");
    if (
      REDIRECT_WHITELIST_DOMAINS.some((domain) =>
        (redirectStr || "").includes(domain),
      ) &&
      typeof window !== "undefined"
    ) {
      window.location.href = redirectStr;
      return;
    }
    if (redirectStr === "/") {
      router.push(localizePath("/console"));
    } else {
      router.push(localizePath(redirectStr));
    }
  } else {
    if (
      !LOGIN_NOT_REDIRECT_URL.some((url) => businessPathname.startsWith(url))
    ) {
      router.push(localizePath("/console"));
    }
  }
  dispatch(fetchUserInfo() as any);
  dispatch(setShowLoginModal(false) as any);
  dispatch(fetchBalanceDetail() as any);

  // report third party event
  try {
    setTimeout(() => {
      if (response.isReg == "true") {
        dataLayerPushEvent({
          event: GA_ENVENT.SIGN_UP_SUCCESS,
        });
      } else {
        dataLayerPushEvent({
          event: GA_ENVENT.SIGN_IN_SUCCESS,
        });
      }
    });
  } catch (e) {
    console.error("report event error", e);
  }
}

export function makeLoginRegisterUrl(
  baseUrl: string,
  searchParams: Record<string, any>,
) {
  const searchInfo = new URLSearchParams();

  if (searchParams.inviteToken) {
    searchInfo.append("invite_token", searchParams.inviteToken);
  }
  if (searchParams.source) {
    searchInfo.append("utm_source", searchParams.source);
  }
  if (searchParams.campaignSlug) {
    searchInfo.append(searchParams.campaignSlug, "1");
  }

  const searchStr = searchInfo.toString();
  if (searchStr) {
    return `${baseUrl}?${searchStr}`;
  }
  return baseUrl;
}
