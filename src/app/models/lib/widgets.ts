import { DOMAttributes, InputHTMLAttributes } from "react";
import { SAMPLER_OPTIONS } from "@/app/models/constants/funcs";
const modelApiPlaygroundFormSamplerTips = [
  'A specific algorithm used by AI for image generation.\nIt is recommended to use algorithms marked\nwith a "+" sign because they are more stable.\nCommon options include DPM++2S by Karras, Euler a,\nand DPM++ 2M by Karras.',
  "If the model's authors recommend specific algorithms,\nit's advisable to follow their suggestions.",
];
const modelApiPlaygroundFormStepsTips = [
  "More Steps, Finer Details. After 20, Limited Improvement",
];
const modelApiPlaygroundFormGuidanceScaleTips = [
  "Degree of Prompt Adherence: Higher numbers indicate greater fidelity to the provided prompts, limiting AI's creative freedom.",
  "Recommended Range: 7~12",
];
const modelApiPlaygroundFormSeedTips = [
  "Controlling the seed allows for reproducible image generation, parameter experimentation, and prompting variations.",
  "Recommended Range: -1 to ∞",
  "A seed value of -1 indicates randomness. By selecting a fixed value within the range of 0 to ∞, you can maintain basic consistency across multiple image generations, with only minor variations in detail.",
];
export enum WIDGET_TYPE {
  PLAIN = "plain",
  TEXT = "text",
  NUMBER = "number",
  IMAGE = "image",
  SELECTOR = "selector",
  SLIDER = "slider",
  MODEL_SELECTOR = "model_selector",
  GROUP = "group",
}
export type WidgetValue =
  | string
  | number
  | string[]
  | number[]
  | {
      [key: string]: any;
    }
  | {
      [key: string]: any;
    }[];
export type WidgetGroupValue = {
  [key: string]: string | number;
};
export type WidgetProps = {
  label: string;
  type: WIDGET_TYPE;
  description?: string;
  isArray?: boolean;
  paramsKey: string;
  defaultValue: WidgetValue;
  placeholder?: string;
  numberProps?: {
    min?: number;
    max?: number;
    step?: number;
  };
  selectorOptions?: {
    label: string;
    value: string;
  }[];
  children?: WidgetProps[];
  fieldProps?: InputHTMLAttributes<HTMLInputElement> &
    DOMAttributes<HTMLInputElement>;
  modelCover?: string;
  tips?: string[];
  closable?: boolean;
  nilValue?: WidgetValue;
};
export const modelWidget = (): WidgetProps => ({
  label: "Model",
  type: WIDGET_TYPE.TEXT,
  paramsKey: "model_name",
  defaultValue: "",
});
export const loraModelWidget = (): WidgetProps => ({
  label: "Lora Model",
  type: WIDGET_TYPE.MODEL_SELECTOR,
  paramsKey: "lora_model",
  defaultValue: "",
});
export const loraWeightWidget = (): WidgetProps => ({
  label: "Lora Weight",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "lora_weight",
  defaultValue: 1,
  numberProps: {
    min: 0,
    max: 1,
    step: 0.1,
  },
});
export const loraWidget = (): WidgetProps => ({
  label: "LoRA",
  type: WIDGET_TYPE.GROUP,
  paramsKey: "lora",
  defaultValue: { lora_model: "", lora_weight: 0 },
  children: [loraModelWidget(), loraWeightWidget()],
});
export const promptWidget = (): WidgetProps => ({
  label: "Prompt",
  type: WIDGET_TYPE.TEXT,
  description: "Enter your prompt here",
  paramsKey: "prompt",
  defaultValue: "",
  placeholder: "Description of what you want to generate...",
});
export const nPromptWidget = (): WidgetProps => ({
  label: "Negative Prompt",
  type: WIDGET_TYPE.TEXT,
  description: "Negative prompt",
  paramsKey: "negative_prompt",
  defaultValue: "",
  placeholder: "What you want to avoid generating...",
});
export const widthWidget = (): WidgetProps => ({
  label: "Width (256~2048)",
  type: WIDGET_TYPE.NUMBER,
  paramsKey: "width",
  defaultValue: 512,
  numberProps: {
    min: 256,
    max: 2048,
    step: 1,
  },
});
export const heightWidget = (): WidgetProps => ({
  label: "Height (256~2048)",
  type: WIDGET_TYPE.NUMBER,
  paramsKey: "height",
  defaultValue: 512,
  numberProps: {
    min: 256,
    max: 2048,
    step: 1,
  },
});
export const samplerWidget = (): WidgetProps => ({
  label: "Sampler",
  type: WIDGET_TYPE.SELECTOR,
  paramsKey: "sampler_name",
  defaultValue: "DPM++ 2S a Karras",
  selectorOptions: SAMPLER_OPTIONS.map((s) => ({ label: s, value: s })),
  tips: modelApiPlaygroundFormSamplerTips,
});
export const stepsWidget = (): WidgetProps => ({
  label: "Steps",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "steps",
  defaultValue: 20,
  numberProps: {
    min: 20,
    max: 50,
    step: 1,
  },
  tips: modelApiPlaygroundFormStepsTips,
});
export const batchSizeWidget = (): WidgetProps => ({
  label: "Image Num",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "batch_size",
  defaultValue: 4,
  numberProps: {
    min: 1,
    max: 4,
    step: 1,
  },
});
export const guidanceScaleWidget = (): WidgetProps => ({
  label: "Guidance Scale",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "guidance_scale",
  defaultValue: 7.5,
  numberProps: {
    min: 1,
    max: 30,
    step: 0.1,
  },
  tips: modelApiPlaygroundFormGuidanceScaleTips,
});
export const imageNumWidget = (): WidgetProps => ({
  label: "Image Num",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "batch_size",
  defaultValue: 4,
  numberProps: {
    min: 1,
    max: 8,
    step: 1,
  },
});
export const clipSkipWidget = (): WidgetProps => ({
  label: "Clip Skip",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "clip_skip",
  defaultValue: 0,
  numberProps: {
    min: 1,
    max: 12,
    step: 1,
  },
  closable: true,
  nilValue: 0,
});
export const strengthWidget = (): WidgetProps => ({
  label: "Strength",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "strength",
  defaultValue: 0.7,
  numberProps: {
    min: 0,
    max: 1,
    step: 0.1,
  },
});
export const seedWidget = (): WidgetProps => ({
  label: "Seed",
  type: WIDGET_TYPE.NUMBER,
  paramsKey: "seed",
  defaultValue: -1,
  numberProps: {
    min: -1,
  },
  tips: modelApiPlaygroundFormSeedTips,
});
export const imageWidget = (multiple = false): WidgetProps => ({
  label: "Initial Image",
  type: WIDGET_TYPE.IMAGE,
  description: "upload image",
  isArray: true,
  paramsKey: "init_images",
  defaultValue: "",
  placeholder: "Description of what you want to generate...",
  fieldProps: { multiple },
});
