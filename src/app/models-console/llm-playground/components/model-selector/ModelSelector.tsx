import { SelectFilter } from "@/components/ui/standard/selectFilter";
import { useModel } from "../../providers/ModelProvider";
import { useChatConfig } from "../../providers/ChatConfigProvider";
import { ChevronsUpDown } from "lucide-react";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { useRouter } from "next/navigation";
import { transformModelIdToPath } from "@/lib/utils";
import { NOVITA_URL } from "@/constants/urls";

const MODEL_SELECTOR_TRIGGER_CLASS_NAME = "h-10";

export function ModelSelector() {
  const { modelList, currentModel, setCurrentModel, isModelDetailPage } =
    useModel();
  const { clearChatHistory } = useChatConfig();
  const router = useRouter();
  const handleModelChange = (value: string) => {
    const model = modelList.find((model) => model.id === value);
    if (!model) return;

    const modelPath = transformModelIdToPath(model.id);

    if (isModelDetailPage) {
      // case1: model detail page - use router.replace to switch route
      router.replace(`/models/llm/${modelPath}`);
    } else {
      // case2: console playground - clear history and set current model
      clearChatHistory();
      setCurrentModel(model);
      router.push(`${NOVITA_URL.LLM_CONSOLE_PLAYGROUND}?model=${modelPath}`);
    }
  };

  return (
    <SelectFilter
      value={currentModel?.id}
      options={modelList}
      onValueChange={handleModelChange}
      getOptionValue={(model) => model.id}
      getOptionLabel={(model) => model.displayName}
      getOptionSearchText={(model) => [model.displayName, model.id]}
      renderOption={(model) => (
        <div className="flex items-center gap-2">
          <ModelLogo
            modelName={
              model.displayName || model.name || model.id?.toString() || ""
            }
            vendorName={model.series}
            size={20}
          />
          <span className="text-sm">{model.displayName}</span>
        </div>
      )}
      triggerClassName={MODEL_SELECTOR_TRIGGER_CLASS_NAME}
      triggerIcon={<ChevronsUpDown className="w-4 h-4" />}
      inputPlaceholder="Search models"
      emptyText="No matching models found"
      placeholder="Please select a model"
    />
  );
}
