import { useState, useRef, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import {
  Eye as EyeOutlined,
  EyeOff as EyeInvisibleOutlined,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import styles from "./RemoveWatermark.module.css";
import baseStyles from "../base.module.scss";
import { removeWatermark, getFailMsgV3 } from "@/api/api";
import Dragger from "@/app/components/dragger/Dragger";
import { TaskState, DemoProps } from "../DemoWrapper";
import { MAX_IMAGE_SIZE, getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import { downloadImage } from "@/lib/utils/media";
import AutoHeightImage from "../AutoHeightImage";
import PrimaryBtn from "../../button/Button";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
const MAX_RES = 1024 * 1024;
export default function RemoveWatermark(props: DemoProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const [showOrigin, setShowOrigin] = useState(false);
  const aborter = useRef<AbortController | null>(null);
  const taskState = useRef(TaskState.init);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onParamBlur, onParamChange, onParamFocus } = props;
  useEffect(() => {
    onParamFocus?.("image_file");
    onParamChange?.("image_file", imgSrc);
    setTimeout(() => {
      onParamBlur?.("image_file");
    }, 1000);
    if (imgSrc) {
      setResultImgUrl("");
      setShowOrigin(false);
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
    setGenerating(true);
    setHasStartedGenerate(true);
    aborter.current = new AbortController();
    const onFinish = (img: string, taskId?: string) => {
      setTaskId(taskId || "");
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
          props.onNeedLogin();
        } else if (
          code === ResponseCodeV3.REQUEST_INVALID &&
          reason === APIErrReasonV3.BALANCE_NOT_ENOUGH
        ) {
          props.onLowBalance();
        } else {
          message.error(getFailMsgV3(code, reason, msg));
        }
        setResultImgUrl("");
        setGenerating(false);
        taskState.current = TaskState.init;
      }
      if (code === ResponseCodeV3.CANCELED) {
        message.warning(getFailMsgV3(code));
      }
      dispatch(fetchBalanceDetail() as any);
    };
    removeWatermark(
      props.apiKey,
      {
        image_file: imgSrc,
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
          <Dragger
            disabled={generating}
            restrictions={{
              maxSize: MAX_IMAGE_SIZE,
              maxRes: MAX_RES,
            }}
            onUpload={(url: string) => {
              setImgSrc(url || "");
            }}
          />
          <div className={baseStyles.btn_group_vertical}>
            {!resultImgUrl && (
              <PrimaryBtn
                type="secondary"
                className={baseStyles.gen_btn}
                id={getGenBtnId(props.rootPage)}
                elAttrs={{
                  "data-gtm-product-name": props.funcInfo.name,
                }}
                onClick={handleGenerate}
                loading={generating}
                disabled={!imgSrc}
              >
                {"Generate"}
              </PrimaryBtn>
            )}
            {resultImgUrl && !generating && (
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
            {generating && (
              <Button
                ghost={true}
                className={baseStyles.cancel_btn}
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
          </div>
        </>
      }
      resultContent={
        <div className={styles.preview_img_wrapper}>
          {!imgSrc && <ImagePlaceholder large noborder />}
          {imgSrc && (
            <div className={styles.preview_img_container}>
              {resultImgUrl && (
                <Tooltip title={showOrigin ? "Show changes" : "Hide changes"}>
                  <Button
                    className={baseStyles.show_ori_img}
                    shape="circle"
                    icon={
                      showOrigin ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                    onClick={() => {
                      setShowOrigin(!showOrigin);
                    }}
                  />
                </Tooltip>
              )}
              <AutoHeightImage
                maxHeight={props.rootPage === "product" ? 512 : undefined}
                className={`${styles.preview_img} ${styles.preview_img_origin}`}
                style={{
                  visibility:
                    !resultImgUrl || showOrigin ? "visible" : "hidden",
                }}
                src={imgSrc}
                alt="img"
                loading={generating}
              />
              {resultImgUrl && (
                <img
                  className={`${styles.preview_img} ${styles.preview_img_result}`}
                  style={{
                    visibility: showOrigin ? "hidden" : "visible",
                  }}
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
