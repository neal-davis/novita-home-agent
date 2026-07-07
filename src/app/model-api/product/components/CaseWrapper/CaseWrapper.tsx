"use client";

import { message } from "@/components/ui/standard/notify";
import { FC, useState, useEffect, useRef } from "react";
import {
  ResponseCodeV2,
  ResponseCodeV3,
  APIErrReasonV3,
  Txt2ImgV3Request,
  Img2ImgV3Request,
  Img2imgV3Request,
} from "novita-sdk";
import "../../product.global.css";
import { useAppSelector, useAppDispatch } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import {
  getFailMsg,
  getFailMsgV3,
  textToImageWithProgressV3,
  imageToImageWithProgressV3,
} from "@/api/api";
import { LowBalanceModal } from "@/app/components/modals/Modals";
import { NOVITA_URL } from "@/constants/urls";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { API_SOURCE } from "@/constants/constants";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { SD3_PARAMS } from "../sd3/SD3";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";

export enum TaskState {
  init = "init",
  loading = "loading",
  generating = "generating",
  finished = "finished",
  failed = "failed",
}

export type CaseComponentProps = {
  apiVer: string;
  generate: (casename: string, params: { [key: string]: any }) => void;
  cancel: () => void;
  resultImg: string;
  taskState: TaskState;
  setTaskState: (s: TaskState) => void;
};

export default function CaseWrapper({
  renderCase,
  apiVer = "v3",
}: {
  renderCase: FC<CaseComponentProps>;
  apiVer: string;
}) {
  const [resultImg, setResultImg] = useState("");
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
  const [curApiKey, setCurApiKey] = useState("");
  const [taskState, setTaskState] = useState(TaskState.init);
  const isEditing = useRef(true);
  const aborter = useRef<AbortController | null>(null);

  const keys = useSelectKeys();
  const userState = useAppSelector((state) => state.user.state);
  const router = useRouter();
  const path = usePathname();
  const dispatch = useAppDispatch();

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
    isEditing.current = taskState === TaskState.init;
    if (taskState === TaskState.init) {
      setResultImg("");
      aborter.current?.abort();
      aborter.current = null;
    }
  }, [taskState]);

  const handleGenerate = async (
    casename: string,
    params: { [key: string]: any },
  ) => {
    if (userState === UserState.logout) {
      router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`);
      return;
    }
    if (taskState === TaskState.loading || taskState === TaskState.generating) {
      return;
    }
    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }
    const onProgress = (url: string) => {
      console.log("on progress", taskState);
      if (!isEditing.current) {
        setTaskState(TaskState.generating);
        setResultImg(url);
      }
    };
    const onFinish = (url: string) => {
      console.log("on finish", taskState);
      if (!isEditing.current) {
        onProgress(url);
        setTaskState(TaskState.finished);
      }
      dispatch(fetchBalanceDetail() as any);
    };
    const onFail = (code: number, reason: string, taskStatus?: number) => {
      console.log("on fail", taskState);
      if (!isEditing.current) {
        setTaskState(TaskState.failed);
        if (apiVer === "v2") {
          if (code === ResponseCodeV2.COST_BALANCE_FAILURE) {
            // @ts-expect-error err
            if (userState === UserState.logout) {
              router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`);
            } else {
              setShowLowBalanceModal(true);
            }
          } else if (code === ResponseCodeV2.CANCELED) {
            message.warning(getFailMsgV3(code));
          } else {
            message.error(getFailMsg(code, taskStatus));
          }
        }
        if (apiVer === "v3") {
          if (
            code === ResponseCodeV3.TOO_MANY_REQ &&
            reason === APIErrReasonV3.ANONYMOUS_ACCESS_QUOTA_EXCEEDS
          ) {
            router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`);
          } else if (
            code === ResponseCodeV3.REQUEST_INVALID &&
            reason === APIErrReasonV3.BALANCE_NOT_ENOUGH
          ) {
            setShowLowBalanceModal(true);
          } else if (code === ResponseCodeV2.CANCELED) {
            message.warning(getFailMsgV3(code));
          } else {
            message.error(getFailMsgV3(code, reason));
          }
        }
        dispatch(fetchBalanceDetail() as any);
      }
    };
    aborter.current = new AbortController();
    setResultImg("");
    setTaskState(TaskState.loading);
    isEditing.current = false;

    const requestBody: Txt2ImgV3Request = {
      request: {
        model_name: params.model_name,
        height: params.height || 768,
        width: params.width || 768,
        sampler_name: params.sampler_name || "DPM++ 2M Karras",
        steps: params.steps || 25,
        guidance_scale: params.cfg_scale || 7.5,
        negative_prompt:
          params.negative_prompt ||
          "bad anatomy, bad hands, hands, dirty, simple background, text, error, missing fingers, extra digit, extra ears, fewer digits, cropped, worst quality, low quality, normal quality, dirt, drawing, jpeg artifacts, signature, watermark, username, out of focus, ugly, old, deformed, amateur, fat, morphing, lowres",
        image_num: 1,
        seed: -1,
        clip_skip: params.clip_skip || 1,
        prompt: params.prompt,
      },
      extra: {
        enterprise_plan: {
          enabled: enterprisePlanTipsUtils.isUseEnterprise(),
        },
      },
    };

    if (casename === FUNC_NAME.IMG2IMG) {
      (requestBody as Img2ImgV3Request).request.strength =
        params.strength || 0.7;
      (requestBody as Img2ImgV3Request).request.image_base64 =
        params.init_images[0];
    }
    if (casename === FUNC_NAME.TXT2IMG) {
      textToImageWithProgressV3(
        curApiKey,
        requestBody,
        (imgs: string[]) => onProgress(imgs[0]),
        (imgs: string[]) => onFinish(imgs[0]),
        onFail,
        () => {},
        {
          source: API_SOURCE.DEMO,
          abortSignal: aborter.current!.signal,
        },
      );
    }
    if (casename === FUNC_NAME.IMG2IMG) {
      imageToImageWithProgressV3(
        curApiKey,
        requestBody as Img2imgV3Request,
        (imgs: string[]) => onProgress(imgs[0]),
        (imgs: string[]) => onFinish(imgs[0]),
        onFail,
        () => {},
        {
          source: API_SOURCE.DEMO,
          abortSignal: aborter.current!.signal,
        },
      );
    }
    if (casename.startsWith("sd3-")) {
      const requestBody: Txt2ImgV3Request = {
        request: {
          ...SD3_PARAMS,
          prompt: params.prompt,
          negative_prompt: params.negative_prompt || "",
          seed: params.seed,
          guidance_scale: 7.5, // ignored
          sampler_name: "DPM++ 2M Karras", // ignored
        },
        extra: {
          enterprise_plan: {
            enabled: enterprisePlanTipsUtils.isUseEnterprise(),
          },
        },
      };

      if (casename === FUNC_NAME.SD3_TXT2IMG) {
        textToImageWithProgressV3(
          curApiKey,
          requestBody,
          (imgs: string[]) => onProgress(imgs[0]),
          (imgs: string[]) => onFinish(imgs[0]),
          onFail,
          () => {},
          {
            source: API_SOURCE.DEMO,
            abortSignal: aborter.current!.signal,
          },
        );
      }
      if (casename === FUNC_NAME.SD3_IMG2IMG) {
        (requestBody as Img2ImgV3Request).request.image_base64 =
          params.init_images[0];
        (requestBody as Img2ImgV3Request).request.strength = params.strength;
        imageToImageWithProgressV3(
          curApiKey,
          requestBody as Img2imgV3Request,
          (imgs: string[]) => onProgress(imgs[0]),
          (imgs: string[]) => onFinish(imgs[0]),
          onFail,
          () => {},
          {
            source: API_SOURCE.DEMO,
            abortSignal: aborter.current!.signal,
          },
        );
      }
    }
  };

  function handleCancel() {
    aborter.current?.abort();
    aborter.current = null;
    isEditing.current = true;
    setTaskState(TaskState.init);
  }

  return (
    <>
      <LowBalanceModal
        show={showLowBalanceModal}
        close={() => {
          setShowLowBalanceModal(false);
        }}
      />
      {renderCase({
        apiVer: apiVer,
        generate: handleGenerate,
        cancel: handleCancel,
        resultImg: resultImg,
        taskState: taskState,
        setTaskState,
      })}
    </>
  );
}
