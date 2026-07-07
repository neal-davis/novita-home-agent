import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store";
import { MultimodalDetail } from "@/types/multimodal-playground";
import { DynamicModelConfig } from "@/types/dynamic-pricing";
import { parseRawListItem } from "../utils/schemaParser";

interface UseModelConfigsReturn {
  isLoading: boolean;
  error: string | null;
  modelList: DynamicModelConfig[];
  selectedModel: MultimodalDetail | null;
  setSelectedModel: (model: MultimodalDetail) => void;
}

export const useModelConfigs = (): UseModelConfigsReturn => {
  const searchParams = useSearchParams();
  const modelParam = searchParams.get("model");

  // Get data from Redux store
  const modelList = useAppSelector((state) => state.multimodal.configs);
  const isLoading = useAppSelector((state) => state.multimodal.loading);
  const error = useAppSelector((state) => state.multimodal.error);

  const [selectedModel, setSelectedModel] = useState<MultimodalDetail | null>(
    null,
  );

  // Initialize selected model when modelList is loaded
  useEffect(() => {
    if (modelList.length > 0 && !selectedModel) {
      let modelToSelect: MultimodalDetail | null = null;

      if (modelParam) {
        const matchedModel = modelList.find(
          (config) => config.fusionConfig.name === modelParam,
        );
        modelToSelect = parseRawListItem(matchedModel || modelList[0]);
      } else {
        modelToSelect = parseRawListItem(modelList[0]);
      }

      if (modelToSelect) {
        setSelectedModel(modelToSelect);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelList, modelParam]); // Only run when modelList or modelParam changes

  // Handle URL parameter changes (after model list is loaded)
  useEffect(() => {
    if (modelList.length > 0 && modelParam) {
      const matchedModel = modelList.find(
        (config) => config.fusionConfig.name === modelParam,
      );
      if (
        matchedModel &&
        matchedModel.fusionConfig.name !== selectedModel?.name
      ) {
        setSelectedModel(parseRawListItem(matchedModel));
      }
    }
  }, [modelParam, modelList, selectedModel?.name]);

  return {
    modelList,
    selectedModel,
    isLoading,
    error,
    setSelectedModel,
  };
};
