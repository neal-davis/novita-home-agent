"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Sparkle, ChevronLeft, ChevronRight } from "lucide-react";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import styles from "./ConsoleBanner.module.scss";

const ROTATE_INTERVAL_MS = 3000;

export const ConsoleBanner = () => {
  const campaignConfig = useSelector(
    (state: any) => state.config.campaignConfig,
  );
  const pathname = usePathname();
  const businessPathname = getPathnameWithoutLocale(pathname);
  const { locale } = useI18n();

  const items = useMemo(() => {
    const allItems = campaignConfig?.consoleCampaignBanner || [];
    if (!Array.isArray(allItems)) return [];

    // Filter out items where buttonHref matches current pathname
    return allItems.filter((item: any) => {
      if (!item?.buttonHref) return true;
      const href = item.buttonHref;
      // Handle both absolute URLs and relative paths
      if (href.startsWith("http")) {
        try {
          const url = new URL(href);
          return url.pathname !== businessPathname;
        } catch {
          return true;
        }
      }
      return href !== businessPathname;
    });
  }, [businessPathname, campaignConfig?.consoleCampaignBanner]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const total = items.length;
  const isCarousel = total > 1;
  const consoleBanner = items[currentIndex];

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % total);
  }, [total]);

  // Reset 3s timer whenever index changes (manual switch or auto)
  useEffect(() => {
    if (!isCarousel) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % total);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isCarousel, total, currentIndex]);

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Link
        className={`${styles.banner_link} ${isCarousel ? styles.banner_link_with_pagination : ""}`}
        href={getLocalizedPath(consoleBanner?.buttonHref ?? "", locale)}
        target="_blank"
      >
        <div className={styles.content_wrapper}>
          {/* NEW Badge with Sparkle Icon */}
          <div className={styles.badge}>
            <Sparkle className={styles.badge_icon} size={14} />
            <span className={styles.badge_text}>
              {consoleBanner?.badgeText ?? ""}
            </span>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Title with Gradient Effect */}
          <div className={styles.title_wrapper}>
            <span className={styles.title}>
              {consoleBanner?.headingPart1 ?? ""}
            </span>
            <span className={styles.title_gradient}>
              {consoleBanner?.headingPart2 ?? ""}
            </span>
          </div>

          {/* Description */}
          <p className={styles.description}>
            {consoleBanner?.description ?? ""}
          </p>
        </div>

        {/* View Details Link */}
        <div className={styles.link_wrapper}>
          <span className={styles.link_text}>
            {consoleBanner?.buttonText ?? ""} →
          </span>
        </div>

        {/* Cursor Click Icon */}
        <div className={styles.cursor_icon}>
          <Image
            src="/console/cursor.png"
            alt="cursor"
            width={32}
            height={32}
          />
        </div>

        {/* Pagination: < 1 / 2 > — only when multiple banners */}
        {isCarousel && (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.paginationBtn}
              onClick={(e) => {
                e.preventDefault();
                goPrev();
              }}
              aria-label="Previous banner"
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.paginationText} aria-live="polite">
              {currentIndex + 1} / {total}
            </span>
            <button
              type="button"
              className={styles.paginationBtn}
              onClick={(e) => {
                e.preventDefault();
                goNext();
              }}
              aria-label="Next banner"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Link>
    </div>
  );
};
