import { getFullLLMModelsWithCache } from "@/api/model";
import { getLLMDedicatedEndpointById } from "@/api/dedicated-endpoint";
import { LLMModelWithStatus, ModelType } from "@/types/models";
import { useEffect, useState } from "react";

/**
 * Creates a dedicated endpoint model from the endpoint response
 */
const createDedicatedEndpointModel = (
  endpoint: LLMDedicatedEndpoint,
): LLMModelWithStatus => {
  const modelId = endpoint.baseModel.modelAlias || endpoint.baseModel.modelId;
  const maxOutputTokens = endpoint.engine?.config?.maxModelLen
    ? Math.floor(endpoint.engine.config.maxModelLen / 2)
    : 0;
  return {
    id: modelId,
    name: modelId,
    displayName: endpoint.name || modelId,
    type: ModelType.Chat,
    context_size: endpoint.engine?.config?.maxModelLen || 0,
    description: "",
    input_token_price_per_m: 0,
    input_token_price_per_m_toString: "",
    output_token_price_per_m: 0,
    output_token_price_per_m_toString: "",
    status: 1,
    max_output_tokens: maxOutputTokens,
  };
};

export function useFetchModelList(params?: { dedicatedEndpointId?: string }) {
  const [modelList, setModelList] = useState<LLMModelWithStatus[]>([]);
  const [currentModel, setCurrentModel] = useState<LLMModelWithStatus | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchModels = async () => {
      setIsLoading(true);
      try {
        if (params?.dedicatedEndpointId) {
          // Fetch dedicated endpoint
          const endpoint = await getLLMDedicatedEndpointById({
            id: params.dedicatedEndpointId,
            signal: abortController.signal,
          });
          if (endpoint) {
            const model = createDedicatedEndpointModel(endpoint);
            setModelList([model]);
            setCurrentModel(model);
          } else {
            throw new Error("Dedicated endpoint not found");
          }
        } else {
          // Fetch regular model list with cache
          const res = await getFullLLMModelsWithCache(["chat"]);
          // Filter models that contain "serverless" in features field
          const filteredModels = res.filter((model: LLMModelWithStatus) => {
            const features = model.features || [];
            const featuresArray = Array.isArray(features)
              ? features
              : [features];
            return featuresArray.some(
              (f: string) =>
                f && typeof f === "string" && f.toLowerCase() === "serverless",
            );
          });
          setModelList(filteredModels);
          setCurrentModel(filteredModels[0] || null);
        }
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err);
          console.error("Failed to fetch model list:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();

    return () => {
      abortController.abort();
    };
  }, [params?.dedicatedEndpointId]);

  return {
    modelList,
    currentModel,
    setCurrentModel,
    setModelList,
    isLoading,
    error,
  };
}
