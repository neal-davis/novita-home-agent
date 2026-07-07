import { useState } from "react";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import Switcher from "../../../input/Switcher/Switcher";
import baseStyles from "../../base.module.scss";
import PromptInput from "../../../input/PromptInput/PromptInput";
import Dragger from "@/app/components/dragger/Dragger";
import styles from "../index.module.scss";
interface FormContentProps {
  useCases: any[];
  curCase: number;
  setCurCase: (index: number) => void;
  generating: boolean;
  queueing: boolean;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  duration: number;
  setDuration: (duration: number) => void;
  resolution: string;
  setResolution: (resolution: string) => void;
  enablePromptExpansion: boolean;
  setEnablePromptExpansion: (enablePromptExpansion: boolean) => void;
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
  imageUrl,
  setImageUrl,
  prompt,
  setPrompt,
  duration,
  setDuration,
  resolution,
  setResolution,
  enablePromptExpansion,
  setEnablePromptExpansion,
  onParamFocus,
  onParamBlur,
  onParamChange,
}: FormContentProps) {
  const [enableImageUpload, setEnableImageUpload] = useState(true);
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
        <Switcher
          label="Enable image upload"
          disabled={generating}
          value={enableImageUpload}
          onChange={(val) => {
            setEnableImageUpload(val);
            if (!val) {
              setImageUrl("");
              onParamChange?.("image_url", "");
            }
          }}
          onFocus={() => {
            onParamFocus?.("image_url");
          }}
          onBlur={() => {
            onParamBlur?.("image_url");
          }}
        />
        <Dragger
          disabled={generating}
          onUpload={(url: string) => {
            setImageUrl(url || "");
            onParamChange?.("image_url", url || "");
          }}
          curValue={imageUrl}
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
        <label>Duration</label>
        <Select
          disabled={generating || queueing}
          className={styles.model_selector}
          options={[
            { label: "6s", value: 6 },
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
        <label>Resolution</label>
        <Select
          disabled={generating || queueing}
          className={styles.model_selector}
          options={
            duration === 6
              ? [
                  { label: "768P", value: "768P" },
                  { label: "1080P", value: "1080P" },
                ]
              : [{ label: "768P", value: "768P" }]
          }
          value={resolution}
          onFocus={() => {
            onParamFocus?.("resolution");
          }}
          onBlur={() => {
            onParamBlur?.("resolution");
          }}
          onChange={(value) => {
            setResolution(value);
            onParamChange?.("resolution", value);
          }}
        />
      </div>
      <div className={baseStyles.form_item}>
        <Switcher
          label="Enable prompt expansion"
          disabled={generating}
          value={enablePromptExpansion}
          onChange={(val) => {
            setEnablePromptExpansion(val);
            onParamChange?.("enable_prompt_expansion", val);
          }}
          onFocus={() => {
            onParamFocus?.("enable_prompt_expansion");
          }}
          onBlur={() => {
            onParamBlur?.("enable_prompt_expansion");
          }}
        />
      </div>
    </>
  );
}
