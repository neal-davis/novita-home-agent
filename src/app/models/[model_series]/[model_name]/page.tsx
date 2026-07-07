import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getEnabledFusionProductConfigsForServer } from "@/api/fusion-product";
import Header from "@/app/components/header/Header";
import MultimodalModelPlayground from "./components/MultimodalModelPlayground";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

interface PageProps {
  params: {
    model_series: string;
    model_name: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

/**
 * Generate metadata for the multimodal model page
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { model_series, model_name } = params;

  const configs = await getEnabledFusionProductConfigsForServer(model_name);
  const modelConfig = configs[0];

  const displayName = modelConfig?.fusionConfig?.displayName || model_name;
  const description = modelConfig?.fusionConfig?.description || "";
  const title = `${displayName} | Novita AI`;

  return {
    title,
    description,
    alternates: getLocalizedMetadataAlternates(
      `https://novita.ai/models/${model_series}/${model_name}`,
    ),
    openGraph: {
      title,
      description,
      siteName: "Novita AI",
      images: [
        {
          url: "https://novita.ai/models/models-social-thumbnail.png",
          alt: `${displayName} - Novita AI`,
        },
      ],
    },
    twitter: {
      title,
      description,
      site: "Novita AI",
      images: [
        {
          url: "https://novita.ai/models/models-social-thumbnail.png",
          alt: `${displayName} - Novita AI`,
        },
      ],
    },
  };
}

export default async function MultimodalModelPage({ params }: PageProps) {
  const { model_series, model_name } = params;

  const configs = await getEnabledFusionProductConfigsForServer(model_name);
  const modelConfig = configs[0];

  if (!modelConfig || !modelConfig.fusionConfig?.series) {
    redirect("/");
  }

  if (
    modelConfig.fusionConfig.series.toLowerCase() !== model_series.toLowerCase()
  ) {
    redirect("/");
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Header size="wide" />
      <MultimodalModelPlayground modelConfig={modelConfig} />
    </div>
  );
}
