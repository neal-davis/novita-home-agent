"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { message } from "@/components/ui/standard/notify";
import {
  UserState,
  fetchUserInfo,
  setUserState,
  logout,
  fetchAllTeamMembers,
} from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { fetchEnterprise, fetchUserDiscount } from "@/store/slice/configSlice";
import { LOGIN_REQUIRED_URL } from "@/constants/urls";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export const useHeaderAuth = () => {
  const router = useRouter();
  const path = usePathname();
  const { locale } = useI18n();
  const businessPath = getPathnameWithoutLocale(path);
  const dispatch = useAppDispatch();

  const enterprise = useAppSelector(
    (state) => state.config.enterprise.isWhiteListUser,
  );
  const username = useAppSelector((state) => state.user.username);
  const email = useAppSelector((state) => state.user.email);
  const uuid = useAppSelector((state) => state.user.uuid);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const allTeamMembers = useAppSelector((state) => state.user.allTeamMembers);
  const availableCredit = useAppSelector(
    (state) => state.billing.balanceDetail.availableCredit,
  );
  const balanceStatus = useAppSelector(
    (state) => state.billing.balanceDetail.status,
  );

  const [isLogin, setIsLogin] = useState(Boolean(uuid));

  const hasShownLoginMessage = useRef(false);

  const logoutFn = useCallback(() => {
    dispatch(logout());
    window.location.href = getLocalizedPath("/", locale);
  }, [dispatch, locale]);

  // Update login state when uuid changes
  useEffect(() => {
    setIsLogin(Boolean(uuid));
  }, [uuid]);

  // Fetch user info when token exists
  useEffect(() => {
    const token = Cookies.get("token");

    dispatch(fetchUserDiscount() as any);

    if (token) {
      dispatch(fetchUserInfo() as any);
      dispatch(fetchBalanceDetail() as any);
      dispatch(fetchEnterprise() as any);
    }
  }, [dispatch]);

  // Handle not logged in state
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      dispatch(setUserState(UserState.logout) as any);
      // Only show login message once, when path changes
      if (
        LOGIN_REQUIRED_URL.includes(businessPath) &&
        !hasShownLoginMessage.current
      ) {
        hasShownLoginMessage.current = true;
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const redirect = hash ? `${path}${hash}` : path;
        message.error("Please log in first");
        router.push(
          getLocalizedPath(
            `/user/login?redirect=${encodeURIComponent(redirect)}`,
            locale,
          ),
        );
      }
    }
  }, [businessPath, dispatch, locale, router, path]);

  // Fetch team members when in a team
  useEffect(() => {
    if (currentTeam && allTeamMembers.length === 0) {
      dispatch(fetchAllTeamMembers() as any);
    }
  }, [currentTeam, allTeamMembers.length, dispatch]);

  return {
    isLogin,
    enterprise,
    username,
    email,
    uuid,
    availableCredit,
    balanceStatus,
    logoutFn,
  };
};
