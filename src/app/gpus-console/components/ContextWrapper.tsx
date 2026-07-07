"use client";

import { useEffect, useState } from "react";
import { FuncList, getFuncsNew } from "../lib/funcs";
import { KeyContext } from "../lib/context";
import { getPathnameWithoutLocale } from "@/i18n/config";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const [activeCodeLine, setActiveCodeLine] = useState<number[]>([]);
  const [params, setParams] = useState<{ [key: string]: any }>({
    model_name: "",
    width: 512,
    height: 512,
    prompt: "",
    negative_prompt: "",
    batch_size: 4,
    cfg_scale: 7,
    steps: 20,
    sampler_name: "",
    init_images: [],
    n_iter: 1,
    seed: -1,
  });
  const [func, setFunc] = useState<string>("");
  const [allFuncs] = useState<FuncList>([]);
  const [allFuncsNew, setAllFuncsNew] = useState<FuncList>([]);

  useEffect(() => {
    let f = "explore";
    if (window.location.pathname) {
      const businessPath = getPathnameWithoutLocale(window.location.pathname);
      const segments = businessPath.split("/").filter(Boolean);
      if (segments[0] === "gpus-console" && segments[1]) {
        f = segments[1];
      }
    }
    setFunc(f);

    getFuncsNew().then((funcsNew: any) => {
      setAllFuncsNew(funcsNew);
    });
  }, []);

  return (
    <KeyContext.Provider
      value={{
        params,
        setParams,
        activeCodeLine,
        setActiveCodeLine,
        allFuncs,
        allFuncsNew,
        func,
        setFunc,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
}
