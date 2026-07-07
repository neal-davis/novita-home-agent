"use client";

import { ArrowUp as ArrowUpOutlined } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatBtn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 240);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      className="fixed bottom-10 left-1/2 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-1)] bg-[var(--fill-0)] text-[var(--text-1)] shadow-md transition hover:bg-[var(--fill-1)]"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUpOutlined className="h-5 w-5" />
    </button>
  );
}
