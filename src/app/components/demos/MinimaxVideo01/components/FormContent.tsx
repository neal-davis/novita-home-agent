import { useState } from "react";
import Switcher from "../../../input/Switcher/Switcher";
import baseStyles from "../../base.module.scss";
import PromptInput from "../../../input/PromptInput/PromptInput";
import Dragger from "@/app/components/dragger/Dragger";
interface FormContentProps {
  useCases: any[];
  curCase: number;
  setCurCase: (index: number) => void;
  generating: boolean;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
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
  imageUrl,
  setImageUrl,
  prompt,
  setPrompt,
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
