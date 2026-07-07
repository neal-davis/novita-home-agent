"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { LayoutSafeRail } from "@/app/components/layout/LayoutSafeRail";
import Button from "@/app/components/button/Button";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useCampaignCarousel } from "./useCampaignCarousel";
import styles from "./HomeCampaignBanner.module.scss";

const ROTATE_INTERVAL_MS = 3000;

export const HomeCampaignBanner = () => {
  const campaignConfig = useSelector(
    (state: any) => state.config.campaignConfig,
  );
  const { locale } = useI18n();
  const items = campaignConfig?.homeCampaignBanner || [];
  const bannerItems = Array.isArray(items) ? items : [];

  const { currentIndex, currentItem, isCarousel, goPrev, goNext, total } =
    useCampaignCarousel({
      items: bannerItems,
      intervalMs: ROTATE_INTERVAL_MS,
    });

  if (bannerItems.length === 0) {
    return null;
  }

  const href = currentItem?.buttonHref ?? "";
  const localizedHref = getLocalizedPath(href, locale);
  const isExternalHref = /^https?:\/\//.test(href);
  const fullHeading = [
    currentItem?.headingPart1 ?? "",
    currentItem?.headingPart2 ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={styles.sectionShell}>
      <LayoutSafeRail className={styles.wrapper}>
        <div className={styles.banner}>
          <Image
            src="/home/config/home-pageinfo.png"
            alt=""
            fill
            priority
            aria-hidden="true"
            sizes="(max-width: 768px) calc(100vw - 36px), (max-width: 1024px) calc(100vw - 48px), 1360px"
            className={styles.backgroundImage}
          />

          <div
            className={`${styles.content} ${
              isCarousel ? styles.contentWithPagination : ""
            }`}
          >
            <div className={styles.textContent}>
              <div className={styles.badge}>
                <Zap className={styles.badgeIcon} size={13} />
                <span className={styles.badgeText}>
                  {currentItem?.badgeText ?? ""}
                </span>
              </div>

              <h2 className={styles.heading} title={fullHeading}>
                <span className={styles.headingPart1}>
                  {currentItem?.headingPart1 ?? ""}
                </span>
                <span
                  className={styles.headingPart2}
                  title={currentItem?.headingPart2 ?? ""}
                >
                  {currentItem?.headingPart2 ?? ""}
                </span>
              </h2>

              <p className={styles.description}>
                {currentItem?.description ?? ""}
              </p>
            </div>

            <Button
              renderTag="link"
              link={localizedHref}
              type="primary"
              height={44}
              className={styles.button}
              elAttrs={{
                ...(isExternalHref
                  ? {
                      target: "_blank",
                      rel: "noreferrer",
                    }
                  : {}),
              }}
            >
              <span className={styles.buttonText}>
                {currentItem?.buttonText ?? ""}
              </span>
              <ChevronRight className={styles.buttonIcon} aria-hidden="true" />
            </Button>
          </div>

          {isCarousel && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.paginationBtn}
                onClick={goPrev}
                aria-label="Previous banner"
              >
                <ChevronLeft
                  className={styles.paginationIcon}
                  aria-hidden="true"
                />
              </button>
              <span className={styles.paginationText} aria-live="polite">
                {currentIndex + 1} / {total}
              </span>
              <button
                type="button"
                className={styles.paginationBtn}
                onClick={goNext}
                aria-label="Next banner"
              >
                <ChevronRight
                  className={styles.paginationIcon}
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </div>
      </LayoutSafeRail>
    </section>
  );
};
