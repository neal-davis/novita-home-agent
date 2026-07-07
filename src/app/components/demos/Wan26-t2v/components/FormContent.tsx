import { useMemo } from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import styles from "../index.module.scss";
import baseStyles from "../../base.module.scss";
import Dragger from "@/app/components/dragger/Dragger";
import PromptInput from "../../../input/PromptInput/PromptInput";
// 720P resolution options
const SIZE_OPTIONS_720P = [
  { label: "1280*720 (16:9)", value: "1280*720" },
  { label: "720*1280 (9:16)", value: "720*1280" },
];
// 1080P resolution options
const SIZE_OPTIONS_1080P = [
  { label: "1920*1080 (16:9)", value: "1920*1080" },
  { label: "1080*1920 (9:16)", value: "1080*1920" },
  { label: "1440*1440 (1:1)", value: "1440*1440" },
  { label: "1632*1248 (4:3)", value: "1632*1248" },
  { label: "1248*1632 (3:4)", value: "1248*1632" },
];
// All resolution options (grouped by tier)
const SIZE_OPTIONS = [
  { label: "1080P", options: SIZE_OPTIONS_1080P },
  { label: "720P", options: SIZE_OPTIONS_720P },
];
// Get available duration options based on resolution tier
function getDurationOptions(size: string) {
  return [
    { label: "5s", value: 5 },
    { label: "10s", value: 10 },
    { label: "15s", value: 15 },
  ];
}
interface FormContentProps {
  useCases: any[];
  curCase: number;
  setCurCase: (index: number) => void;
  generating: boolean;
  queueing: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
  size: string;
  setSize: (size: string) => void;
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
  size,
  setSize,
  duration,
  setDuration,
  seed,
  setSeed,
  onParamFocus,
  onParamBlur,
  onParamChange,
}: FormContentProps) {
  const durationOptions = useMemo(() => getDurationOptions(size), [size]);
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
      <div className={baseStyles.form_item}>
        <label>{"Resolution"}</label>
        <Select
          disabled={generating || queueing}
          value={size}
          options={SIZE_OPTIONS}
          onChange={(value) => {
            setSize(value);
            onParamChange?.("size", value);
            // 切换分辨率时，检查当前时长是否可用
            const newDurationOptions = getDurationOptions(value);
            if (!newDurationOptions.some((opt) => opt.value === duration)) {
              setDuration(newDurationOptions[0].value);
              onParamChange?.("duration", newDurationOptions[0].value);
            }
          }}
          onFocus={() => {
            onParamFocus?.("size");
          }}
          onBlur={() => {
            onParamBlur?.("size");
          }}
        />
      </div>
      <div className={baseStyles.form_item}>
        <label>Duration</label>
        <Select
          disabled={generating || queueing}
          value={duration}
          options={durationOptions}
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
