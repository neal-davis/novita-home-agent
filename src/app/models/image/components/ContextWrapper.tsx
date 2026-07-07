"use client";

import { useCallback, useEffect, useState } from "react";
import { CODE_LANG } from "../sample-codes/code";
import { FuncList, getFuncs } from "../../lib/funcs";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { KeyContext } from "../../lib/context";

const defaultParams = {
  model_name: "",
  width: 512,
  height: 512,
  prompt: "",
  negative_prompt: "",
  batch_size: 4,
  cfg_scale: 7.5,
  steps: 20,
  sampler_name: "DPM++ 2S a Karras",
  init_images: [],
  n_iter: 1,
  seed: -1,
  image_num: 4,
  clip_skip: 1,
  guidance_scale: 7.5,
  strength: 0.7,
};

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const [activeCodeLine, setActiveCodeLine] = useState<number[]>([]);
  const [params, setParams] = useState<{ [key: string]: any }>(defaultParams);
  const [codeType, setCodeType] = useState<CODE_LANG | string>(
    CODE_LANG.JAVASCRIPT,
  );
  const [func, setFunc] = useState<string>("");
  const [allFuncs, setAllFuncs] = useState<FuncList>([]);

  const clearParams = () => {
    setParams(defaultParams);
    return new Promise((resolve) => {
      // TODO: execute callback after params change
      setTimeout(() => {
        resolve(true);
      }, 50);
    });
  };

  const handleSetParams = useCallback((cb: any) => {
    if (typeof cb === "object") {
      return setParams((v) => ({
        ...v,
        ...cb,
      }));
    }
    if (typeof cb === "function") {
      return setParams(cb);
    }
    console.error("setParams error@ ", cb);
  }, []);

  useEffect(() => {
    const f = window.location.hash
      ? window.location.hash.replace("#", "").split("?")[0]
      : FUNC_NAME.TXT2IMG;
    console.log("hash from location", f, window.location.hash);
    setFunc(f);

    getFuncs().then((funcs: FuncList) => {
      setAllFuncs(funcs);
    });
  }, []);

  return (
    <KeyContext.Provider
      value={{
        params,
        setParams: handleSetParams,
        activeCodeLine,
        setActiveCodeLine,
        clearParams,
        codeType,
        setCodeType,
        allFuncs,
        func,
        setFunc,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
}
