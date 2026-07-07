import { getFullLLMModels } from "@/api/model";
import { getModelDetailConfigsInServerEnv } from "@/api/dedicated-endpoint";
import { LLMModelWithStatus } from "@/types/models";

export interface ModelDetailData {
  foundModel: LLMModelWithStatus;
  modelConfig: any;
  modelName: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
}

export function normalizeModelId(id: string): string {
  return id ? id.replaceAll("/", "-") : id;
}

export async function getModelDetailData(
  modelId: string,
  providedToken?: string,
): Promise<ModelDetailData | null> {
  try {
    const models = await getFullLLMModels(
      ["chat", "embedding", "reranker"],
      providedToken,
    );

    if (models.length === 0) {
      return null;
    }

    const normalizedModelId = normalizeModelId(modelId);
    const foundModel = models.find(
      (m) => normalizeModelId(m.id) === normalizedModelId,
    );

    if (!foundModel) {
      return null;
    }

    // Get model detail configs
    let modelConfig = null;
    try {
      const configResponse = await getModelDetailConfigsInServerEnv(
        foundModel.id,
      );
      modelConfig = configResponse?.matchedConfig || null;
    } catch (error) {
      console.error("Failed to fetch model detail configs:", error);
    }

    // Use only model detail data for header title and features description
    const modelName = foundModel.displayName || foundModel.name;
    const description = foundModel.description || "";

    // For metadata, use config data if available, fallback to model data
    const metaTitle =
      modelConfig?.title || foundModel.displayName || foundModel.name;
    const metaDescription =
      modelConfig?.description || foundModel.description || "";

    return {
      foundModel,
      modelConfig,
      modelName,
      description,
      metaTitle,
      metaDescription,
    };
  } catch (error) {
    console.error("Failed to get model detail data:", error);
    return null;
  }
}
