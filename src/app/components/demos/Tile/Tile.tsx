import { useRef, useState, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import styles from "./Tile.module.css";
import baseStyles from "../base.module.scss";
import { createTile, getFailMsgV3 } from "@/api/api";
import PromptInput from "@/app/components/input/PromptInput/PromptInput";
import { TaskState, DemoProps } from "../DemoWrapper";
import { getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import AutoHeightImage from "../AutoHeightImage";
import { downloadImage } from "@/lib/utils/media";
import PrimaryBtn from "../../button/Button";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import Slider from "../../input/Slider/Slider";
import PreviewImage from "../ImagePlaceholder/PreviewImage";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
const MIN_WIDTH = 128;
const MIN_HEIGHT = 128;
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
export default function Tile(props: DemoProps) {
  const [prompt, setPrompt] = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState<string>("");
  const aborter = useRef<AbortController | null>(null);
  const taskState = useRef(TaskState.init);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onParamChange } = props;
  useEffect(() => {
    onParamChange?.("prompt", prompt);
    onParamChange?.("negative_prompt", negPrompt);
    onParamChange?.("width", width);
    onParamChange?.("height", height);
  }, [height, negPrompt, onParamChange, prompt, width]);
  const handleGenerate = async () => {
    if (userState === UserState.logout) {
      props.onNeedLogin();
      return;
    }
    if (!prompt) {
      message.error("Prompt is empty");
    }
    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }
    taskState.current = TaskState.generating;
    setHasStartedGenerate(true);
    setGenerating(true);
    setResultImgUrl("");
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
    createTile(
      props.apiKey,
      {
        prompt,
        negative_prompt: negPrompt,
        width,
        height,
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
          <div className={baseStyles.form_item}>
            <label>{"Prompt"}:</label>
            <PromptInput
              value={prompt}
              setValue={setPrompt}
              maxLine={6}
              placeholder={"Description of the tile you want to generate"}
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
          </div>
          <div className={baseStyles.form_item}>
            <label>{"Negative Prompt"}:</label>
            <PromptInput
              value={negPrompt}
              setValue={setNegPrompt}
              maxLine={3}
              placeholder={
                "Description of the tile that you want to avoid generating"
              }
              onFocus={() => {
                props.onParamFocus?.("negative_prompt");
              }}
              onBlur={() => {
                props.onParamBlur?.("negative_prompt");
              }}
              onChange={(val: string) => {
                props.onParamChange?.("negative_prompt", val);
              }}
            />
          </div>
          <Slider
            label={"Width"}
            disabled={generating}
            withInput={true}
            min={MIN_WIDTH}
            max={MAX_WIDTH}
            step={1}
            value={width}
            onChange={(val) => {
              setWidth(val);
              props.onParamChange?.("width", val);
            }}
            onFocus={() => {
              props.onParamFocus?.("width");
            }}
            onBlur={() => {
              props.onParamBlur?.("width");
            }}
          />
          <Slider
            label={"Heigh"}
            disabled={generating}
            withInput={true}
            min={MIN_HEIGHT}
            max={MAX_HEIGHT}
            step={1}
            value={height}
            onChange={(val) => {
              setHeight(val);
              props.onParamChange?.("height", val);
            }}
            onFocus={() => {
              props.onParamFocus?.("height");
            }}
            onBlur={() => {
              props.onParamBlur?.("height");
            }}
          />
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
              disabled={!prompt}
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
          {!resultImgUrl && (
            <PreviewImage large noborder loading={generating} />
          )}
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
