"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Header.module.scss";
import UserInfoBox from "./partials/UserInfoBox";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./partials/Logo";
import TeamSwitcher from "./partials/TeamSwitcher";
import BalanceBox from "./partials/BalanceBox";
import { useOauthEvent } from "@/hooks/useOauthEvent";
import MessageCenter from "./partials/MessageCenter";
import { useIsInConsole } from "@/hooks/useIsInConsole";
import Notice from "../Notice/Notice";
import VoucherNotification from "../voucherNotification";
import DiscountToast from "../discountToast/discountToast";
import InfoDialog from "@/components/ui/standard/info-dialog";
import MenuIcon from "@/lib/icons/Menu";
import { NOVITA_URL } from "@/constants/urls";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { useHeaderHeight } from "@/hooks/useHeaderHeight";
import { useTopNavigationItems } from "@/hooks/useTopNavigationItems";
import { TopNavigationItems } from "./partials/TopNavigationItems";
import { MobileNavigation } from "./partials/MobileNavigation";
import { AuthButtons } from "./partials/AuthButtons";
import { LanguageSwitcher } from "./partials/LanguageSwitcher";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function Header({
  size = "default",
  position,
  page,
  consolePageTitle,
  noMobile,
  hideNotice,
  hideNavigation,
}: {
  page?: "playground" | "console";
  consolePageTitle?: string;
  size?: "full" | "wide" | "default"; // when set wide, it will be 1280px wide.
  position?: "relative"; // fixed or relative
  noMobile?: boolean; // when set noMobile, it will not show mobile menu
  hideNotice?: boolean;
  hideNavigation?: boolean; // when set hideNavigation, it will not show navigation menu items
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const isInConsole = useIsInConsole();

  // Custom hooks
  const {
    isLogin,
    enterprise,
    username,
    email,
    uuid,
    availableCredit,
    balanceStatus,
    logoutFn,
  } = useHeaderAuth();

  const { headerHeight, noticeHeight, originalHeaderHeight, isNoticeShowing } =
    useHeaderHeight(page, position, hideNotice);

  const navMenuItems = useTopNavigationItems(page);

  // Filter navigation items when hideNavigation is true
  const filteredNavMenuItems = hideNavigation
    ? isLogin
      ? navMenuItems.filter((item) => item.key === "console")
      : []
    : navMenuItems;

  // Local state
  const [openMenu, setOpenMenu] = useState(false);

  // Handlers
  const doOpenMenu = useCallback(() => {
    setOpenMenu(true);
  }, []);

  const doCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);

  const handleLogin = useCallback(
    (redirect: string) => {
      const queryString = searchParams.toString();
      const fullPath = queryString ? `${redirect}?${queryString}` : redirect;
      const encodedRedirect = encodeURIComponent(fullPath);
      router.push(
        getLocalizedPath(
          `${NOVITA_URL.USER_LOGIN}?redirect=${encodedRedirect}`,
          locale,
        ),
      );
      localStorage.setItem("redirect", redirect);
    },
    [locale, router, searchParams],
  );

  const handleGetStarted = useCallback(
    (redirect: string) => {
      router.push(
        getLocalizedPath(
          `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(redirect)}`,
          locale,
        ),
      );
      localStorage.setItem("redirect", redirect);
    },
    [locale, router],
  );

  // OAuth event tracking
  useOauthEvent();

  return (
    <div style={{ height: headerHeight }}>
      {isNoticeShowing && <Notice position={position} page={page} />}
      <header
        className={cn(styles.header, {
          [styles.header_console]: page === "console",
          [styles.header_login]: uuid,
          [styles.no_mobile]: noMobile,
        })}
        style={{
          top: !position && isNoticeShowing ? `${noticeHeight}px` : "0px",
          position: position || "fixed",
        }}
      >
        <nav
          className={`${styles.nav} ${
            size === "full" ? "px-4" : "max_width_container"
          }`}
        >
          <div
            className={`${styles.nav_wrapper} ${
              size === "default" ? "px-web" : ""
            } `}
          >
            <div className={styles.nav_left}>
              {consolePageTitle ? (
                <span className={styles.page_title}>{consolePageTitle}</span>
              ) : (
                <Logo />
              )}
            </div>

            {/* Desktop menu */}
            <div className={styles.btn_list}>
              <div className={styles.btn_list_left}>
                {page !== "console" && (
                  <TopNavigationItems items={filteredNavMenuItems} />
                )}
              </div>
              <div className={styles.btn_list_right}>
                {isLogin && isInConsole && (
                  <BalanceBox
                    balance={availableCredit}
                    balanceStatus={balanceStatus}
                  />
                )}
                {page === "console" && isLogin && (
                  <div className={styles.team_switcher_wrapper}>
                    <TeamSwitcher />
                  </div>
                )}
                <LanguageSwitcher />
                {isLogin && isInConsole && <MessageCenter />}
                {isLogin ? (
                  <UserInfoBox
                    enterprise={enterprise}
                    uuid={uuid}
                    email={email}
                    username={username}
                    balance={availableCredit}
                    page={page}
                    logout={logoutFn}
                  />
                ) : (
                  <AuthButtons
                    onLogin={handleLogin}
                    onGetStarted={handleGetStarted}
                  />
                )}
              </div>
            </div>

            {/* Mobile menu */}
            <div className={styles.btn_expand}>
              {isLogin && isInConsole && <MessageCenter />}
              <button
                className={`${styles.menu_btn} ${
                  openMenu ? styles.active : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (openMenu) {
                    doCloseMenu();
                  } else {
                    doOpenMenu();
                  }
                }}
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </nav>

        {page !== "playground" && !noMobile && (
          <MobileNavigation
            isOpen={openMenu}
            onClose={doCloseMenu}
            navMenuItems={filteredNavMenuItems}
            isLogin={isLogin}
            enterprise={enterprise}
            uuid={uuid}
            email={email}
            username={username}
            balance={availableCredit}
            page={page}
            logout={logoutFn}
            noticeHeight={noticeHeight}
            originalHeaderHeight={originalHeaderHeight}
          />
        )}
      </header>
      <VoucherNotification />
      <DiscountToast />
      <InfoDialog />
    </div>
  );
}
