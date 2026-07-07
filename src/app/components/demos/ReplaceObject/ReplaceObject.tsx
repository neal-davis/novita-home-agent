import { useState, useRef, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import {
  Eye as EyeOutlined,
  EyeOff as EyeInvisibleOutlined,
} from "lucide-react";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import "../demo-global.css";
import styles from "./ReplaceObject.module.css";
import baseStyles from "../base.module.scss";
import { getFailMsgV3, replaceObjectWithProgress } from "@/api/api";
import Dragger from "@/app/components/dragger/Dragger";
import PromptInput from "../../input/PromptInput/PromptInput";
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
export default function ReplaceObject(props: DemoProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [objectPrompt, setObjectPrompt] = useState<string>("");
  const [newObjectprompt, setNewObjectPrompt] = useState<string>("");
  const [negtivePrompt, setNegtivePrompt] = useState<string>("");
  const [calling, setCalling] = useState(false);
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
    onParamChange?.("object_prompt", objectPrompt);
    onParamChange?.("prompt", newObjectprompt);
    onParamChange?.("negative_prompt", negtivePrompt);
  }, [negtivePrompt, newObjectprompt, objectPrompt, onParamChange]);
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
    if (!objectPrompt) {
      message.error(
        "Please enter the description of the object you want to replace",
      );
      return;
    }
    if (!newObjectprompt) {
      message.error(
        "Please enter the description of the new object you want to generate",
      );
      return;
    }
    if (
      taskState.current === TaskState.loading ||
      taskState.current === TaskState.generating
    ) {
      return;
    }
    taskState.current = TaskState.generating;
    setHasStartedGenerate(true);
    setCalling(true);
    aborter.current = new AbortController();
    setResultImgUrl("");
    setShowOrigin(false);
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
    const onFail = (code: number, reason?: string, msg?: string) => {
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
    replaceObjectWithProgress(
      props.apiKey,
      {
        image_file: imgSrc,
        object_prompt: objectPrompt,
        prompt: newObjectprompt,
        negative_prompt: negtivePrompt,
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
            disabled={calling || generating}
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
            <label>{"Object Prompt"}:</label>
            <PromptInput
              disabled={calling || generating}
              value={objectPrompt}
              setValue={setObjectPrompt}
              placeholder={
                "Description of the object in the image you want to replace"
              }
              maxLine={3}
              onChange={(val) => {
                props.onParamChange?.("object_prompt", val);
              }}
              onFocus={() => {
                props.onParamFocus?.("object_prompt");
              }}
              onBlur={() => {
                props.onParamBlur?.("object_prompt");
              }}
            />
          </div>
          <div className={baseStyles.form_item}>
            <label>{"Replace Prompt"}:</label>
            <PromptInput
              disabled={calling || generating}
              value={newObjectprompt}
              setValue={setNewObjectPrompt}
              placeholder={
                "Description of the new object you want to put in the image"
              }
              maxLine={3}
              onChange={(val) => {
                props.onParamChange?.("prompt", val);
              }}
              onFocus={() => {
                props.onParamFocus?.("prompt");
              }}
              onBlur={() => {
                props.onParamBlur?.("prompt");
              }}
            />
          </div>
          <div className={baseStyles.form_item}>
            <label>{"Negative Prompt"}:</label>
            <PromptInput
              disabled={calling || generating}
              value={negtivePrompt}
              setValue={setNegtivePrompt}
              placeholder={"What you want to avoid generating..."}
              maxLine={3}
              onChange={(val) => {
                props.onParamChange?.("negative_prompt", val);
              }}
              onFocus={() => {
                props.onParamFocus?.("negative_prompt");
              }}
              onBlur={() => {
                props.onParamBlur?.("negative_prompt");
              }}
            />
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
            disabled={!objectPrompt || !newObjectprompt || !imgSrc}
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
          {resultImgUrl && taskState.current === TaskState.finished && (
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
              {resultImgUrl && taskState.current === TaskState.finished && (
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
                className={styles.preview_img}
                style={{
                  visibility:
                    !resultImgUrl || showOrigin ? "visible" : "hidden",
                }}
                src={imgSrc}
                alt="img"
                loading={calling || generating}
              />
              {resultImgUrl && (
                <AutoHeightImage
                  maxHeight={props.rootPage === "product" ? 512 : undefined}
                  className={`${styles.preview_img} ${styles.preview_img_result}`}
                  style={{
                    visibility: showOrigin ? "hidden" : "visible",
                    position: "absolute",
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
