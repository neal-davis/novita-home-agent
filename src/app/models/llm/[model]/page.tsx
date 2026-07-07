import { Metadata } from "next";
import PlaygroundHeader from "@/app/components/header/PlaygroundHeader";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import PlaygroundClient from "@/app/models-console/llm-playground/playgroundClient";
import { cookies } from "next/headers";
import { getModelDetailData } from "../../model-detail/utils/model-detail-utils";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

type ModelReadMeItem = {
  modelId: string;
  title: string;
  description: string;
  readme: string;
};

/**
 * Finds the matching model info from README data
 */
const findModelInfo = (
  readmeData: ModelReadMeItem[],
  modelId: string,
): ModelReadMeItem | undefined => {
  return readmeData.find(
    (item) =>
      item.modelId === modelId || item.modelId.replace(/\//g, "-") === modelId,
  );
};

export async function generateMetadata(props: {
  params: { model: string };
}): Promise<Metadata> {
  const { model } = props.params;

  if (!model || model.trim() === "") {
    return {
      title: "Model Not Found | Novita AI",
      description: "The requested model could not be found.",
    };
  }

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const modelData = await getModelDetailData(model, token);

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
    `${foundModel.displayName || foundModel.name} Demo | Novita AI`;

  // Determine description: use config description if available, otherwise extract first sentence
  const finalMetaDescription =
    modelConfig?.description ||
    extractFirstSentence(foundModel.description || "") ||
    `${foundModel.displayName || foundModel.name} - AI model available on Novita AI`;

  return {
    title: finalTitle,
    description: finalMetaDescription,
    keywords: `${foundModel.displayName || foundModel.name}, AI model, machine learning, ${foundModel.type}`,
    alternates: getLocalizedMetadataAlternates(
      `${CANONICAL_URL.MODELS_LLM}/${model}`,
    ),
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { model: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const isDedicatedEndpoint = Boolean(searchParams.endpoint);

  // Extract default model ID from URL parameter
  const defaultModelId = params.model?.replaceAll("/", "-");

  // Handle dedicated endpoint case - if endpoint param is present, pass the model ID as dedicatedEndpointId
  const dedicatedEndpointId = isDedicatedEndpoint ? params.model : undefined;

  return (
    <div
      style={{
        height: `calc(100vh - 80px)`,
      }}
    >
      <PlaygroundHeader />
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.playground}
        resource={PERMISSION.RESOURCE.playground}
        action={PERMISSION.ACTION.all}
        loginRequired={false}
      >
        <PlaygroundClient
          defaultModelId={defaultModelId}
          dedicatedEndpointId={dedicatedEndpointId}
        />
      </PermissionWrapper>
    </div>
  );
}
