import { useState, useRef, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import { PreviewImage } from "@/components/ui/standard/preview-image";
import { UpscalersV3, ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { MAX_IMAGE_SIZE, getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import { useAppDispatch, useAppSelector } from "@/store";
import Dragger from "@/app/components/dragger/Dragger";
import { downloadImage } from "@/lib/utils/media";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { getFailMsgV3, upscaleWithProgressV3 } from "@/api/api";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import { TaskState, DemoProps } from "../DemoWrapper";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import AutoHeightImage from "../AutoHeightImage";
import PrimaryBtn from "../../button/Button";
import Slider from "../../input/Slider/Slider";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import baseStyles from "../base.module.scss";
import styles from "./Upscale.module.css";
const MAX_WIDTH = 4096;
const MAX_HEIGHT = 4096;
export default function Upscale(props: DemoProps) {
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [calling, setCalling] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [imgSrc, setImgSrc] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const [modelName, setModelName] = useState(UpscalersV3.REALESRNET_X4PLUS);
  const [scaleFactor, setScaleFactor] = useState(2);
  const aborter = useRef<AbortController | null>(null);
  const taskState = useRef(TaskState.init);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onParamBlur, onParamChange, onParamFocus } = props;
  useEffect(() => {
    onParamChange?.("model_name", modelName);
    onParamChange?.("scale_factor", scaleFactor);
  }, [modelName, onParamChange, scaleFactor]);
  useEffect(() => {
    onParamFocus?.("image_base64");
    onParamChange?.("image_base64", imgSrc);
    setTimeout(() => {
      onParamBlur?.("image_base64");
    }, 1000);
    if (imgSrc) {
      setResultImgUrl("");
    }
  }, [imgSrc, onParamBlur, onParamChange, onParamFocus]);
  const handleGenerate = async () => {
    if (userState === UserState.logout) {
      props.onNeedLogin();
      return;
    }
    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }
    taskState.current = TaskState.generating;
    setCalling(true);
    setHasStartedGenerate(true);
    aborter.current = new AbortController();
    setResultImgUrl("");
    const onProgress = (img: string[]) => {
      if (taskState.current !== TaskState.init) {
        setCalling(false);
        taskState.current = TaskState.generating;
        setGenerating(true);
        setResultImgUrl(img[0]);
      }
    };
    const onFinish = (img: string[]) => {
      if (taskState.current !== TaskState.init) {
        onProgress(img);
        setCalling(false);
        setGenerating(false);
        taskState.current = TaskState.finished;
      }
      dispatch(fetchBalanceDetail() as any);
    };
    const onFail = (code: number, reason: string) => {
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
          message.error(getFailMsgV3(code, reason));
        }
        setResultImgUrl("");
        setCalling(false);
        setGenerating(false);
        taskState.current = TaskState.init;
      }
      if (code === ResponseCodeV3.CANCELED) {
        message.warning(getFailMsgV3(code));
      }
      dispatch(fetchBalanceDetail() as any);
    };
    const syncTaskId = (taskId: string) => {
      setTaskId(taskId);
    };
    upscaleWithProgressV3(
      props.apiKey,
      {
        request: {
          model_name: modelName,
          image_base64: imgSrc,
          scale_factor: scaleFactor,
        },
        extra: {
          enterprise_plan: {
            enabled: enterprisePlanTipsUtils.isUseEnterprise(),
          },
        },
      },
      onProgress,
      onFinish,
      onFail,
      syncTaskId,
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
          <Dragger
            disabled={generating}
            restrictions={{
              maxSize: MAX_IMAGE_SIZE,
              maxWidth: MAX_WIDTH / 2,
              maxHeight: MAX_HEIGHT / 2,
            }}
            onUpload={(url: string) => {
              setImgSrc(url || "");
            }}
          />
          <div className={`${styles.form_wrapper} scrollBar_container`}>
            <div className={baseStyles.form_item}>
              <label>{"Model"}</label>
              <Select
                disabled={generating}
                className={styles.upscaler_selector}
                options={Object.values(UpscalersV3 || {}).map((upscaler) => ({
                  label: upscaler,
                  value: upscaler,
                }))}
                value={modelName}
                onFocus={() => {
                  props.onParamFocus?.("model_name");
                }}
                onBlur={() => {
                  props.onParamBlur?.("model_name");
                }}
                onChange={(value) => {
                  setModelName(value);
                  props.onParamChange?.("model_name", value);
                }}
              />
            </div>
            <div className={baseStyles.form_item} style={{ marginTop: 20 }}>
              <Slider
                label={"Scale Factor"}
                disabled={generating}
                min={1.1}
                max={4}
                step={0.1}
                value={scaleFactor}
                onChange={(val) => {
                  setScaleFactor(val);
                  props.onParamChange?.("scale_factor", val);
                }}
                onFocus={() => {
                  props.onParamFocus?.("scale_factor");
                }}
                onBlur={() => {
                  props.onParamBlur?.("scale_factor");
                }}
              />
            </div>
          </div>
        </>
      }
      formFoot={
        <div className={baseStyles.btn_group}>
          <PrimaryBtn
            type="secondary"
            className={baseStyles.gen_btn}
            id={getGenBtnId(props.rootPage)}
            elAttrs={{
              "data-gtm-product-name": props.funcInfo.name,
            }}
            onClick={handleGenerate}
            loading={calling || generating}
            disabled={!imgSrc}
          >
            {"Generate"}
          </PrimaryBtn>
          {(calling || generating) && (
            <Button
              ghost={true}
              className={baseStyles.cancel_btn}
              onClick={() => {
                aborter.current?.abort();
                aborter.current = null;
                setGenerating(false);
                setCalling(false);
                taskState.current = TaskState.init;
              }}
            >
              {"Cancel"}
            </Button>
          )}
          {resultImgUrl && (
            <Button
              ghost={true}
              className={baseStyles.dl_btn}
              id={CLICK_BTN_IDs.DOWNLOAD_BTN_ID}
              onClick={() => {
                downloadImage(resultImgUrl);
              }}
              disabled={!resultImgUrl}
            >
              {"Download"}
            </Button>
          )}
        </div>
      }
      resultContent={
        <div className={styles.preview_img_wrapper}>
          {!imgSrc && <ImagePlaceholder large noborder />}
          {imgSrc && (
            <div className={styles.preview_img_container}>
              {!resultImgUrl && (
                <AutoHeightImage
                  maxHeight={props.rootPage === "product" ? 512 : undefined}
                  className={`${styles.preview_img} ${styles.preview_img_origin}`}
                  src={imgSrc}
                  alt="img"
                  loading={generating}
                />
              )}
              {resultImgUrl && (
                <PreviewImage
                  height="100%"
                  className={styles.preview_img_img}
                  rootClassName={`${styles.preview_img} ${styles.preview_img_result}`}
                  src={resultImgUrl}
                  alt="img"
                />
              )}
            </div>
          )}
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
