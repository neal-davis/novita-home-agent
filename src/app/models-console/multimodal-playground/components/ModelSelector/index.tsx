import { useMemo } from "react";
import Link from "next/link";
import { ChevronsUpDown } from "lucide-react";
import { SelectFilter } from "@/components/ui/standard/selectFilter";
import { MultimodalDetail } from "@/types/multimodal-playground";
import { DynamicModelConfig } from "@/types/dynamic-pricing";
import styles from "./index.module.scss";
interface ModelSelectorProps {
  modelList: DynamicModelConfig[];
  selectedModel: MultimodalDetail;
  onModelChange: (modelName: string) => void;
  endpoint: string;
}
export const ModelSelector = ({
  modelList,
  selectedModel,
  onModelChange,
  endpoint,
}: ModelSelectorProps) => {
  const apiDocLink = useMemo(() => {
    if (!endpoint) return "";
    const segments = endpoint.split("/");
    const endpointName = segments[segments.length - 1];
    return endpointName
      ? `https://novita.ai/docs/api-reference/model-apis-${endpointName}`
      : "";
  }, [endpoint]);
  return (
    <div className={styles.header}>
      <div className={styles.left_section}>
        <SelectFilter
          value={selectedModel.name}
          options={modelList}
          onValueChange={onModelChange}
          getOptionValue={(config) => config.fusionConfig.name}
          getOptionLabel={(config) => config.fusionConfig.displayName}
          getOptionSearchText={(config) => [
            config.fusionConfig.displayName,
            config.fusionConfig.name,
          ]}
          triggerClassName={styles.model_selector}
          triggerIcon={<ChevronsUpDown className="h-4 w-4 opacity-100" />}
          contentClassName={styles.select_content}
          inputPlaceholder="Search models"
          emptyText="No matching models found"
          placeholder="Please select a model"
        />
        <p className={styles.description}>{selectedModel.description || ""}</p>
      </div>
      {apiDocLink && (
        <div className={styles.right_section}>
          <Link
            href={apiDocLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.api_doc_button}
          >
            {"Model API docs"}
          </Link>
        </div>
      )}
    </div>
  );
};
