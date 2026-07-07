"use client";

import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { isCodingPlanCampaignActive } from "@/lib/utils/codingPlanCampaign";

export default function ArenaDemo() {
  const isActive = isCodingPlanCampaignActive();

  if (!isActive) {
    return null;
  }

  return (
    <Link
      href={NOVITA_URL.ARENA_SITE}
      className="font-subtle py-[8px] hover:underline"
      target="_blank"
    >
      Arena Demo
    </Link>
  );
}
