"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { KeyContext } from "../lib/context";
import { useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";

export default function PlaygroundWrapper({
  renderCase,
  curFunc,
}: {
  renderCase: any;
  curFunc: any;
}) {
  const { setParams, setActiveCodeLine } = useContext(KeyContext);

  const [curApiKey, setCurApiKey] = useState("");

  const keys = useSelectKeys();
  const userState = useAppSelector((state) => state.user.state);

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

  useEffect(() => {
    if (userState === UserState.logout) {
      // setShowLoginModal(true);
    } else {
      // setShowLoginModal(false);
    }
  }, [userState]);

  // useEffect(() => {
  //   localforage
  //     .getItem(AGREE_TERMS_LS_KEY)
  //     .then((val) => {
  //       if (val === 1) {
  //         setShowTermsModal(false);
  //       } else {
  //         setShowTermsModal(true);
  //       }
  //     })
  //     .catch(() => {
  //       setShowTermsModal(true);
  //     });
  // }, []);

  const onParamFocus = useCallback(
    (key: string) => {
      if (!curFunc) {
        return;
      }
    },
    [curFunc],
  );

  const onParamBlur = useCallback(
    (key: string) => {
      if (!curFunc) {
        return;
      }
    },
    [curFunc],
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
      {renderCase({
        apiKey: curApiKey,
        funcInfo: curFunc.info,
        rootPage: "playground",
        onNeedLogin: () => {
          // setShowNeedLoginModal(true);
        },
        onLowBalance: () => {
          // setShowLowBalanceModal(true);
        },
        onParamFocus: onParamFocus,
        onParamBlur: onParamBlur,
        onParamChange: onParamChange,
      })}
    </>
  );
}
