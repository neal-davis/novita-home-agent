import { Metadata } from "next";
import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";
import FirstPage from "@/app/pricing/components/FirstPage";
import DetailContent from "@/app/pricing/components/DetailContent";
import { CANONICAL_URL } from "@/constants/canonical";
import { VisitReport } from "@/app/pricing/components/visitReport";
import styles from "./page.module.scss";
import { getFullLLMModels } from "@/api/model";
import { cookies } from "next/headers";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pricing - Console | Novita AI",
    description:
      "Discover clear, flexible pricing for 200+ AI Model APIs and GPU services. Compare plans for GPUs, APIs, and dedicated endpoints to fit your AI needs.",
    alternates: getLocalizedMetadataAlternates(CANONICAL_URL.PRICING),
  };
}

export default async function ConsolePricingPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const fullLLMModels = await getFullLLMModels(undefined, token);

  return (
    <ConsoleHeaderWrapper
      product="main"
      mainClassName={styles.pricing_console_main}
    >
      <div className="w-full">
        <DetailContent initialFullLLMModels={fullLLMModels} isConsole={true} />
        <VisitReport />
      </div>
    </ConsoleHeaderWrapper>
  );
}
