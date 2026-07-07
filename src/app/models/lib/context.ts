import { createContext, Dispatch, SetStateAction } from "react";
import { FuncList } from "./funcs";
import { CODE_LANG } from "../image/sample-codes/code";
import { FUNC_NAME } from "@/app/models/constants/funcs";

export const KeyContext = createContext<{
  codeType: CODE_LANG | string;
  params: { [key: string]: any };
  activeCodeLine: number[];
  setActiveCodeLine: Dispatch<SetStateAction<number[]>>;
  setParams: Dispatch<SetStateAction<{ [key: string]: any }>>;
  clearParams: () => void;
  setCodeType: Dispatch<SetStateAction<CODE_LANG | string>>;
  allFuncs: FuncList;
  func: string;
  setFunc: Dispatch<SetStateAction<string>>;
}>({
  params: {
    init_images: [],
    width: 512,
    height: 512,
    prompt: "",
    negative_prompt: "",
    batch_size: 4,
    cfg_scale: 7,
    steps: 20,
    sampler_name: "",
    image_num: 4,
    clip_skip: 0,
    guidance_scale: 7.5,
    strength: 0.7,
  },
  setParams: () => {},
  clearParams: () => {},
  activeCodeLine: [],
  setActiveCodeLine: () => {},
  codeType: CODE_LANG.JAVASCRIPT,
  setCodeType: () => {},
  allFuncs: [],
  func: FUNC_NAME.TXT2IMG,
  setFunc: () => {},
});
