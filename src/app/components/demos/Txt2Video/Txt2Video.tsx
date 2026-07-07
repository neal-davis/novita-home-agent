import localforage from "localforage";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import { WarningDialog } from "@/components/ui/standard/warning-dialog";
import {
  CircleHelp as QuestionCircleOutlined,
  X as CloseOutlined,
} from "lucide-react";
import { ResponseCodeV3, APIErrReasonV3, Txt2VideoRequest } from "novita-sdk";
import FakeProgress from "fake-progress";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import styles from "./Txt2Video.module.scss";
import baseStyles from "../base.module.scss";
import { textToVideo, getFailMsgV3, checkProgressV3 } from "@/api/api";
import { TaskState, DemoProps } from "../DemoWrapper";
import PrimaryBtn from "../../button/Button";
import { getApiSource } from "@/constants/constants";
import { getGenBtnId } from "@/app/components/analytics/constants";
import Loading from "@/app/components/Loading/Loading";
import Txt2VideoPromptForm, {
  TOTAL_MAX_FRAME,
  MIN_CLIP_FRAME,
  MAX_CLIP_FRAME,
} from "./Txt2VideoPrompt";
import PromptInput from "../../input/PromptInput/PromptInput";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import Slider from "../../input/Slider/Slider";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import defaultCases from "../defaultCases";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { formatMoneyDisplay } from "@/lib/utils/money";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { calcPrice } from "@/lib/utils/pricing";
const MIN_WIDTH = 256;
const MAX_WIDTH = 1024;
const MIN_HEIGHT = 256;
const MAX_HEIGHT = 1024;
const Txt2VideoModel = [
  "darkSushiMixMix_225D_64380.safetensors",
  "dreamshaper_8_93211.safetensors",
  "realisticVisionV51_v51VAE_94301.safetensors",
  "epicrealism_naturalSin_121250.safetensors",
];
const DB_KEY_TASK_ID = "txt2video_task_id";
const DB_KEY_TASK_PROGRESS = "txt2video_task_progress";
const deleteTask = () => {
  localforage.removeItem(DB_KEY_TASK_ID);
  localforage.removeItem(DB_KEY_TASK_PROGRESS);
};
const saveTask = (taskId: string, progress?: number) => {
  localforage.setItem(DB_KEY_TASK_ID, taskId);
  if (progress) {
    localforage.setItem(DB_KEY_TASK_PROGRESS, progress);
  }
};
const useCases = defaultCases[FUNC_NAME.TXT2VIDEO];
export default function Txt2Video({
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
  const [model, setModel] = useState(useCases[0].model);
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);
  const [steps, setSteps] = useState(20);
  const [seed, setSeed] = useState(-1);
  const [negativePrompt, setNegativePrompt] = useState(
    "(worst quality:2), (low quality:2), (normal quality:2), ((monochrome)), ((grayscale)), bad hands",
  );
  const [prompts, setPrompts] = useState<
    {
      prompt: string;
      frames: number;
    }[]
  >(useCases[0].prompts);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultVideoUrl, setResultVideoUrl] = useState("");
  const [queueing, setQueueing] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [curCase, setCurCase] = useState(0);
  const aborter = useRef<AbortController | null>(null);
  const taskState = useRef(TaskState.init);
  const taskTimer = useRef<NodeJS.Timeout | null>(null);
  const curTaskId = useRef("");
  const taskP = useRef<any>(null);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const estimatePrice = useMemo(() => {
    return (
      calcPrice(FUNC_NAME.TXT2VIDEO, {
        frames: prompts.reduce((acc, cur) => acc + cur.frames, 0),
        steps,
      }).discountPrice ?? "-"
    );
  }, [prompts, steps]);
  const showWarning = (title: string, description: React.ReactNode) => {
    setWarningDialog({
      open: true,
      title,
      description,
    });
  };
  useEffect(() => {
    onParamChange?.("model_name", useCases[0].model);
    onParamChange?.("width", 640);
    onParamChange?.("height", 480);
    onParamChange?.("seed", -1);
    onParamChange?.("steps", 20);
    onParamChange?.("guidance_scale", 7.5);
    onParamChange?.("negative_prompt", negativePrompt);
    onParamChange?.("txt2video_prompts", useCases[0].prompts);
  }, [negativePrompt, onParamChange]);

  const cancelTask = useCallback(() => {
    showCancelConfirm?.(() => {
      aborter.current?.abort();
      aborter.current = null;
      setResultVideoUrl("");
      setGenerating(false);
      setQueueing(false);
      taskState.current = TaskState.init;
      taskP.current?.end();
      taskP.current = null;
      setTaskProgress(0);
      deleteTask();
    });
  }, [showCancelConfirm]);

  const refreshTaskProgress = useCallback(
    (percent: number, curProgress: number) => {
      let newProgress = curProgress;
      if (percent > 30) {
        if (percent > curProgress) {
          setTaskProgress(percent);
          saveTask(curTaskId.current, percent);
          newProgress = percent;
        }
        taskP.current?.end();
        taskP.current = null;
      } else if (taskP.current) {
        const progress = Math.floor(taskP.current?.progress * 100);
        if (progress < curProgress) {
          const newProgress =
            curProgress + Math.floor(progress * ((100 - curProgress) / 100));
          setTaskProgress(newProgress);
          saveTask(curTaskId.current, newProgress);
        } else {
          setTaskProgress(progress);
          saveTask(curTaskId.current, progress);
          newProgress = progress;
        }
      }
      return newProgress;
    },
    [],
  );
  const checkProgress = useCallback(
    (apiKey: string, curProgress?: number) => {
      if (!apiKey) {
        return;
      }
      const onFinish = (videoUrls: string[]) => {
        if (taskState.current !== TaskState.init) {
          setGenerating(false);
          taskState.current = TaskState.finished;
          setResultVideoUrl(videoUrls[0]);
          dispatch(fetchBalanceDetail() as any);
        }
        setQueueing(false);
        clearTimeout(taskTimer.current as NodeJS.Timeout);
        taskTimer.current = null;
        taskP.current?.end();
        taskP.current = null;
        setTaskProgress(0);
        deleteTask();
      };
      const onFail = (code: number, reason?: string, msg?: string) => {
        console.error("check task progress failed!", code, reason, msg);
        if (taskState.current !== TaskState.init) {
          if (code === -10 || reason === "ERR_NETWORK") {
            return;
          }
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
        }
        if (code === ResponseCodeV3.CANCELED) {
          message.warning(getFailMsgV3(code));
        }
        clearTimeout(taskTimer.current as NodeJS.Timeout);
        taskTimer.current = null;
        cancelTask();
      };
      if (!curTaskId.current) {
        onFail(-1, "Empty task id");
        return;
      }
      checkProgressV3(
        apiKey,
        curTaskId.current,
        {
          source: getApiSource(rootPage),
          abortSignal: aborter.current?.signal,
        },
        {
          onQueue: () => {
            setQueueing(true);
            taskTimer.current = setTimeout(() => {
              checkProgress(apiKey, taskProgress);
            }, 5000);
          },
          onProgress: (_: string[], percent: number) => {
            setQueueing(false);
            if (!curProgress) {
              curProgress = taskProgress;
            }
            const newP = refreshTaskProgress(percent, curProgress);
            taskTimer.current = setTimeout(() => {
              checkProgress(apiKey, newP);
            }, 5000);
          },
          onFinish,
          onFail,
        },
      );
    },
    [
      rootPage,
      dispatch,
      cancelTask,
      onNeedLogin,
      onLowBalance,
      taskProgress,
      refreshTaskProgress,
    ],
  );
  const startSyncTask = useCallback(
    (taskId: string, apiKey: string, curProgress?: number) => {
      if (!aborter.current) {
        aborter.current = new AbortController();
      }
      setGenerating(true);
      setHasStartedGenerate(true);
      setTaskId(taskId);
      taskState.current = TaskState.generating;
      curTaskId.current = taskId;
      taskP.current = new FakeProgress({
        timeConstant: Math.round(
          (1000 * 60 * 3 + 1000 * 60 * Math.random() * 3) / 2,
        ),
        autoStart: true,
      });
      checkProgress(apiKey, curProgress);
      aborter.current?.signal.addEventListener("abort", () => {
        clearTimeout(taskTimer.current as NodeJS.Timeout);
      });
    },
    [checkProgress],
  );
  const restoreTask = useCallback(
    (apiKey: string) => {
      localforage.getItem<string>(DB_KEY_TASK_ID).then((taskId) => {
        if (taskId) {
          localforage.getItem<number>(DB_KEY_TASK_PROGRESS).then((progress) => {
            if (progress) {
              setTaskProgress(progress);
              startSyncTask(taskId, apiKey, progress);
            } else {
              startSyncTask(taskId, apiKey);
            }
          });
        }
      });
    },
    [startSyncTask],
  );
  useEffect(() => {
    if (apiKey && !taskTimer.current) {
      restoreTask(apiKey);
    }
  }, [apiKey, restoreTask]);
  const handleGenerate = useCallback(async () => {
    if (userState === UserState.logout) {
      onNeedLogin();
      return;
    }
    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }
    const sumFrames = prompts.reduce((acc, cur) => acc + cur.frames, 0);
    let warnTxt = "";
    if (prompts.length === 0) {
      warnTxt = "Prompt is empty";
    }
    if (sumFrames > TOTAL_MAX_FRAME) {
      warnTxt = `${"The sum of the frames should be less than or equal to"} ${TOTAL_MAX_FRAME}`;
    }
    if (sumFrames === 0) {
      warnTxt = "The sum of the frames should be greater than 0";
    }
    prompts.forEach((p) => {
      if (!p.prompt) {
        warnTxt = "There are empty prompt values.";
      }
    });
    if (warnTxt) {
      showWarning("Prompts invalid!", <p>{warnTxt}</p>);
      return;
    }
    setGenerating(true);
    taskState.current = TaskState.generating;
    aborter.current = new AbortController();
    setResultVideoUrl("");
    const onFinish = (taskId: string) => {
      if (taskState.current !== TaskState.init) {
        curTaskId.current = taskId;
        dispatch(fetchBalanceDetail() as any);
        saveTask(taskId);
        startSyncTask(taskId, apiKey);
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
        cancelTask();
      }
    };
    const data: Txt2VideoRequest = {
      model_name: model,
      width,
      height,
      seed,
      steps,
      prompts: prompts,
      guidance_scale: guidanceScale,
      extra: {
        enterprise_plan: {
          enabled: enterprisePlanTipsUtils.isUseEnterprise(),
        },
      },
    };
    if (negativePrompt) {
      data.negative_prompt = negativePrompt;
    }
    textToVideo(apiKey, data, onFinish, onFail, {
      source: getApiSource(rootPage),
      abortSignal: aborter.current?.signal,
    });
  }, [
    userState,
    prompts,
    model,
    width,
    height,
    seed,
    steps,
    guidanceScale,
    negativePrompt,
    apiKey,
    rootPage,
    onNeedLogin,
    dispatch,
    startSyncTask,
    cancelTask,
    onLowBalance,
  ]);
  return (
    <DemoWrapper
      rootPage={rootPage}
      funcInfo={funcInfo}
      formWidth={420}
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
          <div className={baseStyles.showcase_box}>
            <label className={baseStyles.cases_title}>{"Showcase"}</label>
            <div className={baseStyles.cases_wrapper}>
              {useCases.map((item, index) => (
                <div
                  key={index}
                  className={`
                    ${baseStyles.case_item}
                    ${curCase === index ? baseStyles.case_item_active : ""}
                    ${generating ? baseStyles.case_item_disabled : ""}
                    ${baseStyles.case_item_text}
                  `}
                  onClick={() => {
                    if (generating) {
                      return;
                    }
                    setCurCase(index);
                    setPrompts(item.prompts);
                    setModel(item.model);
                  }}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
          <div className={baseStyles.form_item}>
            <label>{"Model"}</label>
            <Select
              disabled={generating || queueing}
              className={styles.model_selector}
              options={Txt2VideoModel.map((m) => ({ label: m, value: m }))}
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
          <div className={baseStyles.form_item}>
            <label>
              {"Prompt"}
              <Tooltip
                title={`The total number of frames should be less than or equal to ${TOTAL_MAX_FRAME}, and the number of frames in each clip should be between ${MIN_CLIP_FRAME} and ${MAX_CLIP_FRAME}.`}
              >
                <QuestionCircleOutlined size={14} style={{ marginLeft: 6 }} />
              </Tooltip>
            </label>
            <Txt2VideoPromptForm
              loading={generating || queueing}
              params={prompts}
              onFocus={() => {
                onParamFocus?.("txt2video_prompts");
              }}
              onBlur={() => {
                onParamBlur?.("txt2video_prompts");
              }}
              onChange={(value) => {
                onParamChange?.("txt2video_prompts", value);
                setPrompts(value);
              }}
            />
          </div>
          <div className={baseStyles.form_item}>
            <label>{"Negative Prompt"}:</label>
            <PromptInput
              disabled={generating || queueing}
              value={negativePrompt}
              setValue={setNegativePrompt}
              large={false}
              maxLine={3}
              placeholder={"What you want to avoid generating..."}
              onFocus={() => {
                onParamFocus?.("negative_prompt");
              }}
              onBlur={() => {
                onParamBlur?.("negative_prompt");
              }}
              onChange={(val: string) => {
                onParamChange?.("negative_prompt", val);
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
              onParamChange?.("width", val);
            }}
            onFocus={() => {
              onParamFocus?.("width");
            }}
            onBlur={() => {
              onParamBlur?.("width");
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
              onParamChange?.("height", val);
            }}
            onFocus={() => {
              onParamFocus?.("height");
            }}
            onBlur={() => {
              onParamBlur?.("height");
            }}
          />
          <Slider
            label={"Guidance Scale"}
            disabled={generating}
            withInput={true}
            min={1}
            max={30}
            step={0.1}
            value={guidanceScale}
            onChange={(val) => {
              setGuidanceScale(val);
              onParamChange?.("guidance_scale", val);
            }}
            onFocus={() => {
              onParamFocus?.("guidance_scale");
            }}
            onBlur={() => {
              onParamBlur?.("guidance_scale");
            }}
          />
          <Slider
            label={"Steps"}
            disabled={generating}
            withInput={true}
            min={1}
            max={30}
            step={0.1}
            value={steps}
            onChange={(val) => {
              setSteps(val);
              onParamChange?.("steps", val);
            }}
            onFocus={() => {
              onParamFocus?.("steps");
            }}
            onBlur={() => {
              onParamBlur?.("steps");
            }}
          />
          <div className={baseStyles.form_item}>
            <label>{"Seed"}:</label>
            <NumberInput
              disabled={generating || queueing}
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
            loading={generating || queueing}
            disabled={prompts.length === 0}
          >
            {"Generate"}
          </PrimaryBtn>
          {(generating || queueing) && (
            <Button
              ghost={true}
              className={baseStyles.cancel_btn}
              onClick={cancelTask}
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
        <div
          className={`${styles.video_wrapper} ${rootPage === "product" ? styles.video_wrapper_in_product : ""}`}
        >
          {resultVideoUrl && (
            <video controls className={styles.video} src={resultVideoUrl} />
          )}
          {(generating || queueing) && (
            <div className={styles.result_video_placeholder}>
              <Loading
                text={
                  queueing
                    ? "Queueing..."
                    : `${"Processing..."} ${taskProgress}%`
                }
                desc={
                  "This task may take some time (a few minutes), please be patient."
                }
                extra={
                  <Button
                    shape="circle"
                    className={styles.cancel_btn}
                    onClick={() => {
                      cancelTask();
                    }}
                    icon={<CloseOutlined />}
                  ></Button>
                }
              />
            </div>
          )}
          {!resultVideoUrl && !generating && (
            <ImagePlaceholder noborder large />
          )}
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
