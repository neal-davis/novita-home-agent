import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import ModelDetailPage from "@/app/components/ModelDetail/ModelDetailPage";
import { getFullLLMModels } from "@/api/model";
import {
  getModelReadmeContent,
  getModelDetailConfigsInServerEnv,
} from "@/api/dedicated-endpoint";

interface PageProps {
  params: {
    modelId: string;
  };
}

function normalizeModelId(id: string) {
  return id ? id.replaceAll("/", "-") : id;
}

export default async function ModelDetailDynamicPage({ params }: PageProps) {
  const { modelId } = params;

  if (!modelId || modelId.trim() === "") {
    notFound();
  }

  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const models = await getFullLLMModels(
      ["chat", "embedding", "reranker"],
      token,
    );

    if (models.length === 0) {
      notFound();
    }

    const normalizedModelId = normalizeModelId(modelId);
    const foundModel = models.find(
      (m) => normalizeModelId(m.id) === normalizedModelId,
    );

    if (!foundModel) {
      notFound();
    }

    // Pre-fetch model readme content on server side
    let initialReadmeContent = {};
    try {
      const readmeResponse = await getModelReadmeContent(foundModel.id);
      initialReadmeContent = readmeResponse?.blocks || {};
    } catch (error) {
      console.error("Failed to fetch model readme content on server:", error);
    }

    // Pre-fetch model detail configs on server side
    let modelConfig = null;
    try {
      const configResponse = await getModelDetailConfigsInServerEnv(
        foundModel.id,
      );
      modelConfig = configResponse?.matchedConfig || null;
    } catch (error) {
      console.error("Failed to fetch model detail configs on server:", error);
    }

    const modelName =
      modelConfig?.title || foundModel.displayName || foundModel.name;

    return (
      <ModelDetailPage
        modelName={modelName}
        modelVersion={foundModel.series}
        modelStatus={foundModel.status?.toString()}
        modelId={foundModel.id}
        modelLogo={foundModel.icon}
        model={foundModel}
        initialReadmeContent={initialReadmeContent}
        modelConfig={modelConfig}
        pathname={`/models-console/model-detail/${modelId}`}
      />
    );
  } catch (error) {
    notFound();
  }
}
