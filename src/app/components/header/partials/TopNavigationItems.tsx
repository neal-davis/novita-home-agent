"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { NavMenuItem } from "@/types/header";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import styles from "../Header.module.scss";

interface TopNavigationItemsProps {
  items: NavMenuItem[];
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

export const TopNavigationItems = ({ items }: TopNavigationItemsProps) => {
  const path = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const businessPath = getPathnameWithoutLocale(path);
  const fromParam = searchParams.get("from");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownToggle = useCallback((key: string) => {
    setDropdownOpen((prev) => (prev === key ? null : key));
  }, []);

  const handleDropdownClose = useCallback(() => {
    setDropdownOpen(null);
  }, []);

  const handleMouseEnter = useCallback((key: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setDropdownOpen(key);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(null);
      closeTimeoutRef.current = null;
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      // Only handle click outside for non-GPUs dropdown menus
      if (dropdownOpen && dropdownOpen !== "gpus") {
        setDropdownOpen(null);
      }
    };

    if (dropdownOpen && dropdownOpen !== "gpus") {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [dropdownOpen]);

  const renderNavItem = (item: NavMenuItem) => {
    if (item.dropdown && item.dropdown.length > 0) {
      const isHoverDropdown = item.key === "gpus";

      return (
        <div
          key={item.key}
          className="relative"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={
            isHoverDropdown ? () => handleMouseEnter(item.key) : undefined
          }
          onMouseLeave={isHoverDropdown ? handleMouseLeave : undefined}
        >
          <button
            className={cn(
              styles.link_text,
              "mx-[10px] p-[8px] flex items-center gap-1",
              {
                [styles.active]: item.dropdown.some((subItem) =>
                  isNavItemActive(
                    subItem.path,
                    subItem.key,
                    businessPath,
                    fromParam,
                  ),
                ),
              },
            )}
            id={item.elmId}
            onClick={
              !isHoverDropdown
                ? () => handleDropdownToggle(item.key)
                : undefined
            }
          >
            {item.id === "sandbox" ? (
              <div className="flex items-center gap-[4px]">
                <span>{item.title}</span>
                <img
                  src="/sandbox/console/new.png"
                  alt="new"
                  className="w-[24px] h-[9px]"
                />
              </div>
            ) : (
              item.title
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                dropdownOpen === item.key && "rotate-180",
              )}
            />
          </button>

          {dropdownOpen === item.key && (
            <div
              className={cn(
                styles.header_dropdown,
                "absolute top-full left-0 mt-1 min-w-[160px] py-2 px-1",
                "border border-gray-200 rounded-lg shadow-lg",
              )}
              onMouseEnter={
                isHoverDropdown ? () => handleMouseEnter(item.key) : undefined
              }
              onMouseLeave={isHoverDropdown ? handleMouseLeave : undefined}
            >
              {item.dropdown.map((subItem) => (
                <Link
                  key={subItem.key}
                  href={getLocalizedPath(subItem.path ?? "", locale)}
                  id={subItem.elmId}
                  target={subItem.linkTarget}
                  className={cn(
                    styles.dropdown_item,
                    isNavItemActive(
                      subItem.path,
                      subItem.key,
                      businessPath,
                      fromParam,
                    ) && "bg-gray-100",
                  )}
                  onClick={!isHoverDropdown ? handleDropdownClose : undefined}
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.key}
        className={cn(
          styles.link_text,
          "mx-[10px] p-[8px]",
          item.key === "console" &&
            "p-[6px] h-8 font-subtle text-[var(--dark-1)] underline underline-offset-4 hover:bg-[var(--gray-3)",
          isNavItemActive(item.path, item.key, businessPath, fromParam) &&
            styles.active,
        )}
        id={item.elmId}
        href={getLocalizedPath(item.path ?? "", locale)}
        target={item.linkTarget}
      >
        {item.id === "sandbox" ? (
          <div className="flex items-center gap-[4px]">
            <span>{item.title}</span>
            <img
              src="/sandbox/console/new.png"
              alt="new"
              className="w-[24px] h-[9px]"
            />
          </div>
        ) : (
          item.title
        )}
      </Link>
    );
  };

  return <>{items.map(renderNavItem)}</>;
};
