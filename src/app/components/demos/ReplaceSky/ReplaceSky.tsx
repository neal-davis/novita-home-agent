import { useState, useRef, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import {
  Eye as EyeOutlined,
  EyeOff as EyeInvisibleOutlined,
} from "lucide-react";
import { ResponseCodeV3, APIErrReasonV3, SkyType } from "novita-sdk";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import "../demo-global.css";
import styles from "./ReplaceSky.module.css";
import baseStyles from "../base.module.scss";
import { replaceSky, getFailMsgV3 } from "@/api/api";
import Dragger from "@/app/components/dragger/Dragger";
import { TaskState, DemoProps } from "../DemoWrapper";
import { MAX_IMAGE_SIZE, getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import PrimaryBtn from "../../button/Button";
import { downloadImage } from "@/lib/utils/media";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
export default function ReplaceSky(props: DemoProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [sky, setSky] = useState<SkyType>(SkyType.bluesky);
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
    onParamChange?.("image_file", "");
    onParamChange?.("sky", sky);
  }, [onParamChange, sky]);
  useEffect(() => {
    onParamFocus?.("image_file");
    onParamChange?.("image_file", imgSrc);
    setTimeout(() => {
      onParamBlur?.("image_file");
    }, 1000);
    onParamChange?.("sky", sky);
    if (imgSrc) {
      setResultImgUrl("");
      setShowOrigin(false);
    }
  }, [imgSrc, onParamBlur, onParamChange, onParamFocus, sky]);
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
    replaceSky(
      props.apiKey,
      {
        image_file: imgSrc,
        sky: sky,
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
              maxWidth: MAX_WIDTH,
              maxHeight: MAX_HEIGHT,
            }}
            onUpload={(url: string) => {
              setImgSrc(url || "");
            }}
          />
          <div className={baseStyles.form_item}>
            <Select
              className={`${styles.sky_selector}`}
              value={sky}
              options={(Object.values(SkyType) as Array<string>).map((k) => ({
                label: k,
                value: k,
              }))}
              onChange={(val) => {
                props.onParamChange?.("sky", val);
                setSky(val);
              }}
              disabled={generating}
              onFocus={() => {
                props.onParamFocus?.("sky");
              }}
              onBlur={() => {
                props.onParamBlur?.("sky");
              }}
            />
          </div>
          <div className={baseStyles.btn_group_vertical}>
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
          </div>
        </>
      }
      resultContent={
        <div className={styles.preview_img_wrapper}>
          {!imgSrc && <ImagePlaceholder large noborder />}
          <div className={styles.preview_img_container}>
            {imgSrc && (
              <img
                className={`${styles.preview_img} ${styles.preview_img_origin}`}
                style={{
                  visibility:
                    !resultImgUrl || showOrigin ? "visible" : "hidden",
                }}
                src={imgSrc}
                alt="img"
              />
            )}
            {resultImgUrl && (
              <Tooltip title={showOrigin ? "Show changes" : "Hide changes"}>
                <Button
                  className={baseStyles.show_ori_img}
                  shape="circle"
                  icon={showOrigin ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  onClick={() => {
                    setShowOrigin(!showOrigin);
                  }}
                />
              </Tooltip>
            )}
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
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
