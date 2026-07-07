import { useState, useRef, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import styles from "./MixPose.module.css";
import baseStyles from "../base.module.scss";
import { mixpose, getFailMsgV3 } from "@/api/api";
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
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
export default function MixPose(props: DemoProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [poseImgSrc, setPoseImgSrc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const aborter = useRef<AbortController | null>(null);
  const taskState = useRef(TaskState.init);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onParamBlur, onParamChange, onParamFocus } = props;
  useEffect(() => {
    onParamChange?.("image_file", "");
    onParamChange?.("pose_image_file", "");
  }, [onParamChange]);
  useEffect(() => {
    onParamFocus?.("image_file");
    onParamChange?.("image_file", imgSrc);
    setTimeout(() => {
      onParamBlur?.("image_file");
    }, 1000);
  }, [imgSrc, onParamBlur, onParamChange, onParamFocus]);
  useEffect(() => {
    onParamFocus?.("pose_image_file");
    onParamChange?.("pose_image_file", poseImgSrc);
    setTimeout(() => {
      onParamBlur?.("pose_image_file");
    }, 1000);
  }, [poseImgSrc, onParamBlur, onParamChange, onParamFocus]);
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
    const onFinish = (img: string, taskId: string) => {
      setTaskId(taskId);
      if (taskState.current !== TaskState.init) {
        setGenerating(false);
        taskState.current = TaskState.finished;
        setResultImgUrl(img);
        dispatch(fetchBalanceDetail() as any);
      }
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
        taskState.current = TaskState.init;
        setResultImgUrl("");
      }
      if (code === ResponseCodeV3.CANCELED) {
        message.warning(getFailMsgV3(code));
      }
    };
    mixpose(
      props.apiKey,
      {
        image_file: imgSrc,
        pose_image_file: poseImgSrc,
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
      formWidth={400}
      formContent={
        <>
          <div className={styles.dragger_wrapper}>
            <Dragger
              disabled={generating}
              className={styles.dragger}
              restrictions={{
                maxSize: MAX_IMAGE_SIZE,
                maxWidth: MAX_WIDTH,
                maxHeight: MAX_HEIGHT,
              }}
              onUpload={(url: string) => {
                setImgSrc(url || "");
              }}
              text={"Upload base image"}
            />
            <Dragger
              disabled={generating}
              className={styles.dragger}
              restrictions={{
                maxSize: MAX_IMAGE_SIZE,
                maxWidth: MAX_WIDTH,
                maxHeight: MAX_HEIGHT,
              }}
              onUpload={(url: string) => {
                setPoseImgSrc(url || "");
              }}
              text={"Upload pose image"}
            />
          </div>
          <div className={baseStyles.btn_group_vertical}>
            <PrimaryBtn
              type="secondary"
              className={`${baseStyles.gen_btn} primary-btn`}
              id={getGenBtnId(props.rootPage)}
              elAttrs={{
                "data-gtm-product-name": props.funcInfo.name,
              }}
              onClick={handleGenerate}
              loading={generating}
              disabled={!imgSrc || !poseImgSrc}
            >
              {"Generate"}
            </PrimaryBtn>
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
        </>
      }
      resultContent={
        <div className={styles.preview_img_wrapper}>
          {!resultImgUrl && <ImagePlaceholder noborder large />}
          {resultImgUrl && (
            <div className={styles.preview_img_container}>
              <AutoHeightImage
                maxHeight={props.rootPage === "product" ? 512 : undefined}
                className={`${styles.preview_img} ${styles.preview_img_result}`}
                src={resultImgUrl}
                alt="img"
                loading={generating}
              />
            </div>
          )}
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
