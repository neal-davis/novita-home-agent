"use client";

import { RefObject, useEffect, useRef, useState } from "react";

interface UseElementActivityOptions extends IntersectionObserverInit {
  initialActive?: boolean;
}

export function usePageVisible() {
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => {
      setIsPageVisible(document.visibilityState !== "hidden");
    };

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return isPageVisible;
}

export function useElementActivity<T extends HTMLElement>({
  initialActive = false,
  root = null,
  rootMargin = "0px",
  threshold = 0,
}: UseElementActivityOptions = {}): {
  ref: RefObject<T>;
  isActive: boolean;
} {
  const ref = useRef<T>(null);
  const isPageVisible = usePageVisible();
  const [isInView, setIsInView] = useState(initialActive);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setIsInView(entries.some((entry) => entry.isIntersecting));
      },
      { root, rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold]);

  return { ref, isActive: isInView && isPageVisible };
}
