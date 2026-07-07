"use client";

import { useEffect } from "react";

const FOOTER_OVERSCROLL_CLASS = "footer-overscroll-bg";

export default function FooterOverscrollBackground() {
  useEffect(() => {
    document.body.classList.add(FOOTER_OVERSCROLL_CLASS);

    return () => {
      document.body.classList.remove(FOOTER_OVERSCROLL_CLASS);
    };
  }, []);

  return null;
}
