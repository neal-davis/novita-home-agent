"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Button from "@/app/components/button/Button";
import { NOVITA_URL } from "@/constants/urls";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { useI18nSubscription } from "@/i18n/provider";

export default function WhyNovitaGetStartedButton() {
  useI18nSubscription();

  const router = useRouter();
  const { isLogin } = useHeaderAuth();

  const handleGetStarted = useCallback(() => {
    if (isLogin) {
      router.push(NOVITA_URL.CONSOLE);
      return;
    }

    localStorage.setItem("redirect", NOVITA_URL.CONSOLE);
    router.push(
      `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(NOVITA_URL.CONSOLE)}`,
    );
  }, [isLogin, router]);

  return (
    <Button
      type="secondary"
      height={44}
      onClick={handleGetStarted}
      className="gap-2 font-paragraph-15 w-fit"
    >
      Get Started
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}
