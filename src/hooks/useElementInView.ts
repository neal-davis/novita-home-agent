"use client";
import { useEffect, useState } from "react";

export function useElementInView(el: HTMLElement | null) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      setInView(entries.some((entry) => entry.isIntersecting));
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [el]);

  return inView;
}
