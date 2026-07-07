import { ExternalLink } from "lucide-react";
import Link from "next/link";
import commonStyles from "../sub-pages/DedicatedEndpointDetail.module.scss";
import styles from "./EndpointModelInfo.module.scss";

// interface ModelFieldValue {
//   modelId: string;
//   token: string;
//   loraAdapters: string[];
// }

export default function EndpointModelInfo({
  baseModel,
}: {
  baseModel: LLMDedicatedEndpointModel;
}) {
  // const [isEditing, setIsEditing] = useState(false);
  // const [isSaving, setIsSaving] = useState(false);
  // const [modelCheckStatus, setModelCheckStatus] = useState<
  //   "success" | "error" | "loading" | null
  // >(null);
  // const [updatedBaseModel, setUpdatedBaseModel] =
  //   useState<LLMDedicatedEndpointModel>(baseModel);
  // const [updatedLoras, setUpdatedLoras] =
  //   useState<LLMDedicatedEndpointLora[]>(loras);

  // const handleEdit = () => {
  //   setIsEditing(true);
  //   setUpdatedBaseModel(baseModel);
  //   setUpdatedLoras(loras);
  // };

  // const handleSave = async () => {
  //   if (modelCheckStatus !== "success") {
  //     return;
  //   }

  //   setIsSaving(true);
  //   await handleUpdate(updatedLoras, updatedBaseModel);
  //   await syncEndpointData();
  //   setIsSaving(false);
  //   setIsEditing(false);
  // };

  // const onDataChange = (value: ModelFieldValue) => {
  //   const newBaseModel: LLMDedicatedEndpointModel = {
  //     ...baseModel,
  //     modelId: value.modelId,
  //   };

  //   const newLoras: LLMDedicatedEndpointLora[] = value.loraAdapters.map(
  //     (adapterId: string) => ({
  //       modelId: adapterId,
  //       provider: "huggingface",
  //       revision: "",
  //       token: value.token,
  //     }),
  //   );

  //   setUpdatedBaseModel(newBaseModel);
  //   setUpdatedLoras(newLoras);
  // };

  return (
    <div className={commonStyles.card_wrapper}>
      <div className="p-4 pb-2 flex items-center justify-between">
        <p className={commonStyles.title}>Model</p>
        {/* {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-3"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="px-3"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Save
            </Button>
          </div>
        ) : (
          <button className={commonStyles.edit_button} onClick={handleEdit}>
            <span className="iconfont icon-pencil-line"></span>
            <span className={commonStyles.edit_text}>Edit</span>
          </button>
        )} */}
      </div>

      {/* {isEditing ? (
        <ModelField
          mode="edit"
          value={{
            modelId: updatedBaseModel.modelId,
            token: "",
            loraAdapters: updatedLoras.map((lora) => lora.modelId),
          }}
          checkStatus={modelCheckStatus}
          setCheckStatus={setModelCheckStatus}
          onChange={onDataChange}
        />
      ) : ( */}
      <Link
        href={`https://huggingface.co/${baseModel.modelId}`}
        target="_blank"
        className={styles.model_box}
      >
        <img src={"/logo/huggingface.svg"} alt="huggingface" width={24} />
        <p className={styles.model_name}>{baseModel.modelId}</p>
        <ExternalLink className="w-[14px] h-[14px]" />
        {baseModel.revision && (
          <span className={styles.model_version}>{baseModel.revision}</span>
        )}
      </Link>
      {/* )} */}
    </div>
  );
}
