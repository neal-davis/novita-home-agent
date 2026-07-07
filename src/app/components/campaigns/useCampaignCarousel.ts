import { useCallback, useEffect, useMemo, useState } from "react";

type CarouselItem = unknown;

type UseCampaignCarouselOptions<T extends CarouselItem> = {
  items: T[];
  intervalMs: number;
};

export function useCampaignCarousel<T>({
  items,
  intervalMs,
}: UseCampaignCarouselOptions<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = items.length;
  const isCarousel = total > 1;

  useEffect(() => {
    if (currentIndex < total) return;
    setCurrentIndex(0);
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((index) => (index - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((index) => (index + 1) % total);
  }, [total]);

  useEffect(() => {
    if (!isCarousel) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % total);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [currentIndex, intervalMs, isCarousel, total]);

  const currentItem = useMemo(() => items[currentIndex], [items, currentIndex]);

  return {
    currentIndex,
    currentItem,
    isCarousel,
    total,
    goPrev,
    goNext,
  };
}
