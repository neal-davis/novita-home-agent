"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import styles from "../Header.module.scss";
import { NavMenuItem } from "@/types/header";
import { CLICK_BTN_IDs } from "../../analytics/constants";
import UserInfoBox from "./UserInfoBox";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

const { HEADER_LINK_IDs } = CLICK_BTN_IDs;

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  navMenuItems: NavMenuItem[];
  isLogin: boolean;
  enterprise: boolean;
  uuid: string;
  email: string;
  username: string;
  balance: string | number;
  page?: "playground" | "console";
  logout: () => void;
  noticeHeight: number;
  originalHeaderHeight: number;
}

const isNavItemActive = (
  itemUrl: string | undefined,
  itemKey: string | undefined,
  currentPath: string,
  fromParam: string | null,
) => {
  // If it's a model detail page, determine highlight based on from parameter
  if (currentPath.startsWith("/models/model-detail/")) {
    if (fromParam === "pricing") {
      // Only Pricing navigation item should be highlighted
      return itemKey === "pricing";
    } else if (fromParam === "home") {
      // When from=home, don't highlight any navigation item
      return false;
    }
    // If there's no from parameter (entered from model library), use original logic, will highlight Model APIs
  }

  // Other cases use original logic
  return (
    (itemUrl && currentPath.startsWith(itemUrl)) ||
    (itemUrl === "/models-console" &&
      (currentPath.startsWith("/playground") || currentPath.startsWith("/llm")))
  );
};

export const MobileNavigation = ({
  isOpen,
  onClose,
  navMenuItems,
  isLogin,
  enterprise,
  uuid,
  email,
  username,
  balance,
  page,
  logout,
  noticeHeight,
  originalHeaderHeight,
}: MobileNavigationProps) => {
  const path = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const businessPath = getPathnameWithoutLocale(path);
  const fromParam = searchParams.get("from");

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.mobile_nav}`}
      style={{
        display: "flex",
        top: `${originalHeaderHeight + noticeHeight}px`,
      }}
      onClick={onClose}
    >
      <div className="w-full h-full max_width_container">
        <div className="px-web w-full h-full flex flex-col items-stretch">
          <div
            className="flex flex-col gap-6"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {isLogin ? (
              <UserInfoBox
                enterprise={enterprise}
                uuid={uuid}
                email={email}
                username={username}
                page={page}
                balance={balance}
                logout={logout}
                isMobile={true}
              />
            ) : (
              <>
                <Button
                  type="submit"
                  size="lg"
                  id={HEADER_LINK_IDs.GET_STARTED}
                  onClick={() => {
                    const hash =
                      typeof window !== "undefined" ? window.location.hash : "";
                    const redirect = hash ? `${path}${hash}` : path;
                    window.location.href = getLocalizedPath(
                      `/user/login?redirect=${encodeURIComponent(redirect)}`,
                      locale,
                    );
                    localStorage.setItem("redirect", redirect);
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant={"outline"}
                  id={HEADER_LINK_IDs.LOGIN}
                  size="sl"
                  onClick={() => {
                    const hash =
                      typeof window !== "undefined" ? window.location.hash : "";
                    const redirect = hash ? `${path}${hash}` : path;
                    window.location.href = getLocalizedPath(
                      `/user/login?redirect=${encodeURIComponent(redirect)}`,
                      locale,
                    );
                    localStorage.setItem("redirect", redirect);
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </div>
          <div
            className={styles.mobile_language_switcher}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <LanguageSwitcher mode="mobile" />
          </div>
          <div
            className={styles.mobile_nav_container}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {navMenuItems.map((item) => {
              if (item.dropdown && item.dropdown.length > 0) {
                return (
                  <div key={item.key} className="flex flex-col">
                    {item.dropdown.map((subItem) => {
                      return (
                        <Link
                          key={subItem.key}
                          className={`${styles.link_btn} ${
                            isNavItemActive(
                              subItem.path,
                              subItem.key,
                              businessPath,
                              fromParam,
                            )
                              ? styles.active
                              : ""
                          }`}
                          id={subItem.elmId}
                          href={getLocalizedPath(subItem.path ?? "", locale)}
                          target={subItem.linkTarget}
                        >
                          {subItem.title}
                        </Link>
                      );
                    })}
                  </div>
                );
              } else {
                return (
                  <Link
                    key={item.key}
                    className={`${styles.link_btn} ${
                      isNavItemActive(
                        item.path,
                        item.key,
                        businessPath,
                        fromParam,
                      )
                        ? styles.active
                        : ""
                    }`}
                    id={item.elmId}
                    href={getLocalizedPath(item.path ?? "", locale)}
                    target={item.linkTarget}
                  >
                    {item.title}
                  </Link>
                );
              }
            })}
          </div>
          {isLogin && (
            <Button
              variant={"outline"}
              id={HEADER_LINK_IDs.USERBOX_LOGOUT}
              className="font-body mt-auto"
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
            >
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
