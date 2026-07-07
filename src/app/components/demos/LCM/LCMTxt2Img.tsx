import { useRef, useState, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import styles from "./LCMTxt2Img.module.css";
import baseStyles from "../base.module.scss";
import { lcmTxt2Img, getFailMsgV3 } from "@/api/api";
import PromptInput from "@/app/components/input/PromptInput/PromptInput";
import { TaskState, DemoProps } from "../DemoWrapper";
import { getApiSource } from "@/constants/constants";
import { getGenBtnId } from "@/app/components/analytics/constants";
import PrimaryButton from "../../button/Button";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import PreviewImage from "../ImagePlaceholder/PreviewImage";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";

const imgCount = 9;

export default function LCMTxt2Img(props: DemoProps) {
  // const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrls, setResultImgUrls] = useState<string[]>([]);
  const aborter = useRef<AbortController | null>(null);

  const taskState = useRef(TaskState.init);

  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onParamChange } = props;

  useEffect(() => {
    onParamChange?.("image_num", imgCount);
    onParamChange?.("prompt", "");
  }, [onParamChange]);

  const handleGenerate = async () => {
    if (userState === UserState.logout) {
      props.onNeedLogin();
      return;
    }

    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }

    taskState.current = TaskState.generating;
    setGenerating(true);
    setHasStartedGenerate(true);
    // setStep(1);
    setResultImgUrls(Array.from({ length: imgCount }, () => ""));
    aborter.current = new AbortController();

    const onFinish = (imgs: string[], taskId: string) => {
      setTaskId(taskId);
      if (taskState.current !== TaskState.init) {
        setGenerating(false);
        taskState.current = TaskState.finished;
        setResultImgUrls(imgs);
      }
      dispatch(fetchBalanceDetail() as any);
    };
    const onFail = (
      code: number,
      reason?: string,
      msg?: string,
      taskId?: string,
    ) => {
      setTaskId(taskId || "");
      if (taskState.current !== TaskState.init) {
        if (
          code === ResponseCodeV3.TOO_MANY_REQ &&
          reason === APIErrReasonV3.ANONYMOUS_ACCESS_QUOTA_EXCEEDS
        ) {
          props.onNeedLogin();
        } else if (
          code === ResponseCodeV3.REQUEST_INVALID &&
          reason === APIErrReasonV3.BALANCE_NOT_ENOUGH
        ) {
          props.onLowBalance();
        } else {
          message.error(getFailMsgV3(code, reason, msg));
        }
        setResultImgUrls([]);
        setGenerating(false);
        taskState.current = TaskState.init;
      }
      if (code === ResponseCodeV3.CANCELED) {
        message.warning(getFailMsgV3(code, reason, msg));
      }
      dispatch(fetchBalanceDetail() as any);
    };

    lcmTxt2Img(
      props.apiKey,
      {
        prompt,
        height: 512,
        width: 512,
        image_num: imgCount,
        steps: 8,
        guidance_scale: 2,
        extra: {
          enterprise_plan: {
            enabled: enterprisePlanTipsUtils.isUseEnterprise(),
          },
        },
      },
      onFinish,
      onFail,
      {
        source: getApiSource(props.rootPage),
        abortSignal: aborter.current?.signal,
      },
    );
  };

  return (
    <DemoWrapper
      rootPage={props.rootPage}
      funcInfo={props.funcInfo}
      formContent={
        <>
          <PromptInput
            value={prompt}
            setValue={setPrompt}
            maxLine={6}
            onFocus={() => {
              props.onParamFocus?.("prompt");
            }}
            onBlur={() => {
              props.onParamBlur?.("prompt");
            }}
            onChange={(val: string) => {
              props.onParamChange?.("prompt", val);
            }}
          />
          <PrimaryButton
            type="primary"
            className={baseStyles.gen_btn}
            id={getGenBtnId(props.rootPage)}
            elAttrs={{
              "data-gtm-product-name": props.funcInfo.name,
            }}
            onClick={handleGenerate}
            loading={generating}
            disabled={!prompt}
          >
            {`Generate ${imgCount} images`}
          </PrimaryButton>
        </>
      }
      resultContent={
        <div className={styles.preview_wrapper}>
          <div className={styles.preview_img_wrapper}>
            {resultImgUrls.length === 0 &&
              Array.from({ length: imgCount }, (_, idx) => (
                <PreviewImage className={styles.img_item} key={idx} />
              ))}
            {resultImgUrls.map((url, idx) => {
              let elm;
              if (url) {
                elm = (
                  <PreviewImage
                    className={styles.img_item}
                    key={idx}
                    url={url}
                    withPreview
                  />
                );
              } else {
                elm = (
                  <PreviewImage
                    className={styles.img_item}
                    key={idx}
                    url={url}
                    loading
                  />
                );
              }
              return elm;
            })}
          </div>
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
