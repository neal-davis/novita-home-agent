"use client";

import { useEffect, useState } from "react";
import { useIsInConsole } from "@/hooks/useIsInConsole";

const themesMap = {
  website: "website_app",
  console: "console_app",
};

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const isInConsole = useIsInConsole();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const theme = isInConsole ? themesMap.console : themesMap.website;
    const html = document.documentElement;
    html.classList.remove(themesMap.website, themesMap.console);

    if (theme) {
      html.classList.add(theme);
    }

    localStorage.setItem("novita-theme", theme);
  }, [isInConsole, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
