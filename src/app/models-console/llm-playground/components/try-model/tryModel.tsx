import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { useModel } from "../../providers/ModelProvider";

export function TryModel() {
  const { currentModel } = useModel();
  return (
    <div className="flex flex-col gap-1 items-center m-auto">
      <ModelLogo
        size={24}
        modelName={
          currentModel?.displayName ||
          currentModel?.name ||
          currentModel?.id?.toString() ||
          ""
        }
        vendorName={currentModel?.series}
      />
      <h5 className="text-common-dark-1 font-h5 flex items-center gap-1">
        <span>Try</span>
        <span>{currentModel?.displayName || ""}</span>
      </h5>
      <div className="text-sm text-common-dark-2">
        {`Kick the tires, see how ${currentModel?.displayName || ""} performs on Novita AI`}
      </div>
    </div>
  );
}
