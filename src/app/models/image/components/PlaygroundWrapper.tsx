"use client";

import { FC, useState, useEffect, useContext, useCallback } from "react";
import { KeyContext } from "../../lib/context";
import { usePathname, useRouter } from "next/navigation";
import { LowBalanceModal } from "@/app/components/modals/Modals";
import { DemoProps } from "@/app/components/demos/DemoWrapper";
import useCancelConfirm from "@/app/components/demos/components/useCancelConfirm";
import { Func } from "../../lib/funcs";
import { NOVITA_URL } from "@/constants/urls";
import { findCodeLine } from "../sample-codes/code";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
export default function PlaygroundWrapper({
  renderCase,
  curFunc,
}: {
  renderCase: FC<DemoProps>;
  curFunc: Func;
}) {
  const { setParams, codeType, setActiveCodeLine } = useContext(KeyContext);

  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
  const [curApiKey, setCurApiKey] = useState("");

  const keys = useSelectKeys();
  const router = useRouter();
  const path = usePathname();
  const { showCancelConfirm, cancelConfirmView } = useCancelConfirm();

  useEffect(() => {
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      setCurApiKey("");
      return;
    }
    if (
      (keys as string[]).length > 0 &&
      (keys as string[]).indexOf(curApiKey) === -1
    ) {
      setCurApiKey(keys[0]);
    }
  }, [keys, curApiKey]);

  const onParamFocus = useCallback(
    (key: string) => {
      if (!curFunc) {
        return;
      }
      const line = findCodeLine(
        curFunc.sampleCode?.find((c) => c.lang === codeType)?.code || "",
        key,
      );
      if (line) {
        setActiveCodeLine((v) => [...v, line]);
      }
    },
    [codeType, curFunc, setActiveCodeLine],
  );

  const onParamBlur = useCallback(
    (key: string) => {
      if (!curFunc) {
        return;
      }
      const line = findCodeLine(
        curFunc.sampleCode?.find((c) => c.lang === codeType)?.code || "",
        key,
      );
      if (line) {
        setActiveCodeLine((v) => v.filter((l) => l !== line));
      }
    },
    [codeType, curFunc, setActiveCodeLine],
  );

  const onParamChange = useCallback(
    (key: string, val: any) => {
      setParams((v) => ({
        ...v,
        [key]: val,
      }));
    },
    [setParams],
  );

  return (
    <>
      <LowBalanceModal
        show={showLowBalanceModal}
        close={() => {
          setShowLowBalanceModal(false);
        }}
      />
      {cancelConfirmView}
      {renderCase({
        apiKey: curApiKey,
        funcInfo: curFunc.info,
        rootPage: "playground",
        onNeedLogin: () => {
          const hash = window.location.hash;
          const redirect = hash ? `${path}${hash}` : path;
          router.push(
            `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(redirect)}`,
          );
        },
        onLowBalance: () => {
          setShowLowBalanceModal(true);
        },
        onParamFocus: onParamFocus,
        onParamBlur: onParamBlur,
        onParamChange: onParamChange,
        showCancelConfirm,
      })}
    </>
  );
}
