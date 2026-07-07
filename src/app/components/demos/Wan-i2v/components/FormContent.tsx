import { useCallback } from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import styles from "../index.module.scss";
import baseStyles from "../../base.module.scss";
import Dragger from "@/app/components/dragger/Dragger";
import PromptInput from "../../../input/PromptInput/PromptInput";
import { getNewTxt2videoResolutionOptions } from "@/app/pricing/components/CalculatorModal";
const MODELS = ["wan2.1-i2v"];
interface FormContentProps {
  useCases: any[];
  curCase: number;
  setCurCase: (index: number) => void;
  generating: boolean;
  queueing: boolean;
  model: string;
  setModel: (model: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  setHeight: (height: number) => void;
  seed: number;
  setSeed: (seed: number) => void;
  onParamFocus?: (param: string) => void;
  onParamBlur?: (param: string) => void;
  onParamChange?: (param: string, value: any) => void;
}
export default function FormContent({
  useCases,
  curCase,
  setCurCase,
  generating,
  queueing,
  model,
  setModel,
  prompt,
  setPrompt,
  imageUrl,
  setImageUrl,
  width,
  setWidth,
  height,
  setHeight,
  seed,
  setSeed,
  onParamFocus,
  onParamBlur,
  onParamChange,
}: FormContentProps) {
  const updateVideoDimensions = useCallback(
    (width: number, height: number) => {
      setWidth(width);
      setHeight(height);
      onParamChange?.("width", width);
      onParamChange?.("height", height);
    },
    [setWidth, setHeight, onParamChange],
  );
  return (
    <>
      <div className={baseStyles.showcase_box}>
        <label className={baseStyles.cases_title}>{"Showcase"}</label>
        <div className={baseStyles.cases_wrapper}>
          {useCases.map((item, index) => (
            <div
              key={index}
              className={`
                ${baseStyles.case_item}
                ${curCase === index ? baseStyles.case_item_active : ""}
                ${generating ? baseStyles.case_item_disabled : ""}
                ${baseStyles.case_item_text}
              `}
              onClick={() => {
                if (generating) {
                  return;
                }
                setCurCase(index);
                setPrompt(item.prompt);
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      <div className={baseStyles.form_item}>
        <label>{"Model"}</label>
        <Select
          disabled={generating || queueing}
          className={styles.model_selector}
          options={MODELS.map((m) => ({
            label: m,
            value: m,
          }))}
          value={model}
          onFocus={() => {
            onParamFocus?.("model_name");
          }}
          onBlur={() => {
            onParamBlur?.("model_name");
          }}
          onChange={(value) => {
            setModel(value);
            onParamChange?.("model_name", value);
          }}
        />
      </div>
      <Dragger
        disabled={generating}
        onUpload={(url: string) => {
          setImageUrl(url || "");
          onParamChange?.("image_url", url || "");
        }}
        curValue={imageUrl}
      />
      <div className={baseStyles.form_item}>
        <label>{"Prompt"}</label>
        <PromptInput
          value={prompt}
          setValue={setPrompt}
          maxLine={4}
          onChange={(val) => {
            onParamChange?.("prompt", val);
          }}
          onFocus={() => {
            onParamFocus?.("prompt");
          }}
          onBlur={() => {
            onParamBlur?.("prompt");
          }}
        />
      </div>
      <div className={baseStyles.form_item}>
        <label>Width * Height</label>
        <Select
          value={(() => {
            const currentValue = `${width}*${height}`;
            const options = getNewTxt2videoResolutionOptions(model);
            if (!options.some((opt) => opt.value === currentValue)) {
              const [defaultWidth, defaultHeight] = options[0].value.split("*");
              updateVideoDimensions(
                parseInt(defaultWidth),
                parseInt(defaultHeight),
              );
              return options[0].value;
            }
            return currentValue;
          })()}
          options={getNewTxt2videoResolutionOptions(model)}
          onChange={(value) => {
            const [width, height] = value.split("*");
            updateVideoDimensions(parseInt(width), parseInt(height));
          }}
        />
      </div>
      <div className={baseStyles.form_item}>
        <label>{"Seed"}:</label>
        <NumberInput
          disabled={generating || queueing}
          className={baseStyles.input}
          min={-1}
          value={seed}
          onChange={(value) => {
            setSeed(value || -1);
            onParamChange?.("seed", value);
          }}
          onFocus={() => {
            onParamFocus?.("seed");
          }}
          onBlur={() => {
            onParamBlur?.("seed");
          }}
          controls={false}
        />
      </div>
    </>
  );
}
