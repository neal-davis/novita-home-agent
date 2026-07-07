"use client";
import { Dayjs } from "dayjs";
import DetailContent from "./components/DetailContent";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import { useEffect, useState } from "react";
export interface IFilterOptions {
  cycleType: string;
  startTime: Dayjs | undefined;
  endTime: Dayjs | undefined;
  productCategory:
    | "summary"
    | "llm"
    | "gen_api"
    | "gpu"
    | "serverless"
    | "cloud_storage"
    | "image"
    | "llm_dedicated_endpoint"
    | "cloud_sandbox"
    | "token_saving_plan";
  currentPage: number;
  productName?: string;
  category?: string;
  ownerId?: string;
}
type BillDetailsDictProps = {
  copy?: unknown;
};
export default function Content({ copy }: BillDetailsDictProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <div>
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.billing}
        resource={PERMISSION.RESOURCE.details}
        action={PERMISSION.ACTION.read}
      >
        {isClient && <DetailContent copy={copy} />}
      </PermissionWrapper>
    </div>
  );
}
