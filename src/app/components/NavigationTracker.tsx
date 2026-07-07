"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushToStack } from "@/lib/navigationStack";

export default function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const search = searchParams?.toString();
    const fullPath = search ? `${pathname}?${search}` : pathname;

    pushToStack(fullPath);
  }, [pathname, searchParams]);

  return null;
}
