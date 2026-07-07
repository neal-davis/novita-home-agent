import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import { WarningDialog } from "@/components/ui/standard/warning-dialog";
import {
  ResponseCodeV3,
  APIErrReasonV3,
  Img2VideoModel,
  Img2VideoResizeMode,
} from "novita-sdk";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import styles from "./Img2Video.module.css";
import baseStyles from "../base.module.scss";
import { imageToVideoWithProgress, getFailMsgV3 } from "@/api/api";
import Dragger from "@/app/components/dragger/Dragger";
import { TaskState, DemoProps } from "../DemoWrapper";
import PrimaryBtn from "../../button/Button";
import AutoHeightImage from "../AutoHeightImage";
import { MAX_IMAGE_SIZE, getApiSource } from "@/constants/constants";
import { getGenBtnId } from "@/app/components/analytics/constants";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { calcPrice } from "@/lib/utils/pricing";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { formatMoneyDisplay } from "@/lib/utils/money";
import { FormItem } from "@/app/models/image/components/FormItem/FormItem";
import { WIDGET_TYPE, type WidgetProps } from "@/app/models/lib/widgets";
const MIN_WIDTH = 256;
const MAX_WIDTH = 2048;
const MIN_HEIGHT = 256;
const MAX_HEIGHT = 2048;
const stepsWidget: WidgetProps = {
  label: "Steps",
  type: WIDGET_TYPE.SLIDER,
  paramsKey: "steps",
  defaultValue: 20,
  numberProps: {
    min: 1,
    max: 50,
    step: 1,
  },
};
export default function Img2Video({
  apiKey,
  funcInfo,
  rootPage,
  onNeedLogin,
  onLowBalance,
  onParamFocus,
  onParamBlur,
  onParamChange,
  showCancelConfirm,
}: DemoProps) {
  const [warningDialog, setWarningDialog] = useState<{
    open: boolean;
    title: string;
    description: React.ReactNode;
  }>({
    open: false,
    title: "",
    description: null,
  });
  const [imgSrc, setImgSrc] = useState("");
  const [model, setModel] = useState<Img2VideoModel>(Img2VideoModel.SVD_XT);
  const [resizeMode, setResizeMode] = useState<Img2VideoResizeMode>(
    Img2VideoResizeMode.ORIGINAL_RESOLUTION,
  );
  const [steps, setSteps] = useState(20);
  const [seed, setSeed] = useState(-1);
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultVideoUrl, setResultVideoUrl] = useState("");
  const aborter = useRef<AbortController | null>(null);
  const taskState = useRef(TaskState.init);
  const imgSize = useRef({ w: 0, h: 0 });
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const estimatePrice = useMemo(() => {
    return (
      calcPrice(FUNC_NAME.IMG2VIDEO, {
        model,
        steps,
      }).discountPrice ?? "-"
    );
  }, [model, steps]);
  const showWarning = (title: string, description: React.ReactNode) => {
    setWarningDialog({
      open: true,
      title,
      description,
    });
  };
  useEffect(() => {
    onParamChange?.("image_file", "");
    onParamChange?.("model_name", model);
    onParamChange?.("frames_num", model === Img2VideoModel.SVD ? 14 : 25);
    onParamChange?.("frames_per_second", 6);
    onParamChange?.("image_file_resize_mode", resizeMode);
    onParamChange?.("seed", -1);
    onParamChange?.("steps", 20);
  }, [model, onParamChange, resizeMode]);
  useEffect(() => {
    console.log("imgsrc change");
    onParamFocus?.("image_file");
    onParamChange?.("image_file", imgSrc || "");
    setTimeout(() => {
      onParamBlur?.("image_file");
    }, 1000);
  }, [imgSrc, onParamBlur, onParamChange, onParamFocus]);
  const handleGenerate = useCallback(async () => {
    if (userState === UserState.logout) {
      onNeedLogin();
      return;
    }
    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }
    if (
      resizeMode === Img2VideoResizeMode.ORIGINAL_RESOLUTION &&
      imgSize.current.w * imgSize.current.h > 576 * 1024
    ) {
      showWarning(
        "Image Invalid!",
        <p>
          {
            'The image resolution should be less than 576 * 1024 if you choose "Original resolution" as resize mode.'
          }
        </p>,
      );
      return;
    }
    setGenerating(true);
    setHasStartedGenerate(true);
    taskState.current = TaskState.generating;
    aborter.current = new AbortController();
    const onProgress = () => {};
    const onFinish = (videos: string[]) => {
      if (taskState.current !== TaskState.init) {
        setGenerating(false);
        taskState.current = TaskState.finished;
        setResultVideoUrl(videos[0]);
      }
      dispatch(fetchBalanceDetail() as any);
    };
    const onFail = (code: number, reason?: string, msg?: string) => {
      if (taskState.current !== TaskState.init) {
        if (
          code === ResponseCodeV3.TOO_MANY_REQ &&
          reason === APIErrReasonV3.ANONYMOUS_ACCESS_QUOTA_EXCEEDS
        ) {
          onNeedLogin();
        } else if (
          code === ResponseCodeV3.REQUEST_INVALID &&
          reason === APIErrReasonV3.BALANCE_NOT_ENOUGH
        ) {
          onLowBalance();
        } else {
          message.error(getFailMsgV3(code, reason, msg));
        }
        setGenerating(false);
        taskState.current = TaskState.failed;
        setResultVideoUrl("");
      }
      if (code === ResponseCodeV3.CANCELED) {
        message.warning(getFailMsgV3(code, reason, msg));
      }
      dispatch(fetchBalanceDetail() as any);
    };
    const syncTaskId = (taskId: string) => {
      setTaskId(taskId);
    };
    imageToVideoWithProgress(
      apiKey,
      {
        model_name: model,
        image_file: imgSrc,
        frames_num: model === Img2VideoModel.SVD ? 14 : 25,
        frames_per_second: 6,
        seed: seed,
        image_file_resize_mode: resizeMode,
        steps: steps,
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
        source: getApiSource(rootPage),
        abortSignal: aborter.current?.signal,
      },
    );
  }, [
    userState,
    resizeMode,
    apiKey,
    model,
    imgSrc,
    seed,
    steps,
    rootPage,
    onNeedLogin,
    dispatch,
    onLowBalance,
  ]);
  return (
    <DemoWrapper
      rootPage={rootPage}
      funcInfo={funcInfo}
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
              maxWidth: MAX_WIDTH,
              minWidth: MIN_WIDTH,
              maxHeight: MAX_HEIGHT,
              minHeight: MIN_HEIGHT,
            }}
            onUpload={(
              url: string,
              size: {
                w: number;
                h: number;
              },
            ) => {
              setImgSrc(url || "");
              imgSize.current.w = size.w;
              imgSize.current.h = size.h;
              if (size.w * size.h > 576 * 1024) {
                setResizeMode(Img2VideoResizeMode.CROP_TO_ASPECT_RATIO);
              }
            }}
          />
          <div className={baseStyles.form_item}>
            <label>{"Model"}</label>
            <Select
              disabled={generating}
              className={styles.model_selector}
              options={[
                {
                  label: "SVD-XT",
                  value: Img2VideoModel.SVD_XT,
                },
                {
                  label: "SVD",
                  value: Img2VideoModel.SVD,
                },
              ]}
              value={model}
              onFocus={() => {
                onParamFocus?.("model_name");
              }}
              onBlur={() => {
                onParamBlur?.("model_name");
              }}
              onChange={(value) => {
                setModel(value);
                onParamChange?.("model_name", value);
              }}
            />
          </div>
          <div className={`${baseStyles.form_item}`}>
            <label>{"Resize mode"}</label>
            <Select
              disabled={generating}
              className={styles.resize_selector}
              options={[
                {
                  value: Img2VideoResizeMode.ORIGINAL_RESOLUTION,
                  label: "Original resolution",
                },
                {
                  value: Img2VideoResizeMode.CROP_TO_ASPECT_RATIO,
                  label: "Crop",
                },
              ]}
              value={resizeMode}
              onFocus={() => {
                onParamFocus?.("image_file_resize_mode");
              }}
              onBlur={() => {
                onParamBlur?.("image_file_resize_mode");
              }}
              onChange={(value) => {
                setResizeMode(value);
                onParamChange?.("image_file_resize_mode", value);
              }}
            />
          </div>
          <FormItem
            widgetProps={stepsWidget}
            fieldProps={{
              disabled: generating,
            }}
            value={steps}
            onChange={(value) => {
              const nextValue = Number(value);
              setSteps(nextValue);
              onParamChange?.("steps", nextValue);
            }}
            onFocus={() => {
              onParamFocus?.("steps");
            }}
            onBlur={() => {
              onParamBlur?.("steps");
            }}
          />
          <div className={baseStyles.form_item}>
            <label>{"Seed"}</label>
            <NumberInput
              disabled={generating}
              className={baseStyles.input}
              min={-1}
              value={seed}
              onChange={(value) => {
                setSeed(value || -1);
                onParamChange?.("seed", value);
              }}
              onFocus={() => {
                onParamFocus?.("seed");
              }}
              onBlur={() => {
                onParamBlur?.("seed");
              }}
              controls={false}
            />
          </div>
        </>
      }
      formFoot={
        <div className={baseStyles.btn_group}>
          <PrimaryBtn
            type="secondary"
            className={baseStyles.gen_btn}
            id={getGenBtnId(rootPage)}
            elAttrs={{
              "data-gtm-product-name": funcInfo.name,
            }}
            onClick={handleGenerate}
            loading={generating}
            disabled={!imgSrc}
          >
            {"Generate"}
          </PrimaryBtn>
          {generating && (
            <Button
              ghost={true}
              className={baseStyles.cancel_btn}
              onClick={() => {
                showCancelConfirm?.(() => {
                  aborter.current?.abort();
                  aborter.current = null;
                  setGenerating(false);
                  taskState.current = TaskState.init;
                });
              }}
            >
              {"Cancel"}
            </Button>
          )}
          {estimatePrice && (
            <p className={baseStyles.price_info}>
              Estimated cost:
              <strong>{`$${formatMoneyDisplay(estimatePrice)}/video`}</strong>
            </p>
          )}
        </div>
      }
      resultContent={
        <div className={styles.video_wrapper}>
          {!resultVideoUrl && !imgSrc && <ImagePlaceholder noborder large />}
          {!resultVideoUrl && imgSrc && (
            <AutoHeightImage
              maxHeight={rootPage === "product" ? 512 : undefined}
              className={`${styles.preview_img} ${styles.preview_img_origin}`}
              src={imgSrc}
              alt="img"
              loading={generating}
            />
          )}
          {resultVideoUrl && (
            <video controls className={styles.video} src={resultVideoUrl} />
          )}
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
