"use client";
import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
  CSSProperties,
  DOMAttributes,
  InputHTMLAttributes,
  MouseEvent,
} from "react";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { Loader2 } from "lucide-react";
import { ChevronRight as RightOutlined } from "lucide-react";
import { KeyContext } from "@/app/models/lib/context";
import { getModelDetail } from "@/api/model";
import ModelListModal, {
  ModelListModalMethods,
} from "@/app/components/modals/ModelList";
import { ModelType } from "@/app/model-api/model/components/modelList/modelList";
import styles from "./ModelSelector.module.scss";
type ModelSelectorProps = {
  onModelSelect?: (modelDetails: ModelDetails | Model) => void;
  modelType: ModelType;
  modelId?: number;
  initModelCover?: string;
  value?: string | number;
  fixedModel?: string;
  fieldProps?: InputHTMLAttributes<HTMLInputElement> &
    DOMAttributes<HTMLInputElement>;
  style?: CSSProperties;
  hideCover?: boolean;
  open?: boolean;
  baseModel?: string;
};
export default function ModelSelector({
  modelType,
  value,
  modelId,
  fixedModel,
  initModelCover,
  fieldProps,
  style,
  hideCover,
  onModelSelect,
  open,
  baseModel,
}: ModelSelectorProps) {
  const { setParams } = useContext(KeyContext);
  const [initLoading, setInitLoading] = useState(false);
  const [modelCover, setModelCover] = useState(initModelCover);
  const [openModelList, setOpenModelList] = useState(false);
  const prevModelIdRef = useRef(modelId);
  const modelListModal = useRef<ModelListModalMethods>(null);
  const updateByModelInfo = useCallback(
    (modelDetails: ModelDetails) => {
      onModelSelect?.(modelDetails);
      if (modelDetails.cover_url) {
        setModelCover(modelDetails.cover_url);
      }
      if (modelDetails.is_nsfw) {
        setModelCover("/not_found.png");
      }
      const newParams: any = {};
      if (modelType === ModelType.base) {
        newParams.model_id = modelDetails.model_id;
        newParams.model_name = modelDetails.model_name;
        newParams.is_sdxl = modelDetails.is_sdxl || false;
        newParams.is_sd3 = modelDetails.is_sd3 || false;
        newParams.base_model = modelDetails.base_model || "";
      }
      if (!modelDetails.is_sdxl) {
        newParams.sd_refiner = undefined;
      }
      if (modelDetails.is_sd3) {
        newParams.width = 1024;
        newParams.height = 1024;
        newParams.steps = 28;
        newParams.guidance_scale = 4;
        newParams.sampler_name = "FlowMatchEuler";
        newParams.controlnet = {};
        newParams.loras = [];
      }
      setParams((v) => ({
        ...v,
        ...newParams,
      }));
    },
    [modelType, setParams, onModelSelect],
  );
  useEffect(() => {
    const init = async () => {
      if (open) {
        setOpenModelList(true);
      }
      if (modelId && prevModelIdRef.current !== modelId) {
        setInitLoading(true);
        try {
          const details = await getModelDetail(modelId);
          if (details) {
            updateByModelInfo(details);
          }
        } catch {
          //
        }
        setInitLoading(false);
      }
      prevModelIdRef.current = modelId;
    };
    init();
  }, [modelId, open, updateByModelInfo]);
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
    <div
      className={`${styles.model_selector_wrap} ${fixedModel ? styles.model_selector_fixed : ""} ${fieldProps?.disabled || initLoading ? styles.disabled : ""}`}
    >
      {initLoading && (
        <div className={styles.model_loading}>
          <Loader2
            className={`h-10 w-10 animate-spin ${styles.loading_spin}`}
          />
        </div>
      )}
      <Tooltip title={fixedModel || (value as string)} mouseEnterDelay={0.5}>
        <div
          className={`${styles.model_selector_trigger} ${hideCover ? styles.model_selector_nocover : ""} ${fieldProps?.disabled ? styles.disabled : ""}`}
          style={style}
          onClick={(e) => {
            if (fieldProps?.disabled || fixedModel) {
              return;
            }
            showModelList();
            if (fieldProps?.onClick) {
              fieldProps.onClick(e as MouseEvent<HTMLInputElement>);
            }
            if (fieldProps?.onFocus) {
              fieldProps.onFocus(e as any);
            }
          }}
        >
          {!hideCover && (
            <img
              className={styles.model_cover}
              src={initModelCover || modelCover || "/not_found.png"}
              alt="cover"
            />
          )}
          <span className={styles.model_name}>
            {fixedModel || value || "Click to select..."}
          </span>
          {!fixedModel && (
            <span className={styles.arrow}>
              <RightOutlined />
            </span>
          )}
        </div>
      </Tooltip>
      <ModelListModal
        ref={modelListModal}
        show={openModelList}
        needDetails={true}
        wrapClassName="modellist_modal_wrapper"
        close={() => {
          setOpenModelList(false);
        }}
        modelType={modelType}
        selectedModelId={modelId}
        defaultBaseModel={baseModel}
        filter={{
          is_inpainting: false,
        }}
        onModelSelect={(modelDetails: ModelDetails | Model) => {
          hideModelList();
          if (modelDetails) {
            updateByModelInfo(modelDetails as ModelDetails);
          }
        }}
      />
    </div>
  );
}
