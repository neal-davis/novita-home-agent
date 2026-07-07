"use client";
import { NOVITA_URL } from "@/constants/urls";

import { bindGithub, GithubLogin, GoogleLogin } from "@/api/user";
import { AFFILIATE_INVITE_URL_KEY } from "@/constants/constants";
import { handleLoginSuccessCb } from "@/lib/utils/user";
import { getUserCollect } from "@/lib/utils/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getRegistrationCampaignCode } from "@/lib/utils/registrationCampaign";
import { useCallback, useLayoutEffect, useRef } from "react";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export function useOauth({
  beforeFetchCb,
  successCb,
  errorCb,
  finallyCb,
}: {
  beforeFetchCb?: () => void;
  successCb?: () => void;
  errorCb?: () => void;
  finallyCb?: () => void;
}) {
  const search = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const businessPath = getPathnameWithoutLocale(path);
  const { locale } = useI18n();
  const dispatch = useAppDispatch();
  const uuid = useAppSelector((state) => state.user.uuid);

  const code = search.get("code");
  const scope = search.get("scope");
  const loginExecuted = useRef(false);

  const clearPathCode = useCallback(() => {
    router.replace(path);
  }, [path, router]);

  const handleGithubLogin = useCallback(async () => {
    try {
      const collectInfo = getUserCollect();
      GithubLogin({
        ...collectInfo,
        code,
        sign_up_from: localStorage.getItem("sign_up_from"),
        fromInviteCode:
          getRegistrationCampaignCode() ||
          localStorage.getItem(AFFILIATE_INVITE_URL_KEY),
      }).then((res: any) => {
        handleLoginSuccessCb({
          response: res,
          searchParams: search,
          router,
          dispatch,
          pathname: path,
        });
        successCb?.();

        if (businessPath === NOVITA_URL.REFERRAL) {
          window.location.reload();
        }
      });
    } catch (error) {
      errorCb?.();
      clearPathCode();
    } finally {
      localStorage.removeItem(AFFILIATE_INVITE_URL_KEY);
      loginExecuted.current = false;
      finallyCb?.();
    }
  }, [
    businessPath,
    clearPathCode,
    code,
    dispatch,
    errorCb,
    finallyCb,
    path,
    router,
    search,
    successCb,
  ]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      const collectInfo = getUserCollect();
      const resp = await GoogleLogin({
        code,
        redirectUrl: `${window.location.origin}${path}`,
        ...collectInfo,
        sign_up_from: localStorage.getItem("sign_up_from"),
        fromInviteCode:
          getRegistrationCampaignCode() ||
          localStorage.getItem(AFFILIATE_INVITE_URL_KEY),
      });
      if (resp.token) {
        handleLoginSuccessCb({
          response: resp,
          searchParams: search,
          router,
          dispatch,
          pathname: path,
        });
        successCb?.();

        if (businessPath === NOVITA_URL.REFERRAL) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.log("error", error);
      errorCb?.();
      clearPathCode();
    } finally {
      localStorage.removeItem(AFFILIATE_INVITE_URL_KEY);
      loginExecuted.current = false;
      finallyCb?.();
    }
  }, [
    businessPath,
    clearPathCode,
    code,
    dispatch,
    errorCb,
    finallyCb,
    path,
    router,
    search,
    successCb,
  ]);

  const handleBindingGithub = useCallback(
    (code: string) => {
      bindGithub(code)
        .then(() => {
          router.push(getLocalizedPath(NOVITA_URL.REFERRAL, locale));
          // refresh page
          window.location.reload();
          successCb?.();
        })
        .catch(() => {
          errorCb?.();
          clearPathCode();
        })
        .finally(() => {
          localStorage.removeItem("isBindingGithub");
          loginExecuted.current = false;
          finallyCb?.();
        });
    },
    [clearPathCode, errorCb, finallyCb, locale, router, successCb],
  );

  useLayoutEffect(() => {
    if (code && !loginExecuted.current) {
      beforeFetchCb?.();
      loginExecuted.current = true;
      const isBindingGithub = localStorage.getItem("isBindingGithub");
      if (scope?.includes("google")) {
        handleGoogleLogin();
      } else {
        if (isBindingGithub === "true" && uuid) {
          handleBindingGithub(code);
        } else {
          handleGithubLogin();
        }
      }
    }
  }, [
    beforeFetchCb,
    code,
    handleBindingGithub,
    handleGithubLogin,
    handleGoogleLogin,
    scope,
    uuid,
  ]);

  return {};
}
