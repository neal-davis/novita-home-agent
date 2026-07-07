import { useState, useRef, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import {
  ArrowLeft as ArrowLeftOutlined,
  Undo2 as UndoOutlined,
  Redo2 as RedoOutlined,
  Eraser as ClearOutlined,
} from "lucide-react";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import styles from "./Doodle.module.css";
import baseStyles from "../base.module.scss";
import { doodle, getFailMsgV3 } from "@/api/api";
import Drawer, { DrawerMethods } from "../../../components/Drawer/Drawer";
import PromptInput from "@/app/components/input/PromptInput/PromptInput";
import { TaskState, DemoProps } from "../DemoWrapper";
import { getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import { downloadImage } from "@/lib/utils/media";
import AutoHeightImage from "../AutoHeightImage";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import Slider from "@/app/components/input/Slider/Slider";
import PrimaryButton from "@/app/components/button/Button";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
export default function Doodle(props: DemoProps) {
  const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [similarity, setSimilarity] = useState(0.8);
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const [canGenerate, setCanGenerate] = useState(false);
  const aborter = useRef<AbortController | null>(null);
  const drawerRef = useRef<DrawerMethods>(null);
  const doodleImg = useRef("");
  const taskState = useRef(TaskState.init);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onParamBlur, onParamChange, onParamFocus } = props;
  useEffect(() => {
    onParamChange?.("image_file", "");
    onParamChange?.("prompt", "");
    onParamChange?.("similarity", similarity);
  }, [onParamChange, similarity]);
  useEffect(() => {
    onParamFocus?.("image_file");
    onParamChange?.("image_file", doodleImg.current || "");
    setTimeout(() => {
      onParamBlur?.("image_file");
    }, 1000);
  }, [onParamBlur, onParamChange, onParamFocus]);
  const handleGenerate = async (doodleImage: string) => {
    if (userState === UserState.logout) {
      props.onNeedLogin();
      return;
    }
    if (!prompt) {
      message.error("Prompt is empty");
      return;
    }
    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }
    doodleImg.current = doodleImage;
    setGenerating(true);
    setHasStartedGenerate(true);
    taskState.current = TaskState.generating;
    aborter.current = new AbortController();
    const onFinish = (img: string, taskId: string) => {
      setTaskId(taskId);
      if (taskState.current !== TaskState.init) {
        taskState.current = TaskState.finished;
        setGenerating(false);
        setResultImgUrl(img);
        setStep(1);
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
        message.warning(getFailMsgV3(code, reason, msg));
      }
      dispatch(fetchBalanceDetail() as any);
    };
    doodle(
      props.apiKey,
      {
        image_file: doodleImage,
        prompt: prompt,
        similarity: similarity,
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
            <div className={baseStyles.icon_btn_group}>
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
            </div>
          </div>
          <div className={baseStyles.form_item}>
            <label>{"Prompt"}:</label>
            <PromptInput
              // className={`${styles.prompt_input} scrollBar_container`}
              value={prompt}
              setValue={setPrompt}
              maxLine={4}
              onFocus={() => {
                props.onParamFocus?.("prompt");
              }}
              onBlur={() => {
                props.onParamBlur?.("prompt");
              }}
              onChange={(value) => {
                props.onParamChange?.("prompt", value);
              }}
              key="prompt-input"
            />
          </div>
          <Slider
            label={"Similarity"}
            disabled={generating}
            min={0}
            max={1}
            step={0.01}
            value={similarity}
            onChange={(value) => {
              setSimilarity(value);
              props.onParamChange?.("similarity", value);
            }}
            onFocus={() => {
              props.onParamFocus?.("similarity");
            }}
            onBlur={() => {
              props.onParamBlur?.("similarity");
            }}
          />
          <div
            className={`${baseStyles.form_item} ${baseStyles.btn_group_vertical}`}
          >
            <PrimaryButton
              type="primary"
              className={baseStyles.gen_btn}
              id={getGenBtnId(props.rootPage)}
              elAttrs={{
                "data-gtm-product-name": props.funcInfo.name,
              }}
              onClick={async () => {
                const maskImg = await drawerRef.current?.getMaskImg();
                if (!maskImg) {
                  return;
                }
                handleGenerate(maskImg);
              }}
              loading={generating}
              disabled={!canGenerate || !prompt || step === 1}
            >
              {"Generate"}
            </PrimaryButton>
            {generating && (
              <Button
                block
                ghost
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
        </>
      }
      resultContent={
        <div className={styles.doodle_wrapper}>
          <Drawer
            ref={drawerRef}
            rootPage={props.rootPage}
            disabled={!prompt}
            brushSize={10}
            brushColor="#000"
            width={512}
            height={512}
            canvasWidth={512}
            canvasHeight={512}
            resultImage={""}
            canScale={false}
            canDrag={false}
            loading={generating}
            onGenerate={handleGenerate}
            setCanGenerate={(v) => {
              setCanGenerate(v);
            }}
            onAbort={() => {
              aborter.current?.abort();
              aborter.current = null;
              setGenerating(false);
              taskState.current = TaskState.init;
            }}
          ></Drawer>
          {step === 1 && (
            <div
              className={[
                styles.preview_wrapper,
                props.rootPage === "product" && styles.preview_in_product,
                props.rootPage === "playground" && styles.preview_in_playground,
              ].join(" ")}
            >
              <div className={styles.preview_img_container}>
                <Button
                  className={styles.back_btn}
                  onClick={() => {
                    aborter.current?.abort();
                    aborter.current = null;
                    setStep(0);
                    setGenerating(false);
                    setResultImgUrl("");
                    taskState.current = TaskState.init;
                  }}
                  icon={<ArrowLeftOutlined />}
                >
                  {"Back"}
                </Button>
                <AutoHeightImage
                  maxHeight={props.rootPage === "product" ? 512 : undefined}
                  className={`${styles.preview_img} ${styles.preview_img_result}`}
                  src={resultImgUrl}
                  alt="img"
                  loading={generating}
                />
              </div>
            </div>
          )}
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
