import localforage from "localforage";
import { useState, useRef, useEffect, useCallback } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { NumberInput } from "@/components/ui/standard/number-input";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import FakeProgress from "fake-progress";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import styles from "./MotionSync.module.scss";
import baseStyles from "../base.module.scss";
import {
  imageToVideoMotion,
  animateAnyone,
  getFailMsgV3,
  checkProgressV3,
} from "@/api/api";
import Dragger, { DraggerMethods } from "@/app/components/dragger/Dragger";
import { TaskState, DemoProps } from "../DemoWrapper";
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  getApiSource,
} from "@/constants/constants";
import { getGenBtnId } from "@/app/components/analytics/constants";
import PrimaryBtn from "../../button/Button";
import Loading from "@/app/components/Loading/Loading";
import MotionVideo from "./MotionVideo";
import BaseImage from "./BaseImage";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import AutoHeightImage from "../AutoHeightImage";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import Slider from "../../input/Slider/Slider";
import { FUNC_NAME } from "@/app/models/constants/funcs";
const BASE_IMAGE_JSON =
  "https://faas-static-assets.s3.ap-southeast-1.amazonaws.com/metadata/img2video_motion.json";
const BASE_IMAGE_JSON_AA =
  "https://faas-static-assets.s3.ap-southeast-1.amazonaws.com/metadata/animate_anyone.json";
const DB_KEY_TASK_ID = "img2video_motion_task_id";
const DB_KEY_TASK_PROGRESS = "img2video_motion_task_progress";
const DB_KEY_TASK_ID_AA = "animate_anyone_task_id";
const DB_KEY_TASK_PROGRESS_AA = "animate_anyone_task_progress";
const MIN_WIDTH = 128;
const MIN_HEIGHT = 128;
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const deleteTask = (func: string) => {
  if (func === FUNC_NAME.ANIMATE_ANYONE) {
    localforage.removeItem(DB_KEY_TASK_ID_AA);
    localforage.removeItem(DB_KEY_TASK_PROGRESS_AA);
  }
  if (func === FUNC_NAME.MOTIONSYNC) {
    localforage.removeItem(DB_KEY_TASK_ID);
    localforage.removeItem(DB_KEY_TASK_PROGRESS);
  }
};
const saveTask = (func: string, taskId: string, progress?: number) => {
  if (func === FUNC_NAME.ANIMATE_ANYONE) {
    localforage.setItem(DB_KEY_TASK_ID_AA, taskId);
    if (progress) {
      localforage.setItem(DB_KEY_TASK_PROGRESS_AA, progress);
    }
  }
  if (func === FUNC_NAME.MOTIONSYNC) {
    localforage.setItem(DB_KEY_TASK_ID, taskId);
    if (progress) {
      localforage.setItem(DB_KEY_TASK_PROGRESS, progress);
    }
  }
};
type Asset = {
  url: string;
  assetsId: string;
};
export default function MotionSync({
  funcName,
  ...props
}: DemoProps & {
  funcName: string;
}) {
  const [imgSrc, setImgSrc] = useState("");
  const [queueing, setQueueing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultVideoUrl, setResultVideoUrl] = useState("");
  const [seed, setSeed] = useState(-1);
  const [imgAssetId, setImgAssetId] = useState("");
  const [motionVideoAssetId, setMotionVideoAssetId] = useState("");
  const [animatePoseAssetId, setAnimatePoseAssetId] = useState("");
  const [taskProgress, setTaskProgress] = useState(0);
  const [exampleBaseImgs, setExampleBaseImgs] = useState<Asset[]>([]);
  const [exampleMotionVideos, setExampleMotionVideos] = useState<Asset[]>([]);
  const [motionVideoSrc, setMotionVideoSrc] = useState("");
  const [smallWrapper, setSmallWrapper] = useState(false);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(768);
  const [steps, setSteps] = useState(20);
  const baseImgDragger = useRef<DraggerMethods>(null);
  const motionVideoDragger = useRef<DraggerMethods>(null);
  const aborter = useRef<AbortController | null>(null);
  const taskTimer = useRef<NodeJS.Timeout | null>(null);
  const curTaskId = useRef("");
  const taskState = useRef(TaskState.init);
  const taskP = useRef<any>(null);
  const previewWrapper = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onLowBalance, onNeedLogin, rootPage } = props;

  const cancelTask = useCallback(() => {
    aborter.current?.abort();
    aborter.current = null;
    setResultVideoUrl("");
    setGenerating(false);
    setQueueing(false);
    taskState.current = TaskState.init;
    taskP.current?.end();
    taskP.current = null;
    setTaskProgress(0);
    deleteTask(funcName);
  }, [funcName]);

  const refreshTaskProgress = useCallback(
    (percent: number, curProgress: number) => {
      let newProgress = curProgress;
      if (percent > 30) {
        if (percent > curProgress) {
          setTaskProgress(percent);
          saveTask(funcName, curTaskId.current, percent);
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
          saveTask(funcName, curTaskId.current, newProgress);
        } else {
          setTaskProgress(progress);
          saveTask(funcName, curTaskId.current, progress);
          newProgress = progress;
        }
      }
      return newProgress;
    },
    [funcName],
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
        deleteTask(funcName);
      };
      const onFail = (code: number, reason?: string, msg?: string) => {
        console.log("check task progress failed!", code, reason, msg);
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
      if (taskTimer.current) {
        clearTimeout(taskTimer.current);
      }
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
            if (taskTimer.current) {
              clearTimeout(taskTimer.current);
            }
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
            if (taskTimer.current) {
              clearTimeout(taskTimer.current);
            }
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
      onNeedLogin,
      onLowBalance,
      funcName,
      dispatch,
      cancelTask,
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
      let dbTaskIdKey = "";
      let dbProgressKey = "";
      if (funcName === FUNC_NAME.ANIMATE_ANYONE) {
        dbTaskIdKey = DB_KEY_TASK_ID_AA;
        dbProgressKey = DB_KEY_TASK_PROGRESS_AA;
      }
      if (funcName === FUNC_NAME.MOTIONSYNC) {
        dbTaskIdKey = DB_KEY_TASK_ID;
        dbProgressKey = DB_KEY_TASK_PROGRESS;
      }
      if (!dbTaskIdKey || !dbProgressKey) {
        return;
      }
      localforage.getItem<string>(dbTaskIdKey).then((taskId) => {
        if (taskId) {
          localforage.getItem<number>(dbProgressKey).then((progress) => {
            if (progress) {
              setTaskProgress(progress);
              startSyncTask(taskId, apiKey, progress);
            } else {
              startSyncTask(taskId, apiKey);
            }
          });
        } else {
          setGenerating(false);
          taskState.current = TaskState.init;
          curTaskId.current = "";
        }
      });
    },
    [funcName, startSyncTask],
  );
  const restoreTaskRef = useRef(restoreTask);
  useEffect(() => {
    restoreTaskRef.current = restoreTask;
  }, [restoreTask]);
  useEffect(() => {
    let resourceUrl = "";
    if (funcName === FUNC_NAME.MOTIONSYNC) {
      resourceUrl = BASE_IMAGE_JSON;
    }
    if (funcName === FUNC_NAME.ANIMATE_ANYONE) {
      resourceUrl = BASE_IMAGE_JSON_AA;
    }
    fetch(resourceUrl)
      .then((res) => res.json())
      .then((res) => {
        if (res.example_images) {
          setExampleBaseImgs(
            res.example_images.map((i: any) => ({
              url: i.url,
              assetsId: i.assets_id,
            })),
          );
          if (res.example_images.length > 0) {
            setImgAssetId(res.example_images[0].assets_id);
            setImgSrc(res.example_images[0].url);
          }
        }
        if (funcName === FUNC_NAME.MOTIONSYNC && res.example_motion_videos) {
          setExampleMotionVideos(
            res.example_motion_videos.map((v: any) => ({
              url: v.url,
              assetsId: v.assets_id,
            })),
          );
          if (res.example_motion_videos.length > 0) {
            setMotionVideoAssetId(res.example_motion_videos[0].assets_id);
            setMotionVideoSrc(res.example_motion_videos[0].url);
          }
        }
        if (funcName === FUNC_NAME.ANIMATE_ANYONE && res.example_pose_videos) {
          setExampleMotionVideos(
            res.example_pose_videos.map((v: any) => ({
              url: v.url,
              assetsId: v.assets_id,
            })),
          );
          if (res.example_pose_videos.length > 0) {
            setAnimatePoseAssetId(res.example_pose_videos[0].assets_id);
            setMotionVideoSrc(res.example_pose_videos[0].url);
          }
        }
      });
  }, [funcName]);
  useEffect(() => {
    if (props.apiKey) {
      restoreTaskRef.current(props.apiKey);
    }
    return () => {
      if (taskTimer.current) {
        clearTimeout(taskTimer.current);
        taskTimer.current = null;
      }
    };
  }, [props.apiKey]);
  useEffect(() => {
    setMotionVideoAssetId(exampleMotionVideos[0]?.assetsId || "");
  }, [exampleMotionVideos]);
  useEffect(() => {
    setResultVideoUrl("");
  }, [imgSrc, motionVideoSrc]);
  useEffect(() => {
    if (previewWrapper.current) {
      const rObserver = new ResizeObserver(() => {
        if (!previewWrapper.current) {
          return;
        }
        if (previewWrapper.current.clientWidth < 650) {
          setSmallWrapper(true);
        } else {
          setSmallWrapper(false);
        }
      });
      rObserver.observe(previewWrapper.current);
      return () => {
        rObserver.disconnect();
      };
    }
  }, []);
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
    const onFinish = (taskId: string) => {
      setTaskId(taskId);
      if (taskState.current !== TaskState.init) {
        curTaskId.current = taskId;
        dispatch(fetchBalanceDetail() as any);
        saveTask(funcName, taskId);
        startSyncTask(taskId, props.apiKey);
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
        cancelTask();
      }
    };
    if (funcName === FUNC_NAME.MOTIONSYNC) {
      imageToVideoMotion(
        props.apiKey,
        {
          image_assets_id: imgAssetId,
          motion_video_assets_id: motionVideoAssetId,
          seed: seed,
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
      return;
    }
    if (funcName === FUNC_NAME.ANIMATE_ANYONE) {
      animateAnyone(
        props.apiKey,
        {
          image_assets_id: imgAssetId,
          pose_video_assets_id: animatePoseAssetId,
          seed: seed,
          width: width,
          height: height,
          steps: steps,
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
      return;
    }
  };
  return (
    <DemoWrapper
      rootPage={props.rootPage}
      funcInfo={props.funcInfo}
      formContent={
        <>
          <Dragger
            ref={baseImgDragger}
            className={styles.image_dragger}
            disabled={generating}
            curValue={imgSrc}
            restrictions={{
              maxSize: MAX_IMAGE_SIZE,
            }}
            onUpload={(url: string) => {
              setImgSrc(url || "");
            }}
            text={"Upload base image"}
            desc={
              <>
                <p style={{ marginBottom: 5 }}>
                  {"For optimal results, ensure the image includes:"}
                </p>
                <p>{"1. a clean background"}</p>
                <p>{"2. the upper half of a person's body"}</p>
              </>
            }
            doExternalUpload={true}
            onExternalUpload={(assetId: string) => {
              setImgAssetId(assetId);
            }}
          />
          <div className={baseStyles.form_item}>
            <label>{"Or choose from preset images:"}</label>
            <div className={styles.base_image_select_wrap}>
              {exampleBaseImgs.map((img) => (
                <BaseImage
                  key={img.assetsId}
                  src={img.url}
                  selected={imgAssetId === img.assetsId}
                  loading={generating}
                  onSelect={() => {
                    setImgSrc(img.url);
                    setImgAssetId(img.assetsId);
                    baseImgDragger.current?.clear();
                  }}
                />
              ))}
            </div>
          </div>
          <Dragger
            ref={motionVideoDragger}
            className={styles.video_dragger}
            type="video"
            curValue={motionVideoSrc}
            disabled={generating}
            restrictions={{
              maxSize: MAX_VIDEO_SIZE,
            }}
            onUpload={(url: string) => {
              setMotionVideoSrc(url || "");
            }}
            text={"Upload motion video"}
            doExternalUpload={true}
            onExternalUpload={(assetId: string) => {
              if (funcName === FUNC_NAME.ANIMATE_ANYONE) {
                setAnimatePoseAssetId(assetId);
              }
              if (funcName === FUNC_NAME.MOTIONSYNC) {
                setMotionVideoAssetId(assetId);
              }
            }}
            accept=".mp4"
            isVideo={true}
          />
          <div className={baseStyles.form_item}>
            <label>{"Choose motion video:"}</label>
            <div className={styles.motion_select_wrap}>
              {exampleMotionVideos.map((m) => (
                <MotionVideo
                  key={m.assetsId}
                  src={m.url}
                  loading={generating}
                  selected={
                    funcName === FUNC_NAME.ANIMATE_ANYONE
                      ? animatePoseAssetId === m.assetsId
                      : motionVideoAssetId === m.assetsId
                  }
                  onSelect={() => {
                    if (funcName === FUNC_NAME.ANIMATE_ANYONE) {
                      setAnimatePoseAssetId(m.assetsId);
                    }
                    if (funcName === FUNC_NAME.MOTIONSYNC) {
                      setMotionVideoAssetId(m.assetsId);
                    }
                    setMotionVideoSrc(m.url);
                    motionVideoDragger.current?.clear();
                  }}
                />
              ))}
            </div>
          </div>
          {funcName === FUNC_NAME.ANIMATE_ANYONE && (
            <>
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
              <Slider
                label={"Steps"}
                withInput
                disabled={generating}
                min={1}
                max={50}
                step={1}
                value={steps}
                onChange={(value) => {
                  setSteps(value);
                  props.onParamChange?.("steps", value);
                }}
                onFocus={() => {
                  props.onParamFocus?.("steps");
                }}
                onBlur={() => {
                  props.onParamBlur?.("steps");
                }}
              />
            </>
          )}
          <div className={baseStyles.form_item}>
            <label>{"Seed"}</label>
            <NumberInput
              className={baseStyles.input}
              min={-1}
              value={seed}
              onChange={(value) => {
                setSeed(value || -1);
                props.onParamChange?.("seed", value);
              }}
              onFocus={() => {
                props.onParamFocus?.("seed");
              }}
              onBlur={() => {
                props.onParamBlur?.("seed");
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
            className={`${baseStyles.gen_btn} primary-btn`}
            id={getGenBtnId(props.rootPage)}
            elAttrs={{
              "data-gtm-product-name": props.funcInfo.name,
            }}
            onClick={handleGenerate}
            loading={generating || queueing}
            disabled={!imgAssetId || !motionVideoAssetId}
          >
            {queueing ? "Queueing..." : "Generate"}
          </PrimaryBtn>
          {(generating || queueing) && (
            <Button
              ghost={true}
              className={baseStyles.cancel_btn}
              onClick={() => {
                cancelTask();
              }}
            >
              {"Cancel"}
            </Button>
          )}
        </div>
      }
      resultContent={
        <div ref={previewWrapper} className={styles.preview_img_wrapper}>
          {!resultVideoUrl && !generating && !queueing && (
            <div
              className={`${styles.placeholders} ${props.rootPage === "playground" ? styles.in_playground : ""} ${smallWrapper ? styles.small : ""}`}
            >
              <div className={styles.placeholder_left}>
                {imgSrc ? (
                  <AutoHeightImage
                    maxHeight={props.rootPage === "product" ? 512 : undefined}
                    className={styles.preview_img}
                    src={imgSrc}
                    alt="img"
                    loading={generating || queueing}
                  />
                ) : (
                  <ImagePlaceholder noborder large />
                )}
              </div>
              <div className={styles.placeholder_right}>
                {motionVideoSrc ? (
                  <video
                    style={
                      props.rootPage === "product" ? { maxHeight: 512 } : {}
                    }
                    className={styles.preview_video}
                    src={motionVideoSrc}
                    loop
                    controls={false}
                    playsInline
                    autoPlay
                  />
                ) : (
                  <ImagePlaceholder noborder large />
                )}
              </div>
            </div>
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
              />
            </div>
          )}
          {resultVideoUrl && !generating && !queueing && (
            <div
              className={styles.preview_img_container}
              style={{
                height: props.rootPage === "product" ? 512 : undefined,
              }}
            >
              <video
                className={styles.result_video}
                src={resultVideoUrl}
                loop
                controls
                playsInline
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
