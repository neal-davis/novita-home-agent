import { useState, useEffect, useCallback, useRef } from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import { ValueSlider as Slider } from "@/components/ui/standard/value-slider";
import { Plus as PlusOutlined, Trash2 as DeleteOutlined } from "lucide-react";
import styles from "./form.module.scss";
import Dragger from "@/app/components/dragger/Dragger";
const modelPreprocessorMap: Record<string, string[]> = {
  control_v11p_sd15_scribble: [
    "scribble_hed",
    "scribble_hedsafe",
    "scribble_pidinet",
    "scribble_pidsafe",
  ],
  control_v11p_sd15_softedge: [
    "softedge_hed",
    "softedge_hedsafe",
    "softedge_pidinet",
    "softedge_pidsafe",
  ],
  control_v11f1p_sd15_depth: [
    "depth_midas",
    "depth_zoe",
    "depth",
    "depth_leres",
    "depth_leres++",
  ],
  control_v11p_sd15_mlsd: ["mlsd"],
  control_v11p_sd15_openpose: [
    "openpose",
    "openpose_face",
    "openpose_faceonly",
    "openpose_full",
    "openpose_hand",
    "dwpose",
  ],
  control_v11p_sd15_normalbae: ["normal_bae"],
  control_v11p_sd15_lineart: [
    "lineart_coarse",
    "lineart_realistic",
    "lineart_anime",
    "lineart",
  ],
  control_v11e_sd15_shuffle: ["shuffle"],
  control_v11p_sd15_canny: ["canny"],
  "controlnet-canny-sdxl-1.0": ["canny"],
  "controlnet-depth-sdxl-1.0": [
    "depth_midas",
    "depth_zoe",
    "depth",
    "depth_leres",
    "depth_leres++",
  ],
  "controlnet-openpose-sdxl-1.0": [
    "openpose",
    "openpose_face",
    "openpose_faceonly",
    "openpose_full",
    "openpose_hand",
    "dwpose",
  ],
  "controlnet-softedge-sdxl-1.0": [
    "softedge_hed",
    "softedge_hedsafe",
    "softedge_pidinet",
    "softedge_pidsafe",
  ],
};
const controlnetModels_sd15 = [
  "control_v11e_sd15_ip2p",
  "control_v11e_sd15_shuffle",
  "control_v11f1e_sd15_tile",
  "control_v11f1p_sd15_depth",
  "control_v11p_sd15_canny",
  "control_v11p_sd15_inpaint",
  "control_v11p_sd15_lineart",
  "control_v11p_sd15_mlsd",
  "control_v11p_sd15_normalbae",
  "control_v11p_sd15_openpose",
  "control_v11p_sd15_scribble",
  "control_v11p_sd15_seg",
  "control_v11p_sd15_softedge",
  "control_v11p_sd15s2_lineart_anime",
  "control_v1p_sd15_brightness",
  "control_v1p_sd15_qrcode_monster",
  "control_v1p_sd15_qrcode_monster_v2",
].filter((m) => modelPreprocessorMap[m] !== undefined);
const controlnetModels_sdxl = [
  "controlnet-canny-sdxl-1.0",
  "controlnet-depth-sdxl-1.0",
  "controlnet-openpose-sdxl-1.0",
  "controlnet-softedge-sdxl-1.0",
].filter((m) => modelPreprocessorMap[m] !== undefined);
function getDefaultCtrlnetModel(baseModel: string) {
  if (baseModel.includes("SDXL")) {
    return controlnetModels_sdxl[0];
  }
  return controlnetModels_sd15[0];
}
function getDefaultPreprocessor(baseModel: string) {
  const model = getDefaultCtrlnetModel(baseModel);
  return modelPreprocessorMap[model][0];
}
const ControlnetFormItem = ({
  param,
  onFocus,
  onChange,
  onBlur,
  baseModel,
}: ControlnetFormItemProps) => {
  const guidanceSlider = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<string>(getDefaultCtrlnetModel(baseModel));
  const [modelList, setModelList] = useState<string[]>(
    baseModel.includes("SDXL") ? controlnetModels_sdxl : controlnetModels_sd15,
  );
  const [imageBase64, setImageBase64] = useState<string>(
    param?.imageBase64 || "",
  );
  const [strength, setStrength] = useState<number>(param?.strength || 0.7);
  const [preprocessorList, setPreprocessorList] = useState<string[]>(
    modelPreprocessorMap[getDefaultCtrlnetModel(baseModel)],
  );
  const [preprocessor, setPreprocessor] = useState<string>(
    param?.preprocessor || getDefaultPreprocessor(baseModel),
  );
  const [guidanceStart, setGuidanceStart] = useState<number>(
    param?.guidanceStart || 0,
  );
  const [guidanceEnd, setGuidanceEnd] = useState<number>(
    param?.guidanceEnd || 1,
  );
  useEffect(() => {
    onChange({
      modelName: model,
      imageBase64,
      strength,
      preprocessor,
      guidanceStart,
      guidanceEnd,
    });
  }, [
    guidanceEnd,
    guidanceStart,
    imageBase64,
    model,
    onChange,
    preprocessor,
    strength,
  ]);
  useEffect(() => {
    onChange({
      modelName: model,
      imageBase64,
      strength,
      preprocessor,
      guidanceStart,
      guidanceEnd,
    });
  }, [
    model,
    imageBase64,
    strength,
    preprocessor,
    guidanceStart,
    guidanceEnd,
    onChange,
  ]);
  useEffect(() => {
    let mList = controlnetModels_sd15;
    if (baseModel.includes("SDXL")) {
      mList = controlnetModels_sdxl;
    }
    setModelList(mList);
    // setModel(mList[0]);
    setPreprocessorList(modelPreprocessorMap[mList[0]]);
    // setPreprocessor(modelPreprocessorMap[mList[0]][0]);
  }, [baseModel]);
  const handleImageChange = useCallback(
    (value: string) => {
      const newValue = value === null ? imageBase64 : value;
      setImageBase64(newValue);
    },
    [imageBase64],
  );
  return (
    <div className={styles.controlnet_form_item}>
      <div className={styles.form_item}>
        <label className={styles.title}>{"Model"}</label>
        <Select
          value={model}
          options={modelList.map((s) => ({
            label: s,
            value: s,
          }))}
          onChange={(value) => {
            if (modelPreprocessorMap[value] === undefined) {
              return;
            }
            setPreprocessorList(modelPreprocessorMap[value]);
            setPreprocessor(modelPreprocessorMap[value][0]);
            setModel(value);
          }}
        />
      </div>
      <div className={styles.form_item}>
        <label className={styles.title}>{"Image"}</label>
        <Dragger
          onUpload={handleImageChange}
          curValue={imageBase64 as string}
          draggerStyle={{
            flex: 1,
            width: 200,
            height: 200,
          }}
        />
      </div>
      <div className={styles.form_item}>
        <label>{"Strength"}</label>
        <div className={styles.slider_wrap}>
          <Slider
            className={styles.slider}
            min={0}
            max={1}
            step={0.01}
            onChange={(value) => {
              setStrength(value);
            }}
            value={strength}
          />
          <NumberInput
            className={styles.slider_input}
            min={0}
            max={1}
            value={strength}
            onChange={(value) => {
              if (value) {
                setStrength(value);
              }
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            controls={false}
          />
        </div>
      </div>
      <div className={styles.form_item}>
        <label className={styles.title}>{"Preprocessor"}</label>
        <Select
          value={preprocessor}
          options={preprocessorList.map((s) => ({
            label: s,
            value: s,
          }))}
          onChange={(value) => setPreprocessor(value)}
        />
      </div>
      <div className={styles.form_item} ref={guidanceSlider}>
        <label style={{ marginBottom: 40 }}>{"Guidance"}</label>
        <Slider
          className={styles.slider}
          range
          min={0}
          max={1}
          step={0.01}
          onChange={(values) => {
            setGuidanceStart(values[0]);
            setGuidanceEnd(values[1]);
          }}
          value={[guidanceStart, guidanceEnd]}
          tooltip={{
            open: true,
            autoAdjustOverflow: false,
            // placement: "bottom",
            placement: "top",
            getPopupContainer: () => guidanceSlider.current || document.body,
            prefixCls: "guidance_range_slider_tooltip",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "var(--dark1)",
          }}
        >
          <span>{"start"}</span>
          <span>{"end"}</span>
        </div>
      </div>
    </div>
  );
};
type ControlnetFormProps = {
  params: (ControlnetUnitParams & {
    id?: string;
  })[];
  loading?: boolean;
  disabled?: boolean;
  onFocus: () => void;
  onChange: (params: ControlnetUnitParams[]) => void;
  onBlur: () => void;
  baseModel: string;
};
function genId(): string {
  return Math.random().toString(36).substring(2, 10);
}
export default function ControlnetForm({
  onFocus,
  onChange,
  onBlur,
  params,
  loading,
  disabled,
  baseModel,
}: ControlnetFormProps) {
  const [controlnetParams, setControlnetParams] = useState<
    (ControlnetUnitParams & {
      id: string;
    })[]
  >([]);
  useEffect(() => {
    if (Array.isArray(params) && params.length > 0) {
      setControlnetParams(
        params.map((p) => {
          return { id: p.id || genId(), ...p };
        }),
      );
    } else {
      setControlnetParams([]);
    }
  }, [params]);
  useEffect(() => {
    if (!baseModel.includes("SDXL")) {
      setControlnetParams((p) => {
        return p.filter((item) =>
          controlnetModels_sd15.includes(item.modelName),
        );
      });
    }
  }, [baseModel]);
  return (
    <div className={`${styles.controlnet_form} ${styles.form_item}`}>
      <label className={styles.title}>ControlNet</label>
      {controlnetParams.map((p, idx) => (
        <div key={p.id} className={styles.controlnet_form_item_wrapper}>
          {loading && <div className={styles.form_loading}></div>}
          <ControlnetFormItem
            itemKey={p.id}
            param={p}
            onFocus={onFocus}
            baseModel={baseModel}
            onChange={(p: ControlnetUnitParams) => {
              const newP = controlnetParams;
              const oldP = controlnetParams[idx];
              newP[idx] = {
                id: oldP?.id || genId(),
                ...p,
              };
              setControlnetParams(newP);
              onChange(newP);
            }}
            onBlur={onBlur}
          />
          {controlnetParams.length >= 1 && (
            <span
              className={styles.form_item_close}
              onClick={() => {
                const newP = controlnetParams
                  .slice(0, idx)
                  .concat(controlnetParams.slice(idx + 1));
                setControlnetParams(newP);
                onChange(newP);
              }}
            >
              <DeleteOutlined />
            </span>
          )}
        </div>
      ))}
      {controlnetParams.length <= 5 && (
        <div
          className={`${styles.form_item_add} ${loading || disabled ? styles.disabled : ""}`}
          onClick={() => {
            if (loading || disabled) {
              return;
            }
            const newP = controlnetParams.concat([
              {
                id: genId(),
                modelName: getDefaultCtrlnetModel(baseModel),
                imageBase64: "",
                strength: 0.7,
                preprocessor: getDefaultPreprocessor(baseModel),
                guidanceStart: 0,
                guidanceEnd: 1,
              },
            ]);
            setControlnetParams(newP);
            onChange(newP);
          }}
        >
          <PlusOutlined />
          <span>{"Add ControlNet Unit"}</span>
        </div>
      )}
    </div>
  );
}
