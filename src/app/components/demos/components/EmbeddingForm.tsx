import { useState, useEffect, useRef, useCallback } from "react";
import { Plus as PlusOutlined, Trash2 as DeleteOutlined } from "lucide-react";
import styles from "./form.module.scss";
import ModelListModal, {
  ModelListModalMethods,
} from "@/app/components/modals/ModelList";
import ModelSelector from "@/app/components/input/ModelSelector/ModelSelector";
import { ModelType } from "@/app/model-api/model/components/modelList/modelList";

type EmbeddingFormItemProps = {
  itemKey: string;
  param: { modelName: string; modelCover: string };
  onFocus?: () => void;
  onChange: (modelName: string, modelCover: string) => void;
  isSDXL?: boolean;
  isInpainting?: boolean;
  baseModel?: string;
};

// const DEFAULT_MODEL =
//   process.env.NEXT_PUBLIC_ENV === "prod"
//     ? "AuroraNegative.pt"
//     : "EasyNegativeV2_75525.safetensors";
// const DEFAULT_MODEL_COVER =
//   process.env.NEXT_PUBLIC_ENV === "prod"
//     ? "https://huggingface.co/SweetLuna/Aurora/resolve/main/AuroraEmbeddings/AuroraNegative.pt"
//     : "https://next-app-static.s3.amazonaws.com/images-prod/xG1nkqKTMzGDvpLrqFT7WA/6cd9f05f-8bec-49a1-bacd-2963754a5ec8/width=450/1345402.jpeg";

const EmbeddingFormItem = ({
  param,
  itemKey,
  onFocus,
  onChange,
  isSDXL,
  isInpainting,
  baseModel,
}: EmbeddingFormItemProps) => {
  const [openModelList, setOpenModelList] = useState(false);
  const [model, setModel] = useState<string>("");
  const [modelCover, setModelCover] = useState<string>("");

  const modelListModal = useRef<ModelListModalMethods>(null);

  useEffect(() => {
    if (param.modelName) {
      setModel(param.modelName);
      setModelCover(param.modelCover || "");
    } else {
      setModel("");
      setModelCover("");
    }
  }, [param.modelName, param.modelCover]);

  const showModelList = useCallback(() => {
    if (!openModelList) {
      setOpenModelList(true);
    }
    modelListModal.current?.open();
  }, [openModelList]);
  const hideModelList = useCallback(() => {
    modelListModal.current?.close();
  }, []);

  return (
    <div className={styles.form_item}>
      <ModelListModal
        ref={modelListModal}
        show={openModelList}
        wrapClassName={`modellist_modal_wrapper_${itemKey}`}
        needDetails={false}
        close={() => {
          setOpenModelList(false);
        }}
        modelType={ModelType.textual_inversion}
        filter={{
          is_sdxl: isSDXL,
          is_inpainting: isInpainting,
          source: "",
        }}
        baseModel={baseModel}
        selectedModelName={model}
        onModelSelect={(m) => {
          setModel((m as Model).sd_name);
          setModelCover((m as Model).cover_url);
          onChange((m as Model).sd_name, (m as Model).cover_url);
          hideModelList();
        }}
      />
      <div className={styles.multi_model_form_model_wrapper}>
        <ModelSelector
          value={model}
          modelCover={modelCover}
          fieldProps={{
            onFocus: onFocus,
            onClick: showModelList,
          }}
          style={{ border: 0, padding: 0 }}
        />
      </div>
    </div>
  );
};

type EmbeddingFormProps = {
  params: {
    id?: string;
    modelName: string;
    modelCover: string;
  }[];
  disabled?: boolean;
  loading?: boolean;
  onFocus?: () => void;
  onChange: (params: { modelName: string; modelCover: string }[]) => void;
  onBlur?: () => void;
  isSDXL?: boolean;
  isInpainting?: boolean;
  baseModel?: string;
};

function genId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function EmbeddingForm({
  onFocus,
  onChange,
  params,
  loading,
  disabled,
  isSDXL,
  isInpainting,
  baseModel,
}: EmbeddingFormProps) {
  const [embeddingParams, setEmbeddingParams] = useState<
    { id: string; modelName: string; modelCover: string }[]
  >([]);

  useEffect(() => {
    if (Array.isArray(params) && params.length > 0) {
      setEmbeddingParams(
        params.map((p) => {
          return { ...p, id: p.id || genId() };
        }),
      );
    } else {
      setEmbeddingParams([]);
    }
  }, [params]);

  return (
    <div className={`${styles.multi_model_form} ${styles.form_item}`}>
      <label className={styles.title}>Embeddings</label>
      {embeddingParams.map((p, idx) => (
        <div key={p.id} className={styles.multi_model_form_item_wrapper}>
          {loading && <div className={styles.form_loading}></div>}
          <EmbeddingFormItem
            itemKey={p.id}
            param={p}
            onFocus={onFocus}
            onChange={(modelName: string, modelCover: string) => {
              const newP = embeddingParams;
              const oldP = embeddingParams[idx];
              newP[idx] = {
                id: oldP?.id || genId(),
                modelName,
                modelCover,
              };
              setEmbeddingParams(newP);
              onChange(newP);
            }}
            isSDXL={isSDXL}
            isInpainting={isInpainting}
            baseModel={baseModel}
          />
          {embeddingParams.length >= 1 && (
            <span
              className={styles.form_item_close}
              onClick={() => {
                const newP = embeddingParams
                  .slice(0, idx)
                  .concat(embeddingParams.slice(idx + 1));
                setEmbeddingParams(newP);
                onChange(newP);
              }}
            >
              <DeleteOutlined />
            </span>
          )}
        </div>
      ))}
      {embeddingParams.length <= 5 && (
        <div
          className={`${styles.form_item_add} ${
            loading || disabled ? styles.disabled : ""
          }`}
          onClick={() => {
            if (loading || disabled) {
              return;
            }
            const newP = embeddingParams.concat([
              {
                id: genId(),
                modelName: "",
                modelCover: "",
              },
            ]);
            setEmbeddingParams(newP);
            onChange(newP);
          }}
        >
          <PlusOutlined />
          <span>Add Embedding Model</span>
        </div>
      )}
    </div>
  );
}
