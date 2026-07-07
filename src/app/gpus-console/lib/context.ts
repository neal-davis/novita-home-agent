import { createContext, Dispatch, SetStateAction } from "react";
import { FuncList } from "./funcs";
import { FUNC_NAME } from "@/app/gpus-console/constants/funcs";

export const KeyContext = createContext<{
  params: { [key: string]: any };
  activeCodeLine: number[];
  setActiveCodeLine: Dispatch<SetStateAction<number[]>>;
  setParams: Dispatch<SetStateAction<{ [key: string]: any }>>;
  allFuncs: FuncList;
  allFuncsNew: any;
  func: string;
  setFunc: Dispatch<SetStateAction<string>>;
}>({
  params: {
    width: 512,
    height: 512,
    prompt: "",
    negative_prompt: "",
    batch_size: 4,
    cfg_scale: 7,
    steps: 20,
    sampler_name: "",
  },
  setParams: () => {},
  activeCodeLine: [],
  setActiveCodeLine: () => {},
  allFuncs: [],
  allFuncsNew: [],
  func: FUNC_NAME.TXT2IMG,
  setFunc: () => {},
});
