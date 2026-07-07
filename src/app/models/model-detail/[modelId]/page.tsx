import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cookies } from "next/headers";
import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import ModelDetailPage from "@/app/components/ModelDetail/ModelDetailPage";
import { getModelReadmeContent } from "@/api/dedicated-endpoint";
import { getModelDetailData } from "../utils/model-detail-utils";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

interface PageProps {
  params: {
    modelId: string;
  };
  searchParams: {
    from?: string;
  };
}

const PRODUCT_NAME = "Novita AI";

export async function generateMetadata(props: {
  params: { modelId: string };
}): Promise<Metadata> {
  const { modelId } = props.params;

  if (!modelId || modelId.trim() === "") {
    return {
      title: "Model Not Found | Novita AI",
      description: "The requested model could not be found.",
    };
  }

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const modelData = await getModelDetailData(modelId, token);

  if (!modelData) {
    return {
      title: "Model Not Found | Novita AI",
      description: "The requested model could not be found.",
    };
  }

  const { foundModel, modelConfig } = modelData;

  // Extract first sentence from description using regex
  const extractFirstSentence = (text: string): string => {
    if (!text) return "";

    // Find the first sentence ending with .?! followed by space and capital letter
    // Skip periods that are part of version numbers (like "GLM-4.5")
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
    if (sentences.length > 1) {
      return sentences[0].trim();
    }

    // Fallback: if no proper sentence found, take first 100 characters
    return text.length > 100
      ? text.substring(0, 100).trim() + "..."
      : text.trim();
  };

  // Determine title: use config title if available, otherwise use formatted title
  const finalTitle =
    modelConfig?.title ||
    `${foundModel.displayName || foundModel.name} API & Playground | ${PRODUCT_NAME}`;

  // Determine description: use config description if available, otherwise extract first sentence
  const finalMetaDescription =
    modelConfig?.description ||
    extractFirstSentence(foundModel.description || "") ||
    `${foundModel.displayName || foundModel.name} - AI model available on ${PRODUCT_NAME}`;

  return {
    title: finalTitle,
    description: finalMetaDescription,
    keywords: `${foundModel.displayName || foundModel.name}, AI model, machine learning, ${foundModel.type}`,
    alternates: getLocalizedMetadataAlternates(
      `${CANONICAL_URL.MODELS_DETAIL}/${modelId}`,
    ),
    openGraph: {
      title: finalTitle,
      description: finalMetaDescription,
      siteName: PRODUCT_NAME,
      images: [
        {
          url: "https://novita.ai/models/models-social-thumbnail.png",
          alt: `${foundModel.displayName || foundModel.name} - Novita AI Model`,
        },
      ],
    },
    twitter: {
      title: finalTitle,
      description: finalMetaDescription,
      site: PRODUCT_NAME,
      images: [
        {
          url: "https://novita.ai/models/models-social-thumbnail.png",
          alt: `${foundModel.displayName || foundModel.name} - Novita AI Model`,
        },
      ],
    },
  };
}

export default async function ModelDetailDynamicPage({
  params,
  searchParams,
}: PageProps) {
  const { modelId } = params;
  const { from } = searchParams || {};

  if (!modelId || modelId.trim() === "") {
    notFound();
  }

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const modelData = await getModelDetailData(modelId, token);

  if (!modelData) {
    notFound();
  }

  const { foundModel, modelConfig, modelName } = modelData;

  // Pre-fetch model readme content on server side
  let initialReadmeContent = {};
  try {
    const readmeResponse = await getModelReadmeContent(foundModel.id);
    initialReadmeContent = readmeResponse?.blocks || {};
  } catch (error) {
    console.error("Failed to fetch model readme content on server:", error);
  }

  return (
    <>
      <WebsiteNavbar />
      <div style={{ marginTop: "var(--header-height)" }}>
        <div className="pt-4">
          <ModelDetailPage
            modelName={modelName}
            modelVersion={foundModel.series}
            modelStatus={foundModel.status?.toString()}
            modelId={foundModel.id}
            modelLogo={foundModel.icon}
            model={foundModel}
            initialReadmeContent={initialReadmeContent}
            modelConfig={modelConfig}
            pathname={`/models/model-detail/${modelId}`}
            from={from}
          />
        </div>
      </div>
      <FooterSection />
    </>
  );
}
