"use client";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchMultimodalConfigs } from "@/store/slice/multimodalSlice";
import { parseOpenAPISchema, parseRawListItem } from "./utils/schemaParser";
import { useModelConfigs } from "./hooks/useModelConfigs";
import { usePlaygroundForm } from "./hooks/usePlaygroundForm";
import { useTaskExecution } from "./hooks/useTaskExecution";
import { savePlaygroundFormData } from "./utils/localStorage";
import { ModelSelector } from "./components/ModelSelector";
import { TabsSection } from "./components/TabsSection";
import { Loader2 } from "lucide-react";
import styles from "./page.module.scss";
export default function MultimodalPlaygroundPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const uuid = useAppSelector((state) => state.user.uuid);
  // Initialize multimodal config on mount
  useEffect(() => {
    dispatch(fetchMultimodalConfigs(false) as any);
  }, [dispatch]);
  const [activeTab, setActiveTab] = useState("playground");
  const { modelList, selectedModel, isLoading, error, setSelectedModel } =
    useModelConfigs();
  const { requestSchema, endpoint, requiredFields } = useMemo(() => {
    if (!selectedModel?.openapiSchema) {
      return {
        requestSchema: {},
        endpoint: "",
        method: "post",
        requiredFields: [],
      };
    }
    return parseOpenAPISchema(selectedModel.openapiSchema);
  }, [selectedModel]);
  const examples = useMemo(
    () => selectedModel?.examples || [],
    [selectedModel?.examples],
  );
  const markdown = useMemo(
    () => selectedModel?.markdown || "",
    [selectedModel?.markdown],
  );
  const {
    formData,
    errors,
    handleFieldChange,
    handleReset: resetForm,
    validateForm,
    getFilteredData,
    setFormData,
  } = usePlaygroundForm({
    requestSchema,
    requiredFields,
    examples,
    modelName: selectedModel?.name,
  });
  const { taskState, executeTask, resetTask, cancelTask, setExampleResult } =
    useTaskExecution({
      endpoint,
      examples,
    });
  const handleReset = () => {
    resetForm();
    resetTask();
  };
  const handleRun = () => {
    if (!uuid) {
      if (selectedModel?.name) {
        savePlaygroundFormData(selectedModel.name, formData);
      }
      const currentPath = window.location.pathname + window.location.search;
      const loginUrl = `/user/login?redirect=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return;
    }
    if (!validateForm()) {
      return;
    }
    const filteredData = getFilteredData();
    executeTask(filteredData, selectedModel?.async || false);
  };
  const handleModelChange = (modelName: string) => {
    const newModel = modelList.find(
      (config) => config.fusionConfig.name === modelName,
    );
    if (newModel) {
      setSelectedModel(parseRawListItem(newModel));
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("model", modelName);
      router.push(`?${params.toString()}`);
    }
  };
  const handleExampleSelect = (example: {
    request: Record<string, any>;
    response: Record<string, any>;
  }) => {
    setFormData(example.request);
    setExampleResult(example.response);
  };
  if (isLoading || !selectedModel) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-common-dark-2">{"Loading..."}</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.playground_page}>
        <div className={styles.error_state}>
          <p>{error || "Model configuration not found"}</p>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.playground_page}>
      {/* Model Selector Header */}
      <ModelSelector
        modelList={modelList}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        endpoint={endpoint}
      />

      {/* Tabs Section */}
      <TabsSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        modelCategory={selectedModel.category}
        modelDescription={selectedModel.description || ""}
        requestSchema={requestSchema}
        requiredFields={requiredFields}
        formData={formData}
        errors={errors}
        onFieldChange={handleFieldChange}
        onReset={handleReset}
        onRun={handleRun}
        taskState={taskState}
        endpoint={endpoint}
        isAsyncTask={selectedModel.async}
        isLoggedIn={!!uuid}
        examples={examples}
        markdown={markdown}
        onExampleSelect={handleExampleSelect}
        onCancelTask={cancelTask}
        modelName={selectedModel.name}
      />
    </div>
  );
}
