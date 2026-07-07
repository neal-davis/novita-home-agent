import { useState, useEffect, useRef, useCallback } from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { ValueSlider as Slider } from "@/components/ui/standard/value-slider";
import { Plus as PlusOutlined, Trash2 as DeleteOutlined } from "lucide-react";
import styles from "./form.module.scss";
import ModelListModal, {
  ModelListModalMethods,
} from "@/app/components/modals/ModelList";
import { ModelType } from "@/app/model-api/model/components/modelList/modelList";
import ModelSelector from "@/app/components/input/ModelSelector/ModelSelector";
type LoraFormItemProps = {
  itemKey: string;
  param: {
    modelName: string;
    modelCover: string;
    strength: number;
  };
  onFocus?: () => void;
  onChange: (modelName: string, modelCover: string, strength: number) => void;
  onBlur?: () => void;
  isSDXL?: boolean;
  isInpainting?: boolean;
  baseModel?: string;
};
// const DEFAULT_LORA_MODEL =
//   process.env.NEXT_PUBLIC_ENV === "prod"
//     ? "SDXL_FILM_PHOTOGRAPHY_STYLE_BetaV0.4_139125"
//     : "hyperdetailer_v095_177226";
// const DEFAULT_LORA_MODEL_COVER =
//   process.env.NEXT_PUBLIC_ENV === "prod"
//     ? "https://next-app-static.s3.amazonaws.com/images-prod/xG1nkqKTMzGDvpLrqFT7WA/8068f6f4-7031-4c7f-a918-fa87dd2f51c0/width=450/2923439.jpeg"
//     : "https://next-app-static.s3.amazonaws.com/images/xG1nkqKTMzGDvpLrqFT7WA/bb0dd078-cf36-4f02-b9db-7ec9b70e1ebb/width=450/3713460.jpeg";
const LoraFormItem = ({
  param,
  itemKey,
  onFocus,
  onChange,
  onBlur,
  isSDXL,
  isInpainting,
  baseModel,
}: LoraFormItemProps) => {
  const [openModelList, setOpenModelList] = useState(false);
  const [model, setModel] = useState<string>("");
  const [modelCover, setModelCover] = useState<string>("");
  const [strength, setStrength] = useState(0.7);
  const modelListModal = useRef<ModelListModalMethods>(null);
  useEffect(() => {
    if (param.modelName) {
      setModel(param.modelName);
      setStrength(param.strength);
      setModelCover(param.modelCover);
    } else {
      setModel("");
      setModelCover("");
      setStrength(0.7);
    }
  }, [param.modelName, param.modelCover, param.strength]);
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
    <div className={styles.lora_form_item}>
      <ModelListModal
        ref={modelListModal}
        show={openModelList}
        wrapClassName={`lora_modellist_modal_wrapper_${itemKey}`}
        needDetails={false}
        close={() => {
          setOpenModelList(false);
        }}
        modelType={ModelType.lora}
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
          onChange((m as Model).sd_name, (m as Model).cover_url, strength);
          hideModelList();
        }}
      />
      <div className={styles.lora_form_model_wrapper}>
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
      <div className={styles.lora_strength}>
        <label>{"Strength"}:</label>
        <div className={styles.slider_wrap}>
          <Slider
            className={styles.slider}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => {
              setStrength(value);
              if (model) {
                onChange(model, modelCover, value);
              }
            }}
            value={strength}
          />
          <NumberInput
            className={styles.slider_input}
            min={0}
            max={1}
            value={strength}
            onChange={(value) => {
              if (model) {
                onChange(model, modelCover, value || strength);
              }
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            controls={false}
          />
        </div>
      </div>
    </div>
  );
};
type LoraFormProps = {
  params: {
    id?: string;
    modelName: string;
    modelCover: string;
    strength: number;
  }[];
  disabled?: boolean;
  loading?: boolean;
  onFocus?: () => void;
  onChange: (
    params: {
      modelName: string;
      modelCover: string;
      strength: number;
    }[],
  ) => void;
  onBlur?: () => void;
  isSDXL?: boolean;
  isInpainting?: boolean;
  baseModel?: string;
};
function genId(): string {
  return Math.random().toString(36).substring(2, 10);
}
export default function LoraForm({
  onFocus,
  onChange,
  onBlur,
  params,
  loading,
  disabled,
  isSDXL,
  isInpainting,
  baseModel,
}: LoraFormProps) {
  const [loraParams, setLoraParams] = useState<
    {
      id: string;
      modelName: string;
      modelCover: string;
      strength: number;
    }[]
  >([]);
  useEffect(() => {
    if (Array.isArray(params) && params.length > 0) {
      setLoraParams(
        params.map((p) => {
          return { ...p, id: p.id || genId() };
        }),
      );
    } else {
      setLoraParams([]);
      // setLoraParams([
      //   {
      //     id: genId(),
      //     modelName: DEFAULT_LORA_MODEL,
      //     modelCover: DEFAULT_LORA_MODEL_COVER,
      //     strength: 0.7,
      //   },
      // ]);
      // onChange([
      //   {
      //     modelName: DEFAULT_LORA_MODEL,
      //     modelCover: DEFAULT_LORA_MODEL_COVER,
      //     strength: 0.7,
      //   },
      // ]);
    }
  }, [params]);
  return (
    <div className={`${styles.lora_form} ${styles.form_item}`}>
      <label className={styles.title}>LoRA</label>
      {loraParams.map((p, idx) => (
        <div key={p.id} className={styles.lora_form_item_wrapper}>
          {loading && <div className={styles.form_loading}></div>}
          <LoraFormItem
            itemKey={p.id}
            param={p}
            onFocus={onFocus}
            onChange={(
              modelName: string,
              modelCover: string,
              strength: number,
            ) => {
              const newP = loraParams;
              const oldP = loraParams[idx];
              newP[idx] = {
                id: oldP?.id || genId(),
                modelName,
                modelCover,
                strength,
              };
              setLoraParams(newP);
              onChange(newP);
            }}
            onBlur={onBlur}
            isSDXL={isSDXL}
            isInpainting={isInpainting}
            baseModel={baseModel}
          />
          {loraParams.length >= 1 && (
            <span
              className={styles.form_item_close}
              onClick={() => {
                const newP = loraParams
                  .slice(0, idx)
                  .concat(loraParams.slice(idx + 1));
                setLoraParams(newP);
                onChange(newP);
              }}
            >
              <DeleteOutlined />
            </span>
          )}
        </div>
      ))}
      {loraParams.length <= 5 && (
        <div
          className={`${styles.form_item_add} ${loading || disabled ? styles.disabled : ""}`}
          onClick={() => {
            if (loading || disabled) {
              return;
            }
            const newP = loraParams.concat([
              {
                id: genId(),
                modelName: "",
                modelCover: "",
                strength: 0.7,
              },
            ]);
            setLoraParams(newP);
            onChange(newP);
          }}
        >
          <PlusOutlined />
          <span>{"Add LoRA Model"}</span>
        </div>
      )}
    </div>
  );
}
