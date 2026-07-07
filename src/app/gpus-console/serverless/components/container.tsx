"use client";

import { useEffect, useState } from "react";
import Section from "./Section";
import { getEndpoints } from "@/api/gpu-instance/serverless";
import DefaultGuide from "./defaultGuide";
import { useAppSelector } from "@/store";
import LoadingComponent from "@/components/ui/standard/empty-page-loading";

export default function Container() {
  const userInfo = useAppSelector((state: any) => state.user);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userInfo.uuid) {
      setEndpoints([]);
    } else {
      setLoading(true);
      getEndpoints({
        filter: {
          pageSize: 10,
          pageNum: 1,
          creators: "",
        },
      })
        .then((res: any) => {
          setEndpoints(res || []);
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
      ) : endpoints.length > 0 ? (
        <Section initData={endpoints} />
      ) : (
        <DefaultGuide />
      )}
    </>
  );
}
