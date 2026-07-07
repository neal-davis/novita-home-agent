"use client";

import styles from "../page.module.scss";
import { LLMModelWithStatus } from "@/types/models";
import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import Link from "next/link";
import LLMModelCard from "@/app/components/ModelLibrary/LLMModelCard";

export default function FeaturedModels({
  modelList,
}: {
  modelList: LLMModelWithStatus[];
}) {
  return (
    <main className={styles.main}>
      <div className="max_width_container">
        <div className="mx-web">
          <h1 className={`${styles.title}`}>Large Language Models</h1>
          <p className="my-6 text-xl text-common-dark-2">
            Browse our supported open source models and deploy in dedicated
            endpoints
          </p>
          <div>
            <Button asChild>
              <Link href={NOVITA_URL.MODEL_API_CONSOLE_LLM_DE}>
                Create a New Endpoint
              </Link>
            </Button>
          </div>
        </div>
        <div
          className={`grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-web mt-[56px]`}
        >
          {modelList.map((model: LLMModelWithStatus) => {
            return <LLMModelCard key={model.id} data={model} />;
          })}
        </div>
      </div>
    </main>
  );
}
