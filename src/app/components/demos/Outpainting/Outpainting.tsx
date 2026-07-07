import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { NumberInput } from "@/components/ui/standard/number-input";
import { PreviewImage } from "@/components/ui/standard/preview-image";
import { WarningDialog } from "@/components/ui/standard/warning-dialog";
import { ArrowLeft as ArrowLeftOutlined } from "lucide-react";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import styles from "./Outpainting.module.css";
import baseStyles from "../base.module.scss";
import { outpainting, getFailMsgV3 } from "@/api/api";
import Dragger from "@/app/components/dragger/Dragger";
import { TaskState, DemoProps } from "../DemoWrapper";
import { MAX_IMAGE_SIZE, getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import { downloadImage } from "@/lib/utils/media";
import Cropper, { CropperMethods } from "../../Cropper/Cropper";
import PrimaryBtn from "../../button/Button";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
const MIN_WIDTH = 256;
const MAX_WIDTH = 4096;
const MIN_HEIGHT = 256;
const MAX_HEIGHT = 4096;
export default function Outpainting(props: DemoProps) {
  const [step, setStep] = useState(0);
  const [imgSrc, setImgSrc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const [curCropperRes, setCurCropperRes] = useState({ w: 0, h: 0 });
  const [curCenterPos, setCurCenterPos] = useState({ x: 0, y: 0 });
  const [curImgSize, setCurImgSize] = useState({ w: 0, h: 0 });
  const cropperRef = useRef<CropperMethods>(null);
  const taskState = useRef(TaskState.init);
  const cropperEl = useRef(null);
  const aborter = useRef<AbortController | null>(null);
  const [warningDialog, setWarningDialog] = useState<{
    open: boolean;
    title: string;
    description: React.ReactNode;
  }>({
    open: false,
    title: "",
    description: null,
  });
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onParamBlur, onParamChange, onParamFocus } = props;
  const setActiveCodes = useCallback(
    (params: any) => {
      if (params.width !== undefined) {
        onParamFocus?.("width");
        onParamChange?.("width", params.width);
        setTimeout(() => {
          onParamBlur?.("width");
        }, 1000);
      }
      if (params.height !== undefined) {
        onParamFocus?.("height");
        onParamChange?.("height", params.height);
        setTimeout(() => {
          onParamBlur?.("height");
        }, 1000);
      }
      if (params.center_x !== undefined) {
        onParamFocus?.("center_x");
        onParamChange?.("center_x", params.center_x);
        setTimeout(() => {
          onParamBlur?.("center_x");
        }, 1000);
      }
      if (params.center_y !== undefined) {
        onParamFocus?.("center_y");
        onParamChange?.("center_y", params.center_y);
        setTimeout(() => {
          onParamBlur?.("center_y");
        }, 1000);
      }
    },
    [onParamBlur, onParamChange, onParamFocus],
  );
  useEffect(() => {
    setActiveCodes({
      width: 0,
      height: 0,
      center_x: 0,
      center_y: 0,
    });
    onParamChange?.("image_file", "");
  }, [onParamChange, setActiveCodes]);
  useEffect(() => {
    onParamFocus?.("image_file");
    onParamChange?.("image_file", imgSrc);
    setTimeout(() => {
      onParamBlur?.("image_file");
    }, 1000);
    if (imgSrc) {
      setStep(0);
      setResultImgUrl("");
    }
  }, [imgSrc, onParamBlur, onParamChange, onParamFocus]);
  const showWarning = (title: string, description: React.ReactNode) => {
    setWarningDialog({
      open: true,
      title,
      description,
    });
  };
  const onCrop = useCallback(
    (
      cropperSize: {
        w: number;
        h: number;
      },
      cropperPos: {
        x: number;
        y: number;
      },
      imgSize: {
        w: number;
        h: number;
      },
    ) => {
      setCurCropperRes({
        w: Math.floor(cropperSize.w),
        h: Math.floor(cropperSize.h),
      });
      setCurCenterPos({
        x: Math.floor(cropperPos.x),
        y: Math.floor(cropperPos.y),
      });
      setCurImgSize({
        w: Math.floor(imgSize.w),
        h: Math.floor(imgSize.h),
      });
      onParamChange?.("width", Math.floor(cropperSize.w));
      onParamChange?.("height", Math.floor(cropperSize.h));
      onParamChange?.("center_x", Math.floor(cropperPos.x));
      onParamChange?.("center_y", Math.floor(cropperPos.y));
    },
    [onParamChange],
  );
  const handleGenerate = async () => {
    if (userState === UserState.logout) {
      props.onNeedLogin();
      return;
    }
    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }
    if (
      curCropperRes.w < MIN_WIDTH ||
      curCropperRes.w > MAX_WIDTH ||
      curCropperRes.h < MIN_HEIGHT ||
      curCropperRes.h > MAX_HEIGHT
    ) {
      showWarning(
        "Crop Invalid!",
        <p>
          {"The width and height of the crop should be between 256 and 1024."}
        </p>,
      );
      return;
    }
    if (
      curCenterPos.x < -curImgSize.w / 2 ||
      curCenterPos.x > curImgSize.w / 2 ||
      curCenterPos.y < -curImgSize.h / 2 ||
      curCenterPos.y > curImgSize.h / 2
    ) {
      showWarning(
        "Crop Invalid!",
        <p>{"The center of the crop should not be outside of the image"}</p>,
      );
      return;
    }
    const base64 = await cropperRef.current!.getImgBase64();
    props.onParamFocus?.("image_file");
    props.onParamChange?.("image_file", base64);
    setTimeout(() => {
      props.onParamBlur?.("image_file");
    }, 1000);
    taskState.current = TaskState.generating;
    setGenerating(true);
    setHasStartedGenerate(true);
    aborter.current = new AbortController();
    const onFinish = (img: string, taskId: string) => {
      setTaskId(taskId);
      if (taskState.current !== TaskState.init) {
        setStep(1);
        setGenerating(false);
        taskState.current = TaskState.finished;
        setResultImgUrl(img);
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
        setGenerating(false);
        setStep(0);
        taskState.current = TaskState.init;
        setResultImgUrl("");
      }
      if (code === ResponseCodeV3.CANCELED) {
        message.warning(getFailMsgV3(code));
      }
      dispatch(fetchBalanceDetail() as any);
    };
    outpainting(
      props.apiKey,
      {
        image_file: base64,
        width: curCropperRes.w,
        height: curCropperRes.h,
        center_x: curCenterPos.x,
        center_y: curCenterPos.y,
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
          <WarningDialog
            open={warningDialog.open}
            title={warningDialog.title}
            description={warningDialog.description}
            onOpenChange={(open) =>
              setWarningDialog((prev) => ({ ...prev, open }))
            }
          />
          <Dragger
            disabled={generating}
            restrictions={{
              maxSize: MAX_IMAGE_SIZE,
              // maxWidth: MAX_WIDTH,
              minWidth: MIN_WIDTH,
              // maxHeight: MAX_HEIGHT,
              minHeight: MIN_HEIGHT,
            }}
            onUpload={(url: string) => {
              setImgSrc(url || "");
            }}
          />
          <div className={baseStyles.btn_group_vertical}>
            <PrimaryBtn
              type="secondary"
              className={`${baseStyles.gen_btn} ${styles.gen_btn}`}
              id={getGenBtnId(props.rootPage)}
              elAttrs={{
                "data-gtm-product-name": props.funcInfo.name,
              }}
              onClick={handleGenerate}
              loading={generating}
              disabled={
                !imgSrc ||
                curCropperRes.w > MAX_WIDTH ||
                curCropperRes.h > MAX_HEIGHT
              }
            >
              {"Generate"}
            </PrimaryBtn>
            {generating && (
              <Button
                ghost={true}
                className={`${baseStyles.cancel_btn} ${styles.cancel_btn}`}
                onClick={() => {
                  aborter.current?.abort();
                  aborter.current = null;
                  setGenerating(false);
                  taskState.current = TaskState.init;
                }}
              >
                {"Cancel"}
              </Button>
            )}
            {resultImgUrl && (
              <div className={baseStyles.btn_group}>
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
              </div>
            )}
          </div>
        </>
      }
      resultContent={
        <>
          {!imgSrc && <ImagePlaceholder noborder large />}
          {step === 0 && imgSrc && (
            <div
              className={[
                styles.cropper_wrapper,
                props.rootPage === "product" ? styles.cropper_in_product : "",
                props.rootPage === "playground"
                  ? styles.cropper_in_playground
                  : "",
                step === 0 ? styles.show : styles.hide,
              ].join(" ")}
            >
              <div ref={cropperEl} className={styles.cropper}>
                <Cropper
                  ref={cropperRef}
                  loading={generating}
                  baseImg={imgSrc}
                  onCrop={onCrop}
                  maxWidth={MAX_WIDTH}
                  maxHeight={MAX_HEIGHT}
                />
              </div>
              <div className={styles.cropper_info}>
                <div
                  className={`${styles.cropper_res} ${
                    curCropperRes.w > MAX_WIDTH || curCropperRes.h > MAX_HEIGHT
                      ? styles.invalid
                      : ""
                  }`}
                >
                  <NumberInput
                    className={styles.cropper_input}
                    min={MIN_WIDTH}
                    max={MAX_HEIGHT}
                    value={curCropperRes.w}
                    controls={false}
                    onChange={(value) => {
                      if (value) {
                        cropperRef.current!.crop({ w: value });
                      }
                    }}
                    onFocus={() => {
                      props.onParamFocus?.("width");
                    }}
                    onBlur={() => {
                      props.onParamBlur?.("width");
                    }}
                  />
                  <span>*</span>
                  <NumberInput
                    className={styles.cropper_input}
                    min={MIN_HEIGHT}
                    max={MAX_HEIGHT}
                    value={curCropperRes.h}
                    controls={false}
                    onChange={(value) => {
                      if (value) {
                        cropperRef.current!.crop({ h: value });
                      }
                    }}
                    onFocus={() => {
                      props.onParamFocus?.("height");
                    }}
                    onBlur={() => {
                      props.onParamBlur?.("height");
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className={styles.preview_img_wrapper}>
              <Button
                className={baseStyles.back_btn}
                onClick={() => {
                  setStep(0);
                  setResultImgUrl("");
                  setGenerating(false);
                  taskState.current = TaskState.init;
                }}
                icon={<ArrowLeftOutlined />}
              >
                {"Back"}
              </Button>
              <PreviewImage
                rootClassName={styles.preview_img}
                className={styles.preview_img_img}
                src={resultImgUrl}
                alt="img"
                style={{
                  maxHeight: props.rootPage === "product" ? 512 : "auto",
                }}
              />
            </div>
          )}
        </>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
