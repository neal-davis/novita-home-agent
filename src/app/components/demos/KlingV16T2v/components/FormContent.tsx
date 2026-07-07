import { SelectItems as Select } from "@/components/ui/standard/select-items";
import styles from "../index.module.scss";
import baseStyles from "../../base.module.scss";
import PromptInput from "../../../input/PromptInput/PromptInput";
import { FormItem } from "@/app/models/image/components/FormItem/FormItem";
import { WIDGET_TYPE, type WidgetProps } from "@/app/models/lib/widgets";
const MODES = ["Standard"];
const guidanceScaleWidget: WidgetProps = {
  label: "Guidance Scale",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "guidance_scale",
  defaultValue: 0.5,
  numberProps: {
    min: 0,
    max: 1,
    step: 0.1,
  },
};
interface FormContentProps {
  useCases: any[];
  curCase: number;
  setCurCase: (index: number) => void;
  generating: boolean;
  queueing: boolean;
  mode: string;
  setMode: (mode: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (negativePrompt: string) => void;
  guidanceScale: number;
  setGuidanceScale: (guidanceScale: number) => void;
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
  mode,
  setMode,
  duration,
  setDuration,
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  guidanceScale,
  setGuidanceScale,
  onParamFocus,
  onParamBlur,
  onParamChange,
}: FormContentProps) {
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
          options={MODES.map((m) => ({
            label: m,
            value: m,
          }))}
          value={mode}
          onFocus={() => {
            onParamFocus?.("mode");
          }}
          onBlur={() => {
            onParamBlur?.("mode");
          }}
          onChange={(value) => {
            setMode(value);
            onParamChange?.("mode", value);
          }}
        />
      </div>
      <div className={baseStyles.form_item}>
        <label>Duration</label>
        <Select
          disabled={generating || queueing}
          className={styles.model_selector}
          options={[
            { label: "5s", value: 5 },
            { label: "10s", value: 10 },
          ]}
          value={duration}
          onFocus={() => {
            onParamFocus?.("duration");
          }}
          onBlur={() => {
            onParamBlur?.("duration");
          }}
          onChange={(value) => {
            setDuration(value);
            onParamChange?.("duration", value);
          }}
        />
      </div>
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
        <label>{"Negative Prompt"}</label>
        <PromptInput
          value={negativePrompt}
          setValue={setNegativePrompt}
          maxLine={4}
          onChange={(val) => {
            onParamChange?.("negative_prompt", val);
          }}
          onFocus={() => {
            onParamFocus?.("negative_prompt");
          }}
          onBlur={() => {
            onParamBlur?.("negative_prompt");
          }}
        />
      </div>
      <div className={baseStyles.form_item}>
        <FormItem
          widgetProps={guidanceScaleWidget}
          fieldProps={{
            disabled: generating,
          }}
          value={guidanceScale}
          onChange={(val) => {
            const nextValue = Number(val);
            setGuidanceScale(nextValue);
            onParamChange?.("guidance_scale", nextValue);
          }}
          onFocus={() => {
            onParamFocus?.("guidance_scale");
          }}
          onBlur={() => {
            onParamBlur?.("guidance_scale");
          }}
        />
      </div>
    </>
  );
}
