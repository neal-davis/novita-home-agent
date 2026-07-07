import { useCallback } from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import styles from "../index.module.scss";
import baseStyles from "../../base.module.scss";
import Dragger from "@/app/components/dragger/Dragger";
import PromptInput from "../../../input/PromptInput/PromptInput";
const RESOLUTION_OPTIONS = [
  { label: "720P", value: "720P" },
  { label: "1080P", value: "1080P" },
];
const DURATION_OPTIONS = [
  { label: "5s", value: 5 },
  { label: "10s", value: 10 },
  { label: "15s", value: 15 },
];
interface FormContentProps {
  useCases: any[];
  curCase: number;
  setCurCase: (index: number) => void;
  generating: boolean;
  queueing: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
  imgUrl: string;
  setImgUrl: (imgUrl: string) => void;
  resolution: string;
  setResolution: (resolution: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  seed: number | undefined;
  setSeed: (seed: number | undefined) => void;
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
  prompt,
  setPrompt,
  imgUrl,
  setImgUrl,
  resolution,
  setResolution,
  duration,
  setDuration,
  seed,
  setSeed,
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
      <Dragger
        disabled={generating}
        onUpload={(url: string) => {
          setImgUrl(url || "");
          onParamChange?.("img_url", url || "");
        }}
        curValue={imgUrl}
      />
      <div className={baseStyles.form_item}>
        <label>{"Resolution"}</label>
        <Select
          disabled={generating || queueing}
          value={resolution}
          options={RESOLUTION_OPTIONS}
          onChange={(value) => {
            setResolution(value);
            onParamChange?.("resolution", value);
          }}
          onFocus={() => {
            onParamFocus?.("resolution");
          }}
          onBlur={() => {
            onParamBlur?.("resolution");
          }}
        />
      </div>
      <div className={baseStyles.form_item}>
        <label>Duration</label>
        <Select
          disabled={generating || queueing}
          value={duration}
          options={DURATION_OPTIONS}
          onChange={(value) => {
            setDuration(value);
            onParamChange?.("duration", value);
          }}
          onFocus={() => {
            onParamFocus?.("duration");
          }}
          onBlur={() => {
            onParamBlur?.("duration");
          }}
        />
      </div>
      <div className={baseStyles.form_item}>
        <label>{"Seed"}</label>
        <NumberInput
          disabled={generating || queueing}
          className={baseStyles.input}
          min={0}
          max={2147483647}
          value={seed}
          placeholder="Leave blank for random"
          onChange={(value) => {
            setSeed(value ?? undefined);
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
