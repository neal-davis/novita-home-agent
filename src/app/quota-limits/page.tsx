"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function QuotaLimitsPage() {
  const router = useRouter();
  const { locale } = useI18n();

  useEffect(() => {
    router.replace(getLocalizedPath(NOVITA_URL.QUOTA_LIMITS_LLM, locale));
  }, [locale, router]);

  return null;
}
