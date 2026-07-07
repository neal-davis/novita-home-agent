"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LLMModel } from "@/types/models";
import { NOVITA_URL } from "@/constants/urls";
import { getLLMOnDemandModels } from "@/api/model";
import { Skeleton } from "@/components/ui/skeleton";
import OnDemandModelCard from "./OnDemandModelCard";
import { transformModelIdToPath } from "@/lib/utils";
import styles from "./OnDemandModelList.module.scss";

export default function OnDemandModelList() {
  const router = useRouter();
  const [models, setModels] = useState<LLMModel[]>([]);

  useEffect(() => {
    getLLMOnDemandModels().then((res) => {
      setModels(res ?? []);
    });
  }, []);

  return (
    <div className={styles.on_demand_models}>
      <div className={styles.title_wrapper}>
        <p className={styles.title}>Explore On-Demand Models</p>
        <div className={styles.extra}>
          <Link
            href={NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY}
            className="flex flex-row justify-between items-center"
          >
            <span>Model Library</span>
            <span className="iconfont icon-right-arrow ml-2"></span>
          </Link>
        </div>
      </div>

      {models.length === 0 && (
        <div
          className={`${styles.models} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2`}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-[100px] rounded-sm animate-pulse"
            />
          ))}
        </div>
      )}

      <div
        className={`${styles.models} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2`}
      >
        {models.map((model) => (
          <OnDemandModelCard
            key={model.id}
            modelName={model.id}
            displayModelName={model.displayName}
            onClick={() => {
              router.push(
                `${
                  NOVITA_URL.MODEL_API_CONSOLE_MODEL_DETAIL
                }/${transformModelIdToPath(model.id)}`,
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}
