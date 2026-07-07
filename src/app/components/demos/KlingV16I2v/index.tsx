import localforage from "localforage";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { message } from "@/components/ui/standard/notify";
import { ResponseCode, APIErrReason } from "novita-sdk-v3";
import FakeProgress from "fake-progress";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { klingV16I2v, getFailMsgV3, checkProgressV3 } from "@/api/api";
import { TaskState, DemoProps } from "../DemoWrapper";
import { getApiSource } from "@/constants/constants";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import FormContent from "./components/FormContent";
import FormFooter from "./components/FormFooter";
import ResultContent from "./components/ResultContent";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import defaultCases from "../defaultCases";
import { calcPrice } from "@/lib/utils/pricing";
function createCopy() {
  return {
    title: "Novita AI Playground - Chat, Generate Images and Videos for Free",
    description:
      "Try Novita AI Model APIs for free. Explore the full spectrum of AI APIs tailored for image, video, audio, and LLM applications. Pay for what you use.",
    form: {
      essential: "Essential",
      advanced: "Advanced",
      model: "Model",
      sd3_advice: "Try our latest SD3 models↓↓↓",
      prompt: "Prompt",
      prompt_description: "Enter your prompt here",
      prompt_placeholder: "Description of what you want to generate...",
      negative_prompt: "Negative Prompt",
      negative_prompt_description: "Negative prompt",
      negative_prompt_placeholder: "What you want to avoid generating...",
      width_height: "Width & Height",
      width_height_tips: [
        "Lower resolution may result in blurry images with less detail.Higher resolution slows down generation speed and may introduce deviations.",
        "Recommended Resolution: 1024*1024",
      ],
      width: "Width (256~2048)",
      width_sanitaze: "Width",
      height: "Height (256~2048)",
      height_sanitaze: "Heigh",
      lora_model: "Lora Model",
      lora_weight: "Lora Weight",
      lora: "LoRA",
      add_lora_model: "Add LoRA Model",
      click_to_select: "Click to select...",
      sampler: "Sampler",
      sampler_tips: [
        'A specific algorithm used by AI for image generation.\nIt is recommended to use algorithms marked\nwith a "+" sign because they are more stable.\nCommon options include DPM++2S by Karras, Euler a,\nand DPM++ 2M by Karras.',
        "If the model's authors recommend specific algorithms,\nit's advisable to follow their suggestions.",
      ],
      steps: "Steps",
      steps_tips: ["More Steps, Finer Details. After 20, Limited Improvement"],
      batch_size: "Image Num",
      guidance_scale: "Guidance Scale",
      guidance_scale_tips: [
        "Degree of Prompt Adherence: Higher numbers indicate greater fidelity to the provided prompts, limiting AI's creative freedom.",
        "Recommended Range: 7~12",
      ],
      clip_skip: "Clip Skip",
      strength: "Strength",
      seed: "Seed",
      seed_tips: [
        "Controlling the seed allows for reproducible image generation, parameter experimentation, and prompting variations.",
        "Recommended Range: -1 to ∞",
        "A seed value of -1 indicates randomness. By selecting a fixed value within the range of 0 to ∞, you can maintain basic consistency across multiple image generations, with only minor variations in detail.",
      ],
      initial_image: "Initial Image",
      initial_image_description: "upload image",
      initial_image_placeholder: "Description of what you want to generate...",
      sd3_placeholder:
        "Long, detailed prompts up to 10,000 characters. But the longer and more complex the prompt, the more likely something will be missing. Avoid negative prompts.",
      resolution: "Resolution",
      try: "Try an example",
      generate: "Generate",
      cancel: "Cancel",
      download: "Download",
      back: "Back",
      showcase: "Showcase",
      frames_setting: "Frames",
      resize_mode: "Resize mode",
      replace_bg_placeholder: "Description of the background you want...",
      similarity: "Similarity",
      object_prompt: "Object Prompt",
      object_prompt_placeholder:
        "Description of the object in the image you want to replace",
      replace_prompt: "Replace Prompt",
      replace_prompt_placeholder:
        "Description of the new object you want to put in the image",
      fidelity: "Fidelity",
      scale_factor: "Scale Factor",
      brush_size: "Brush size",
      scale: "Scale",
      sd_vae_model: "SD_VAE Model",
      mask_blur: "Mask Blur",
      inpainting_full_res: "Inpainting Full Res",
      inpainting_full_res_padding: "Inpainting Full Res Padding",
      inpainting_mask_invert: "Inpainting Mask Invert",
      initial_noise_multiplier: "Initial Noise Multiplier",
    },
    task_canceled: "Task canceled",
    prompt_empty_tips: "Prompt is empty",
    prompt_invalid: "Prompts invalid!",
    prompt_empty_object_tips:
      "Please enter the description of the object you want to replace",
    prompt_empty_new_object_tips:
      "Please enter the description of the new object you want to generate",
    prompt_limit_tips: "Prompt length should be less than",
    frames_limit_tips: "The sum of the frames should be less than or equal to",
    frames_limit_tips2: "The sum of the frames should be greater than 0",
    some_prompt_empty_tips: "There are empty prompt values.",
    ip_adapter_required_tips: "Image in IP-Adapter is required.",
    queueing_tips: "Queueing...",
    processing_tips: "Processing...",
    task_waiting_tips:
      "This task may take some time (a few minutes), please be patient.",
    image_invalid: "Image Invalid!",
    img2video: {
      image_invalid_reason:
        'The image resolution should be less than 576 * 1024 if you choose "Original resolution" as resize mode.',
    },
    outpainting: {
      crop_invalid_titile: "Crop Invalid!",
      crop_invalid_reason1:
        "The width and height of the crop should be between 256 and 1024.",
      crop_invalid_reason2:
        "The center of the crop should not be outside of the image",
    },
    mix_pose: {
      upload_base_image: "Upload base image",
      upload_pose_image: "Upload pose image",
    },
    merge_face: {
      upload_base_image: "Upload base image",
      upload_face_image: "Upload face image",
      choose_base_image: "Choose base image",
      choose_face_image: "Choose face image",
      base_image: "Base Image",
      face_image: "Face Image",
      tips_title: "Tips: The difference of base image and face image",
      tips_detail: [
        "Base image : Single-person portrait only, does not support multiple persons",
        "Face image: Only human faces, clear and recognizable. It does not support cartoon or animal facial images",
        "Image restrictions: Maximum 2048*2048 resolution, less than 30 MB",
      ],
    },
    create_tile: {
      prompt_placeholder: "Description of the tile you want to generate",
      negative_prompt_placeholder:
        "Description of the tile that you want to avoid generating",
    },
    motion: {
      upload_base_image: "Upload base image",
      tips1: "For optimal results, ensure the image includes:",
      tips2: "1. a clean background",
      tips3: "2. the upper half of a person's body",
      tips4: "Or choose from preset images:",
      upload_motion_video: "Upload motion video",
      choose_motion_video: "Choose motion video:",
    },
    code: {
      sample_code: "Sample code",
      code_not_available: "Code not available",
    },
    model_list: {
      select_model: "Select model...",
    },
    lora: {
      strength: "Strength",
    },
    control_net: {
      add_control_net_unit: "Add ControlNet Unit",
      image: "Image",
      strength: "Strength",
      preprocessor: "Preprocessor",
      guidance: "Guidance",
      start: "start",
      end: "end",
    },
    ip_adapter: {
      image: "Image",
      strength: "Strength",
    },
  };
}
const DB_KEY_TASK_ID = "kling_v1_6_i2v_task_id";
const DB_KEY_TASK_PROGRESS = "kling_v1_6_i2v_task_progress";
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
const useCases = defaultCases[FUNC_NAME.KLING_V1_6_I2V];
export default function KlingV16I2V({
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
  const [mode, setMode] = useState("Standard");
  const [imageUrl, setImageUrl] = useState(useCases[0].image_url);
  const [duration, setDuration] = useState(5);
  const [prompt, setPrompt] = useState(useCases[0].prompt);
  const [negativePrompt, setNegativePrompt] = useState(
    useCases[0].negative_prompt,
  );
  const [guidanceScale, setGuidanceScale] = useState(
    useCases[0].guidance_scale,
  );
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
    const price = Number(
      calcPrice(FUNC_NAME.KLING_V1_6_I2V, {
        mode,
        duration,
      }).discountPrice ?? 0,
    );
    return price;
  }, [mode, duration]);
  useEffect(() => {
    onParamChange?.("mode", "Standard");
    onParamChange?.("image_url", useCases[0].image_url);
    onParamChange?.("duration", 5);
    onParamChange?.("prompt", useCases[0].prompt);
    onParamChange?.("negative_prompt", useCases[0].negative_prompt);
    onParamChange?.("guidance_scale", useCases[0].guidance_scale);
  }, [onParamChange]);

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
            code === ResponseCode.TOO_MANY_REQ &&
            reason === APIErrReason.ANONYMOUS_ACCESS_QUOTA_EXCEEDS
          ) {
            onNeedLogin();
          } else if (
            code === ResponseCode.REQUEST_INVALID &&
            reason === APIErrReason.BALANCE_NOT_ENOUGH
          ) {
            onLowBalance();
          } else {
            message.error(getFailMsgV3(code, reason, msg));
          }
        }
        if (code === ResponseCode.CANCELED) {
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
      taskProgress,
      cancelTask,
      dispatch,
      onLowBalance,
      onNeedLogin,
      refreshTaskProgress,
      rootPage,
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
          code === ResponseCode.TOO_MANY_REQ &&
          reason === APIErrReason.ANONYMOUS_ACCESS_QUOTA_EXCEEDS
        ) {
          onNeedLogin();
        } else if (
          code === ResponseCode.REQUEST_INVALID &&
          reason === APIErrReason.BALANCE_NOT_ENOUGH
        ) {
          onLowBalance();
        } else {
          message.error(getFailMsgV3(code, reason, msg));
        }
        cancelTask();
      }
    };
    const data = {
      mode,
      duration,
      image_url: imageUrl,
      prompt,
      negative_prompt: negativePrompt,
      guidance_scale: guidanceScale,
    };
    klingV16I2v(apiKey, data, onFinish, onFail, {
      source: getApiSource(rootPage),
      abortSignal: aborter.current?.signal,
    });
  }, [
    userState,
    mode,
    duration,
    imageUrl,
    prompt,
    negativePrompt,
    guidanceScale,
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
        <FormContent
          useCases={useCases}
          curCase={curCase}
          setCurCase={setCurCase}
          generating={generating}
          queueing={queueing}
          mode={mode}
          setMode={setMode}
          duration={duration}
          setDuration={setDuration}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          guidanceScale={guidanceScale}
          setGuidanceScale={setGuidanceScale}
          onParamFocus={onParamFocus}
          onParamBlur={onParamBlur}
          onParamChange={onParamChange}
        />
      }
      formFoot={
        <FormFooter
          generating={generating}
          queueing={queueing}
          prompt={prompt}
          funcInfo={funcInfo}
          rootPage={rootPage}
          handleGenerate={handleGenerate}
          cancelTask={cancelTask}
          estimatePrice={estimatePrice as number}
        />
      }
      resultContent={
        <ResultContent
          copy={createCopy()}
          resultVideoUrl={resultVideoUrl}
          generating={generating}
          queueing={queueing}
          rootPage={rootPage}
          taskProgress={taskProgress}
          cancelTask={cancelTask}
        />
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
