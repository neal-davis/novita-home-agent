"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isCodingPlanCampaignActive } from "@/lib/utils/codingPlanCampaign";

export default function CodingPlanGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isActive = isCodingPlanCampaignActive();

  useEffect(() => {
    if (!isActive) {
      router.replace("/");
    }
  }, [isActive, router]);

  if (!isActive) {
    return null;
  }

  return <>{children}</>;
}
