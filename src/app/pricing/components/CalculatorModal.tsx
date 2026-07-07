import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import Modal from "@/app/components/Modal/Modal";
import {
  FUNC_NAME,
  FUNC_TYPE,
  FUNC_DISPLAY_NAME,
} from "@/app/models/constants/funcs";
import {
  getDefaultParmas,
  CALC_CATEGORY_MAP,
  calcPrice,
} from "@/lib/utils/pricing";
import styles from "./CalculatorModal.module.scss";
import { funcFilter } from "@/app/models/lib/funcs";
import FUNCS from "@/app/models/constants/funcs";
type IProps = {
  calcFunc: FUNC_NAME | string | null;
  copy?: unknown;
  onFuncChange: Dispatch<SetStateAction<FUNC_NAME | null>>;
  onClose: () => void;
};
type ICalcParams = {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  steps?: number;
  minSteps?: number;
  maxSteps?: number;
  scale?: number;
  minScale?: number;
  maxScale?: number;
  frames?: number;
  minFrames?: number;
  maxFrames?: number;
  model?: string;
  resolutionType?: string;
  fps?: number;
  duration?: number;
  mode?: string;
};
export const getNewTxt2videoResolutionOptions = (
  model: string,
  mode?: string,
) => {
  const modelMap = {
    "hunyuan-video-fast": [
      { value: "720*1280", label: "720*1280" },
      { value: "1280*720", label: "1280*720" },
    ],
    "wan2.1-t2v": [
      { value: "720*1280", label: "720*1280" },
      { value: "1280*720", label: "1280*720" },
      { value: "832*480", label: "832*480" },
      { value: "480*832", label: "480*832" },
    ],
    "wan2.1-i2v": [
      { value: "720*1280", label: "720*1280" },
      { value: "1280*720", label: "1280*720" },
      { value: "832*480", label: "832*480" },
      { value: "480*832", label: "480*832" },
    ],
    "minimax-video-01": [{ value: "720P", label: "720P" }],
    "minimax-hailuo-02": [
      { value: "768P", label: "768P" },
      { value: "1080P", label: "1080P" },
    ],
  };
  const modeMap = {
    Standard: [{ value: "720P", label: "720P" }],
    Professional: [{ value: "1080P", label: "1080P" }],
  };
  return (
    modelMap[model as keyof typeof modelMap] ||
    modeMap[mode as keyof typeof modeMap] ||
    []
  );
};
const getDurationOptions = (calcFunc?: string) => {
  if (["kling-v1.6-i2v", "kling-v1.6-t2v"].includes(calcFunc || "")) {
    return [
      { value: 5, label: "5s" },
      { value: 10, label: "10s" },
    ];
  }
  if (["minimax-video-01"].includes(calcFunc || "")) {
    return [{ value: 6, label: "6s" }];
  }
  if (["minimax-hailuo-02"].includes(calcFunc || "")) {
    return [
      { value: 6, label: "6s" },
      { value: 10, label: "10s" },
    ];
  }
  return [{ value: 5, label: "5s" }];
};
const getModelFromCalcFunc = (calcFunc?: string): string => {
  if (calcFunc?.includes("hunyuan-video-fast")) {
    return "hunyuan-video-fast";
  } else if (calcFunc?.includes("wan-t2v")) {
    return "wan2.1-t2v";
  } else if (calcFunc?.includes("wan-i2v")) {
    return "wan2.1-i2v";
  }
  return calcFunc || "";
};
export default function CalculatorModal({
  copy,
  calcFunc,
  onFuncChange,
  onClose,
}: IProps) {
  const [params, setParmas] = useState<ICalcParams>({});
  useEffect(() => {
    setParmas(getDefaultParmas(calcFunc as FUNC_NAME));
  }, [calcFunc]);
  const apiNameOptions = useMemo(() => {
    return [
      ...CALC_CATEGORY_MAP[FUNC_TYPE.IMG],
      ...CALC_CATEGORY_MAP[FUNC_TYPE.VIDEO_GENERATOR],
      ...CALC_CATEGORY_MAP[FUNC_TYPE.TRAINING],
    ]
      .filter((funcName) => {
        const func = Object.values(FUNCS).find((f) => f.name === funcName);
        if (func) {
          return funcFilter(func, "product");
        }
        return true;
      })
      .map((func) => ({
        value: func,
        label: (FUNC_DISPLAY_NAME as any)[func],
      }));
  }, []);
  const funcType = useMemo(() => {
    const symbols = Object.getOwnPropertySymbols(CALC_CATEGORY_MAP);
    for (const key of symbols) {
      const values = CALC_CATEGORY_MAP[key as any];
      if (values.includes(calcFunc as FUNC_NAME)) {
        return key;
      }
    }
    return null;
  }, [calcFunc]);
  const priceUnit = useMemo(() => {
    switch (funcType) {
      case FUNC_TYPE.IMG:
        return "image";
      case FUNC_TYPE.VIDEO_GENERATOR:
        if (
          calcFunc === "hunyuan-video-fast" ||
          calcFunc === "wan-t2v" ||
          calcFunc === "wan-i2v"
        ) {
          return "video";
        }
        return "video";
      case FUNC_TYPE.TRAINING:
        return "call";
      default:
        return "";
    }
  }, [funcType, calcFunc]);
  const handleParamsChange = useCallback(
    (paramType: string, value: string | number | null) => {
      switch (paramType) {
        case "width":
          setParmas((prevParams) => ({
            ...prevParams,
            width: Number(value || 0),
          }));
          break;
        case "height":
          setParmas((prevParams) => ({
            ...prevParams,
            height: Number(value || 0),
          }));
          break;
        case "steps":
          setParmas((prevParams) => ({
            ...prevParams,
            steps: Number(value || 0),
          }));
          break;
        case "scale":
          setParmas((prevParams) => ({
            ...prevParams,
            scale: Number(value || 0),
          }));
          break;
        case "frames":
          setParmas((prevParams) => ({
            ...prevParams,
            frames: Number(value || 0),
          }));
          break;
        case "mode":
          setParmas((prevParams) => ({
            ...prevParams,
            mode: value as string,
          }));
          break;
        case "model":
          setParmas((prevParams) => ({
            ...prevParams,
            model: value as string,
          }));
          break;
        case "duration":
          setParmas((prevParams) => ({
            ...prevParams,
            duration: Number(value || 0),
          }));
          break;
        case "resolutionType":
          setParmas((prevParams) => ({
            ...prevParams,
            resolutionType: value as string,
          }));
          break;
        default:
          break;
      }
    },
    [],
  );
  return (
    <Modal
      destroyOnClose
      open={Boolean(calcFunc)}
      title={"Pricing Calculator"}
      onCancel={onClose}
      footer={null}
    >
      <div className={styles.calc_modal_content}>
        <p className={styles.item_label}>{"API Name"}</p>
        <Select
          defaultValue={calcFunc as FUNC_NAME}
          onChange={(value) => {
            setParmas({});
            onFuncChange(value as FUNC_NAME);
          }}
          options={apiNameOptions}
        />
        {params.width !== undefined && (
          <>
            <p className={styles.item_label}>{"Width"}</p>
            <NumberInput
              value={params.width}
              min={params.minWidth}
              max={params.maxWidth}
              onChange={(value) => handleParamsChange("width", value)}
            />
          </>
        )}
        {params.height !== undefined && (
          <>
            <p className={styles.item_label}>{"Height"}</p>
            <NumberInput
              value={params.height}
              min={params.minHeight}
              max={params.maxHeight}
              onChange={(value) => handleParamsChange("height", value)}
            />
          </>
        )}
        {params.resolutionType !== undefined && (
          <>
            <p className={styles.item_label}>Resolution</p>
            <Select
              defaultValue={params.resolutionType}
              options={getNewTxt2videoResolutionOptions(
                params.model || getModelFromCalcFunc(calcFunc as string) || "",
                params.mode || "",
              )}
              onChange={(value) => handleParamsChange("resolutionType", value)}
            />
          </>
        )}
        {params.steps !== undefined && (
          <>
            <p className={styles.item_label}>{"Steps"}</p>
            <NumberInput
              value={params.steps}
              min={params.minSteps}
              max={params.maxSteps}
              onChange={(value) => handleParamsChange("steps", value)}
            />
          </>
        )}
        {params.scale !== undefined && (
          <>
            <p className={styles.item_label}>{"Scale"}</p>
            <NumberInput
              value={params.scale}
              min={params.minScale}
              max={params.maxScale}
              onChange={(value) => handleParamsChange("scale", value)}
            />
          </>
        )}
        {params.frames !== undefined && (
          <>
            <p className={styles.item_label}>{"Frames"}</p>
            <NumberInput
              value={params.frames}
              min={params.minFrames}
              max={params.maxFrames}
              onChange={(value) => handleParamsChange("frames", value)}
            />
          </>
        )}
        {params.duration !== undefined && (
          <>
            <p className={styles.item_label}>Duration</p>
            <Select
              defaultValue={params.duration}
              options={getDurationOptions(calcFunc as string)}
              onChange={(value) => handleParamsChange("duration", value)}
            />
          </>
        )}
        {params.mode !== undefined && (
          <>
            <p className={styles.item_label}>Mode</p>
            <Select
              defaultValue={params.mode}
              options={
                calcFunc === "kling-v1.6-i2v"
                  ? [
                      { value: "Standard", label: "Standard" },
                      { value: "Professional", label: "Professional" },
                    ]
                  : [{ value: "Standard", label: "Standard" }]
              }
              onChange={(value) => handleParamsChange("mode", value)}
            />
          </>
        )}
        {params.model !== undefined && (
          <>
            <p className={styles.item_label}>{"Model"}</p>
            <Select
              defaultValue={params.model}
              options={[
                { value: "SVD-XT", label: "SVD-XT" },
                { value: "SVD", label: "SVD" },
              ]}
              onChange={(value) => handleParamsChange("model", value)}
            />
          </>
        )}
        {calcFunc && (
          <div className={styles.price}>
            <span>{`${"Price"}${": "}`}</span>
            <span>
              {`${"$"}${
                calcPrice(calcFunc as FUNC_NAME, {
                  ...params,
                  model: getModelFromCalcFunc(calcFunc),
                }).discountPrice
              }`}
            </span>
            <span>{` /${priceUnit}`}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
