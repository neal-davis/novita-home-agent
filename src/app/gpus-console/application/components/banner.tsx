"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import styles from "./banner.module.scss";
import { X } from "lucide-react";
import type { GpuBannerSlide } from "./gpuBannerMap";

const AUTO_INTERVAL_MS = 3000;

function BannerItem({
  icon,
  title,
  desc,
  highlight,
  buttonText,
  href,
  closeBanner,
}: {
  icon: string;
  title: string;
  desc: string;
  highlight: string;
  buttonText: string;
  href: string;
  closeBanner: () => void;
}) {
  return (
    <div
      className="w-full px-6 py-4 flex flex-row items-center justify-between"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="flex flex-row items-center gap-4">
        {icon ? (
          <img src={icon} alt="" className="w-10 h-10" />
        ) : (
          <div className="w-10 h-10 shrink-0" aria-hidden />
        )}
        <div className="flex flex-col gap-1">
          <h1 className="font-body-medium text-[var(--white)]">{title}</h1>
          <div className="flex flex-row items-center gap-[6px]">
            <p className="font-small-console text-[var(--white)]">{desc}</p>
            <p className="font-small-console text-[var(--brand-0)]">
              {highlight}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <Button
          variant="default"
          className="h-8 px-6 py-2 !bg-[var(--brand-0)]"
          onClick={() => {
            window.open(href, "_blank");
          }}
        >
          {buttonText}
        </Button>
        <X
          className="w-5 h-5 text-[var(--white)] cursor-pointer shrink-0"
          onClick={() => {
            closeBanner();
          }}
          aria-label="Close banner"
        />
      </div>
    </div>
  );
}

export default function Banner({
  items,
  closeBanner,
}: {
  items: GpuBannerSlide[];
  closeBanner: () => void;
}) {
  const count = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const currentIndex = count > 0 ? activeIndex % count : 0;

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, AUTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) {
    return null;
  }

  return (
    <div className="relative w-full rounded-[12px] overflow-hidden">
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{
            width: `${count * 100}%`,
            transform: `translateX(-${(currentIndex * 100) / count}%)`,
          }}
        >
          {items.map((banner, index) => (
            <div
              key={`banner-slide-${index}`}
              className={styles.slide}
              style={{
                width: `${100 / count}%`,
                background: banner.bgColor,
              }}
            >
              <BannerItem {...banner} closeBanner={closeBanner} />
            </div>
          ))}
        </div>
      </div>
      {count > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Banner slides">
          {items.map((_, index) => (
            <Button
              key={`banner-dot-${index}`}
              type="button"
              variant="noborderghost"
              size="icon"
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Banner ${index + 1} of ${count}`}
              className={`min-w-0 ${styles.dot} ${index === currentIndex ? styles.dotActive : ""}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
