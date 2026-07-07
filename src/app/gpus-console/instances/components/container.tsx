"use client";

import Section from "./section";
import { useEffect, useState } from "react";
import { reqGpuInstance } from "@/api/gpu-instance/instances";
import DefaultGuide from "./defaultGuide";
import { useAppSelector } from "@/store";
import LoadingComponent from "@/components/ui/standard/empty-page-loading";

export default function Container() {
  const userInfo = useAppSelector((state: any) => state.user);
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo.uuid) {
      setTemplateList([]);
      return;
    } else {
      const savedPageSize = Number(
        localStorage.getItem("instance_pageSize") || 10,
      );
      const validPageSize = [10, 25, 50, 100].includes(savedPageSize)
        ? savedPageSize
        : 10;
      setLoading(true);
      reqGpuInstance({
        page: 1,
        pageSize: validPageSize,
        name: "",
        productName: "",
        status: "",
        isUseSavingPlan: 0,
        creators: "",
        clusters: "",
        billingMode: "",
      })
        .then((res: any) => {
          setTemplateList(res.instances || []);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userInfo.uuid]);
  return (
    <>
      {loading ? (
        <LoadingComponent />
      ) : templateList.length > 0 ? (
        <Section />
      ) : (
        <DefaultGuide />
      )}
    </>
  );
  // <Section />
}
