"use client";

import Button from "@/app/components/button/Button";
import { useEffect, useState } from "react";

import styles from "./ImgInput.module.css";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { LowBalanceModal } from "@/app/components/modals/Modals";
import { getFailMsg, textToImageWithProgress } from "@/api/api";
import { API_SOURCE } from "@/constants/constants";
import { ResponseCodeV2 } from "novita-sdk";
import { message } from "@/components/ui/standard/notify";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
import { usePathname, useRouter } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";
import { Input } from "@/components/ui/input";

export default function ImgGenerate({
  prompt,
  model_name,
  negative_prompt,
}: {
  prompt: string;
  negative_prompt?: string;
  model_name?: string;
}) {
  const userState = useAppSelector((state) => state.user.state);
  const keys = useSelectKeys();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [promptValue, setPromptValue] = useState("");
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resultImg, setResultImg] = useState("");
  const [curApiKey, setCurApiKey] = useState("");

  const onProgress = (url: string) => {
    setResultImg(url);
  };
  const onFinish = (url: string) => {
    dispatch(fetchBalanceDetail() as any);
    setResultImg(url);
    setLoading(false);
  };

  const onFail = (code: number, reason: string, taskStatus?: number) => {
    if (code === ResponseCodeV2.COST_BALANCE_FAILURE) {
      if (userState === UserState.logout) {
        router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${pathname}`);
      } else {
        setShowLowBalanceModal(true);
      }
    } else {
      message.error(getFailMsg(code, taskStatus));
    }
    setLoading(false);
    dispatch(fetchBalanceDetail() as any);
  };

  useEffect(() => {
    setPromptValue(prompt);
    setResultImg("");
  }, [prompt]);

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

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className={`flex p-2 gap-2 ${styles.input_wrap}`}>
        <Input
          type="text"
          value={promptValue}
          onChange={(e) => {
            setPromptValue(e.target.value);
          }}
          className={styles.generate_input}
          disabled={loading}
        />
        <Button
          style={{
            border: "none",
          }}
          loading={loading}
          onClick={() => {
            if (userState === UserState.logout) {
              // dispatch(setShowLoginModal(true) as any);
              router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${pathname}`);
              return;
            }
            setLoading(true);
            textToImageWithProgress(
              curApiKey,
              {
                model_name:
                  model_name ??
                  "protovisionXLHighFidelity3D_release0630Bakedvae_154359.safetensors",
                height: 768,
                width: 768,
                sampler_name: "DPM++ 2M Karras",
                steps: 25,
                cfg_scale: 7,
                batch_size: 1,
                negative_prompt:
                  negative_prompt ??
                  "bad anatomy, bad hands, hands, dirty, simple background, text, error, missing fingers, extra digit, extra ears, fewer digits, cropped, worst quality, low quality, normal quality, dirt, drawing, jpeg artifacts, signature, watermark, username, out of focus, ugly, old, deformed, amateur, fat, morphing, lowres",
                seed: -1,
                prompt: promptValue,
              },
              (imgs: string[]) => onProgress(imgs[0]),
              (imgs: string[]) => onFinish(imgs[0]),
              onFail,
              () => {},
              {
                source: API_SOURCE.DEMO,
              },
            );
          }}
        >
          <span>Generate</span>
        </Button>
      </div>
      <div className="mt-6">
        {resultImg && (
          <img
            src={resultImg}
            alt="result"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      <LowBalanceModal
        show={showLowBalanceModal}
        close={() => {
          setShowLowBalanceModal(false);
        }}
      />
    </div>
  );
}
