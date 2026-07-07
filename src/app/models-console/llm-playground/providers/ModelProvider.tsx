"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { LLMModelWithStatus } from "@/types/models";
import { useFetchModelList } from "../hooks/useFetchModelList";
import { useSearchParams } from "next/navigation";
import { transformModelIdToPath } from "@/lib/utils";

interface ModelContextValue {
  modelList: LLMModelWithStatus[];
  currentModel: LLMModelWithStatus | null;
  setCurrentModel: (model: LLMModelWithStatus | null) => void;
  isLoadingModels: boolean;
  modelError: Error | null;
  dedicatedEndpointId?: string;
  isModelDetailPage: boolean;
}

const ModelContext = createContext<ModelContextValue | null>(null);

interface ModelProviderProps {
  children: ReactNode;
  defaultModelId?: string;
  dedicatedEndpointId?: string;
}

export function ModelProvider({
  children,
  defaultModelId,
  dedicatedEndpointId,
}: ModelProviderProps) {
  const { modelList, currentModel, setCurrentModel, isLoading, error } =
    useFetchModelList({ dedicatedEndpointId });

  const isModelDetailPage = !!defaultModelId;

  const search = useSearchParams();
  const modelParam = search.get("model");

  // Auto-select model based on defaultModelId
  useEffect(() => {
    const defaultModel = defaultModelId || modelParam || "";
    if (defaultModel && modelList.length > 0 && !dedicatedEndpointId) {
      const model = modelList.find(
        (model: LLMModelWithStatus) =>
          model.id.includes(defaultModel) ||
          transformModelIdToPath(model.id) === defaultModel,
      );
      setCurrentModel((prev) => {
        if (model && model.id !== prev?.id) {
          return model;
        }
        return prev;
      });
    }
  }, [
    defaultModelId,
    modelList,
    dedicatedEndpointId,
    setCurrentModel,
    modelParam,
  ]);

  const value: ModelContextValue = {
    modelList,
    currentModel,
    setCurrentModel,
    isLoadingModels: isLoading,
    modelError: error,
    dedicatedEndpointId,
    isModelDetailPage,
  };

  return (
    <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within ModelProvider");
  }
  return context;
}
