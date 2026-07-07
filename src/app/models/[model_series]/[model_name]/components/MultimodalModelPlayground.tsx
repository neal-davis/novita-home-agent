"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { DynamicModelConfig } from "@/types/dynamic-pricing";
import {
  parseOpenAPISchema,
  parseRawListItem,
} from "@/app/models-console/multimodal-playground/utils/schemaParser";
import { usePlaygroundForm } from "@/app/models-console/multimodal-playground/hooks/usePlaygroundForm";
import { useTaskExecution } from "@/app/models-console/multimodal-playground/hooks/useTaskExecution";
import { savePlaygroundFormData } from "@/app/models-console/multimodal-playground/utils/localStorage";
import { TabsSection } from "@/app/models-console/multimodal-playground/components/TabsSection";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { Copy, Check } from "lucide-react";
// import { fetchMultimodalConfigs } from "@/store/slice/multimodalSlice";
import Breadcrumb from "@/app/components/Breadcrumb";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./MultimodalModelPlayground.module.scss";
interface MultimodalModelPlaygroundProps {
  modelConfig: DynamicModelConfig;
}
export default function MultimodalModelPlayground({
  modelConfig,
}: MultimodalModelPlaygroundProps) {
  // const dispatch = useAppDispatch();
  const router = useRouter();
  const uuid = useAppSelector((state) => state.user.uuid);
  const [activeTab, setActiveTab] = useState("playground");
  const [copied, setCopied] = useState(false);
  // useEffect(() => {
  //   dispatch(fetchMultimodalConfigs(false) as any);
  // }, [dispatch]);
  // Parse model config
  const selectedModel = useMemo(
    () => parseRawListItem(modelConfig),
    [modelConfig],
  );
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
  // Initialize with first example on mount
  useEffect(() => {
    if (
      examples.length > 0 &&
      !taskState.result &&
      taskState.status === "idle"
    ) {
      setExampleResult(examples[0].response);
    }
  }, [examples, taskState.result, taskState.status, setExampleResult]);
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
  const handleExampleSelect = (example: {
    request: Record<string, any>;
    response: Record<string, any>;
  }) => {
    setFormData(example.request);
    setExampleResult(example.response);
  };
  const handleCopyModelName = () => {
    navigator.clipboard.writeText(modelConfig.fusionConfig.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const apiDocLink = useMemo(() => {
    if (!endpoint) return "";
    const segments = endpoint.split("/");
    const endpointName = segments[segments.length - 1];
    return endpointName
      ? `https://novita.ai/docs/api-reference/model-apis-${endpointName}`
      : "";
  }, [endpoint]);
  // Extract category label from modelConfig
  const getCategoryLabel = () => {
    const category = modelConfig.modelConfig?.config?.category;
    const categoryMap: Record<string, string> = {
      video_gen: "Video",
      image_gen: "Image",
      audio_gen: "Audio",
      text_gen: "Text",
    };
    return categoryMap[category] || "Models";
  };
  return (
    <div className={styles.playground_container}>
      {/* Fixed Breadcrumb */}
      <div className={`${styles.fixed_breadcrumb} md:max_width_container`}>
        <Breadcrumb
          previousPage={"Home"}
          modelName={modelConfig.fusionConfig.displayName}
          previousPageUrl={NOVITA_URL.HOME}
          variant="default"
          align="left"
        />
      </div>

      {/* Tabs Section with Model Header */}
      <TabsSection
        pageType="web"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        modelCategory={selectedModel.category}
        modelDescription={
          selectedModel.description ||
          selectedModel.openapiSchema.info.description ||
          ""
        }
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
        modelHeader={
          <div className="max_width_container">
            <div className={styles.model_header}>
              <div className={styles.header_content}>
                <div className={styles.model_info}>
                  <div className={styles.model_logo}>
                    <ModelLogo
                      modelName={
                        modelConfig.fusionConfig.series ||
                        modelConfig.fusionConfig.displayName
                      }
                      size={32}
                    />
                  </div>
                  <div className={styles.model_details}>
                    <div className={styles.model_title_row}>
                      <h1 className={styles.model_title}>
                        {modelConfig.fusionConfig.displayName}
                      </h1>
                    </div>
                    <div className={styles.model_tags}>
                      <span className={styles.category_tag}>
                        {getCategoryLabel()}
                      </span>
                      <button
                        className={styles.model_name_tag}
                        onClick={handleCopyModelName}
                        title={"Copy model name"}
                      >
                        <span>{modelConfig.fusionConfig.name}</span>
                        {copied ? (
                          <Check className={styles.copy_icon} />
                        ) : (
                          <Copy className={styles.copy_icon} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {apiDocLink && (
                  <Link
                    href={apiDocLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.api_doc_button}
                  >
                    {"Model API docs"}
                  </Link>
                )}
              </div>
              <p className={styles.model_description}>
                {modelConfig.fusionConfig.description || ""}
              </p>
              <div className={styles.divider} />
            </div>
          </div>
        }
      />
    </div>
  );
}
