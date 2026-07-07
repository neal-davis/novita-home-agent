"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import { NOVITA_URL } from "@/constants/urls";
import { isCodingPlanCampaignActive } from "@/lib/utils/codingPlanCampaign";
import CodingPlanClient from "./components/CodingPlanClient";

export default function CodingPlanPage() {
  const router = useRouter();
  const isActive = isCodingPlanCampaignActive();

  useEffect(() => {
    if (!isActive) {
      router.replace(NOVITA_URL.CONSOLE);
    }
  }, [isActive, router]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="min-h-full">
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.billing}
        resource={PERMISSION.RESOURCE.details}
        action={PERMISSION.ACTION.read}
      >
        <CodingPlanClient />
      </PermissionWrapper>
    </div>
  );
}
