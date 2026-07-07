import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import {
  Undo2 as UndoOutlined,
  Redo2 as RedoOutlined,
  EyeOff as EyeInvisibleOutlined,
  Eye as EyeOutlined,
  Highlighter as HighlightOutlined,
  Move as DragOutlined,
  Eraser as ClearOutlined,
} from "lucide-react";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import styles from "./Cleanup.module.css";
import baseStyles from "../base.module.scss";
import { cleanup, getFailMsgV3 } from "@/api/api";
import Drawer, { DrawerMethods } from "@/app/components/Drawer/Drawer";
import Dragger from "@/app/components/dragger/Dragger";
import { TaskState, DemoProps } from "../DemoWrapper";
import { MAX_IMAGE_SIZE, getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import PrimaryButton from "@/app/components/button/Button";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import Slider from "@/app/components/input/Slider/Slider";
import { downloadImage } from "@/lib/utils/media";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { calcPrice } from "@/lib/utils/pricing";
import { formatMoneyDisplay } from "@/lib/utils/money";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
const MIN_WIDTH = 256;
const MAX_WIDTH = 1024;
const MIN_HEIGHT = 256;
const MAX_HEIGHT = 1024;
export default function Cleanup({
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
  const [imgSrc, setImgSrc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const [dragMode, setDragMode] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [scale, setScale] = useState(1);
  const [showResult, setShowResult] = useState(true);
  const [canGenerate, setCanGenerate] = useState(false);
  const aborter = useRef<AbortController | null>(null);
  const drawerRef = useRef<DrawerMethods>(null);
  const maskImg = useRef("");
  const taskState = useRef(TaskState.init);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  useEffect(() => {
    onParamChange?.("image_file", "");
    onParamChange?.("mask_file", "");
  }, [onParamChange]);
  useEffect(() => {
    console.log("imgsrc change");
    onParamFocus?.("image_file");
    onParamChange?.("image_file", imgSrc || "");
    setTimeout(() => {
      onParamBlur?.("image_file");
    }, 1000);
  }, [imgSrc, onParamBlur, onParamChange, onParamFocus]);
  const estimatePrice = useMemo(() => {
    return calcPrice(FUNC_NAME.CLEANUP).discountPrice;
  }, []);
  const handleGenerate = useCallback(
    async (maskImage: string) => {
      if (userState === UserState.logout) {
        onNeedLogin();
        return;
      }
      if (await enterprisePlanTipsUtils.checkTipsVisible()) {
        return;
      }
      maskImg.current = maskImage;
      onParamFocus?.("mask_file");
      onParamChange?.("mask_file", maskImg.current || "");
      setTimeout(() => {
        onParamBlur?.("mask_file");
      }, 1000);
      setGenerating(true);
      setHasStartedGenerate(true);
      taskState.current = TaskState.generating;
      aborter.current = new AbortController();
      const onFinish = (img: string, taskId: string) => {
        setTaskId(taskId);
        if (taskState.current !== TaskState.init) {
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
          // setStep(1);
          taskState.current = TaskState.failed;
          setResultImgUrl("");
        }
        if (code === ResponseCodeV3.CANCELED) {
          message.warning(getFailMsgV3(code, reason, msg));
        }
        dispatch(fetchBalanceDetail() as any);
      };
      cleanup(
        apiKey,
        {
          image_file: imgSrc,
          mask_file: maskImage.replace("data:image/png;base64,", ""),
          extra: {
            enterprise_plan: {
              enabled: enterprisePlanTipsUtils.isUseEnterprise(),
            },
          },
        },
        onFinish,
        onFail,
        {
          source: getApiSource(rootPage),
          abortSignal: aborter.current?.signal,
        },
      );
    },
    [
      userState,
      onParamFocus,
      onParamChange,
      apiKey,
      imgSrc,
      rootPage,
      onNeedLogin,
      onParamBlur,
      dispatch,
      onLowBalance,
    ],
  );
  return (
    <DemoWrapper
      rootPage={rootPage}
      funcInfo={funcInfo}
      formContent={
        <>
          <Dragger
            disabled={generating}
            restrictions={{
              maxSize: MAX_IMAGE_SIZE,
              maxWidth: MAX_WIDTH,
              minWidth: MIN_WIDTH,
              maxHeight: MAX_HEIGHT,
              minHeight: MIN_HEIGHT,
            }}
            onUpload={(url: string) => {
              setImgSrc(url || "");
            }}
          />
          {imgSrc && (
            <>
              <div className={baseStyles.form_item}>
                <div className={baseStyles.icon_btn_group}>
                  {rootPage === "playground" && (
                    <>
                      <Button
                        title="draw"
                        disabled={generating}
                        className={`${baseStyles.icon_btn} ${!dragMode ? baseStyles.active : ""}`}
                        icon={<HighlightOutlined />}
                        onClick={() => {
                          setDragMode(false);
                          drawerRef.current?.setDragMode(false);
                        }}
                      ></Button>
                      <Button
                        title="drag"
                        disabled={generating}
                        className={`${baseStyles.icon_btn} ${dragMode ? baseStyles.active : ""}`}
                        icon={<DragOutlined />}
                        onClick={() => {
                          setDragMode(true);
                          drawerRef.current?.setDragMode(true);
                        }}
                      ></Button>
                    </>
                  )}
                  <Button
                    title="undo"
                    disabled={generating}
                    className={baseStyles.icon_btn}
                    icon={<UndoOutlined />}
                    onClick={() => {
                      drawerRef.current?.undo();
                    }}
                  ></Button>
                  <Button
                    title="redo"
                    disabled={generating}
                    className={baseStyles.icon_btn}
                    icon={<RedoOutlined />}
                    onClick={() => {
                      drawerRef.current?.redo();
                    }}
                  ></Button>
                  <Button
                    title="clear"
                    disabled={generating}
                    className={baseStyles.icon_btn}
                    icon={<ClearOutlined />}
                    onClick={() => {
                      drawerRef.current?.clear();
                    }}
                  ></Button>
                  {resultImgUrl && (
                    <Button
                      title={showResult ? "Hide changes" : "Show changes"}
                      className={baseStyles.icon_btn}
                      icon={
                        showResult ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                      onClick={() => {
                        drawerRef.current?.setShowResult(!showResult);
                        setShowResult(!showResult);
                      }}
                      disabled={generating}
                    />
                  )}
                </div>
              </div>
              <Slider
                label="Brush size"
                disabled={!imgSrc || generating}
                withInput={true}
                min={5}
                max={50}
                step={1}
                value={brushSize}
                onChange={(val) => {
                  setBrushSize(val);
                  drawerRef.current?.setBrushSize(val);
                }}
              />
              <Slider
                label="Scale"
                disabled={!imgSrc || generating}
                withInput={true}
                min={0.5}
                max={2.5}
                step={0.1}
                value={scale}
                onChange={(val) => {
                  setScale(val);
                  drawerRef.current?.setScale(val);
                }}
              />
              <div
                className={`${baseStyles.form_item} ${baseStyles.btn_group_vertical}`}
              >
                <PrimaryButton
                  type="primary"
                  className={baseStyles.gen_btn}
                  id={getGenBtnId(rootPage)}
                  elAttrs={{
                    "data-gtm-product-name": funcInfo.name,
                  }}
                  onClick={async () => {
                    const maskImg = await drawerRef.current?.getMaskImg();
                    if (!maskImg) {
                      return;
                    }
                    handleGenerate(maskImg);
                  }}
                  loading={generating}
                  disabled={!imgSrc || !canGenerate}
                >
                  {"Generate"}
                </PrimaryButton>
                {generating && (
                  <Button
                    block
                    ghost
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
                {resultImgUrl && !generating && (
                  <Button
                    block
                    ghost
                    className={baseStyles.dl_btn}
                    id={CLICK_BTN_IDs.DOWNLOAD_BTN_ID}
                    onClick={() => {
                      downloadImage(resultImgUrl);
                    }}
                    disabled={generating}
                  >
                    {"Download"}
                  </Button>
                )}
              </div>
              {estimatePrice && (
                <p className={baseStyles.price_info}>
                  Estimated cost:
                  <strong>{`$${formatMoneyDisplay(estimatePrice)}/image`}</strong>
                </p>
              )}
            </>
          )}
        </>
      }
      resultContent={
        <div className={styles.preview_wrapper}>
          <div className={styles.drawer_wrapper}>
            {imgSrc ? (
              <Drawer
                ref={drawerRef}
                rootPage={rootPage}
                baseImage={imgSrc}
                resultImage={resultImgUrl}
                brushSize={brushSize}
                onScale={(s) => {
                  setScale(s);
                }}
                setCanGenerate={(v) => {
                  setCanGenerate(v);
                }}
                canScale={rootPage === "playground"}
                canDrag={rootPage === "playground"}
                loading={generating}
                onGenerate={handleGenerate}
                maxWidth={rootPage === "product" ? 1024 : undefined}
                maxHeight={rootPage === "product" ? 512 : undefined}
                onBack={() => {
                  aborter.current?.abort();
                  aborter.current = null;
                  setImgSrc("");
                  maskImg.current = "";
                  onParamChange?.("mask_file", "");
                  setGenerating(false);
                  setResultImgUrl("");
                  taskState.current = TaskState.init;
                }}
              />
            ) : (
              <ImagePlaceholder large noborder />
            )}
          </div>
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
