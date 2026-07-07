import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { TabsItems, type TabsItem } from "@/components/ui/standard/tabs-items";
import {
  Highlighter as HighlightOutlined,
  Move as DragOutlined,
  Undo2 as UndoOutlined,
  Redo2 as RedoOutlined,
  Eraser as ClearOutlined,
  Eye as EyeOutlined,
  EyeOff as EyeInvisibleOutlined,
} from "lucide-react";
import { ResponseCodeV3, APIErrReasonV3, InpaintingRequest } from "novita-sdk";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import styles from "./Inpainting.module.css";
import baseStyles from "../base.module.scss";
import { inpaintingWithProgress, getFailMsgV3 } from "@/api/api";
import Drawer, { DrawerMethods } from "../../Drawer/Drawer";
import Dragger from "@/app/components/dragger/Dragger";
import { TaskState, DemoProps } from "../DemoWrapper";
import { MAX_IMAGE_SIZE, getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import { downloadImage, getImageSize, resizeImage } from "@/lib/utils/media";
import { ModelType } from "@/app/model-api/model/components/modelList/modelList";
import { getModelDetail } from "@/api/model";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import PrimaryButton from "@/app/components/button/Button";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import ModelListModal, {
  ModelListModalMethods,
} from "@/app/components/modals/ModelList";
import ModelSelector from "../../input/ModelSelector/ModelSelector";
import ModelSelectorLite from "../../input/ModelSelector/ModelSelectorLite";
import LoraForm from "../components/LoraForm";
import EmbeddingForm from "../components/EmbeddingForm";
import Switcher from "../../input/Switcher/Switcher";
import { calcPrice } from "@/lib/utils/pricing";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { formatMoneyDisplay } from "@/lib/utils/money";
import { FormItem } from "@/app/models/image/components/FormItem/FormItem";
import { WIDGET_TYPE, type WidgetProps } from "@/app/models/lib/widgets";
import * as widgets from "@/app/models/lib/widgets";
const MIN_WIDTH = 128;
const MAX_WIDTH = 2048;
const MIN_HEIGHT = 128;
const MAX_HEIGHT = 2048;
const DEFAULT_BASE_MODEL =
  process.env.NEXT_PUBLIC_ENV === "prod" ? "SD 1.5" : "";
const DEFAULT_MODEL_NAME =
  process.env.NEXT_PUBLIC_ENV === "prod"
    ? "realisticVisionV51_v51VAE-inpainting_94324.safetensors"
    : "Deliberate_inpainting.safetensors";
const DEFAULT_MODEL_COVER =
  process.env.NEXT_PUBLIC_ENV === "prod"
    ? "https://next-app-static.s3.amazonaws.com/images-prod/xG1nkqKTMzGDvpLrqFT7WA/11f42321-1c67-493b-873f-25563a3b6821/width=450/1804915.jpeg"
    : "";
const DEFAULT_MODLE_ID =
  process.env.NEXT_PUBLIC_ENV === "prod" ? 130090 : 100000018;

const createSliderWidget = (
  label: string,
  paramsKey: string,
  defaultValue: number,
  min: number,
  max: number,
  step: number,
  options?: Pick<WidgetProps, "closable" | "nilValue">,
): WidgetProps => ({
  label,
  type: WIDGET_TYPE.SLIDER,
  paramsKey,
  defaultValue,
  numberProps: {
    min,
    max,
    step,
  },
  ...options,
});

const brushSizeWidget = createSliderWidget(
  "Brush size",
  "brush_size",
  30,
  5,
  50,
  1,
);
const scaleWidget = createSliderWidget("Scale", "scale", 1, 0.5, 2.5, 0.1);
const stepsWidget = createSliderWidget("Steps", "steps", 20, 1, 100, 1);
const guidanceScaleWidget = createSliderWidget(
  "Guidance Scale",
  "guidance_scale",
  7,
  1,
  30,
  1,
);
const strengthWidget = createSliderWidget(
  "Strength",
  "strength",
  1,
  0,
  1,
  0.01,
);
const clipSkipWidget = createSliderWidget(
  "Clip Skip",
  "clip_skip",
  0,
  1,
  12,
  1,
  { closable: true, nilValue: 0 },
);
const maskBlurWidget = createSliderWidget(
  "Mask Blur",
  "mask_blur",
  0,
  0,
  64,
  1,
);
const inpaintingFullResPaddingWidget = createSliderWidget(
  "Inpainting Full Res Padding",
  "inpainting_full_res_padding",
  2,
  0,
  256,
  1,
);
const initialNoiseMultiplierWidget = createSliderWidget(
  "Initial Noise Multiplier",
  "initial_noise_multiplier",
  0,
  0,
  1.5,
  0.01,
);
export default function Inpainting({
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
  const [curTabKey, setCurTabKey] = useState("essential");
  const [imgSrc, setImgSrc] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const [sampler, setSampler] = useState("DPM++ 2M Karras");
  const [guidanceScale, setGuidanceScale] = useState(7);
  const [steps, setSteps] = useState(20);
  const [strength, setStrength] = useState(1);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [openModelList, setOpenModelList] = useState(false);
  const [curModel, setCurModel] = useState<ModelDetails>();
  const [curBaseModel, setCurBaseModel] = useState<string>(DEFAULT_BASE_MODEL);
  const [vaeModel, setVaeModel] = useState<Model>();
  const [canGenerate, setCanGenerate] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [scale, setScale] = useState(1);
  const [maskBlur, setMaskBlur] = useState(0);
  const [showResult, setShowResult] = useState(true);
  const [openVaeModelList, setOpenVaeModelList] = useState(false);
  const [loras, setLoras] = useState<
    {
      modelName: string;
      modelCover: string;
      strength: number;
    }[]
  >([]);
  const [embeddings, setEmbeddings] = useState<
    {
      modelName: string;
      modelCover: string;
    }[]
  >([]);
  const [seed, setSeed] = useState(-1);
  const [clipSkip, setClipSkip] = useState(0);
  const [inpaintingFullRes, setInpaintingFullRes] = useState(true);
  const [inpaintingFullResPadding, setInpaintingFullResPadding] = useState(2);
  const [inpaintingMaskInvert, setInpaintingMaskInvert] = useState(false);
  const [initialNoiseMultiplier, setInitialNoiseMultiplier] = useState(0);
  const drawerRef = useRef<DrawerMethods>(null);
  const aborter = useRef<AbortController | null>(null);
  const maskImg = useRef("");
  const taskState = useRef(TaskState.init);
  const modelListModal = useRef<ModelListModalMethods>(null);
  const vaeModelListModal = useRef<ModelListModalMethods>(null);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const estimatePrice = useMemo(() => {
    return (
      calcPrice(FUNC_NAME.INPAINTING, {
        steps: steps,
        width: imgWidth,
        height: imgHeight,
      }).discountPrice ?? "-"
    );
  }, [steps, imgWidth, imgHeight]);
  const handleBrushSizeChange = useCallback((val: string | number) => {
    const nextValue = Number(val);
    setBrushSize(nextValue);
    drawerRef.current?.setBrushSize(nextValue);
  }, []);
  const handleScaleChange = useCallback((val: string | number) => {
    const nextValue = Number(val);
    setScale(nextValue);
    drawerRef.current?.setScale(nextValue);
  }, []);
  const handlePromptChange = useCallback(
    (val: string | number) => {
      const nextValue = String(val);
      setPrompt(nextValue);
      onParamChange?.("prompt", nextValue);
    },
    [onParamChange],
  );
  const handleStepsChange = useCallback(
    (val: string | number) => {
      const nextValue = Number(val);
      setSteps(nextValue);
      onParamChange?.("steps", nextValue);
    },
    [onParamChange],
  );
  const handleGuidanceScaleChange = useCallback(
    (val: string | number) => {
      const nextValue = Number(val);
      setGuidanceScale(nextValue);
      onParamChange?.("guidance_scale", nextValue);
    },
    [onParamChange],
  );
  const handleSeedChange = useCallback(
    (val: string | number) => {
      const nextValue = Number(val) || -1;
      setSeed(nextValue);
      onParamChange?.("seed", nextValue);
    },
    [onParamChange],
  );
  const handleNegativePromptChange = useCallback(
    (val: string | number) => {
      const nextValue = String(val);
      setNegativePrompt(nextValue);
      onParamChange?.("negative_prompt", nextValue);
    },
    [onParamChange],
  );
  const handleStrengthChange = useCallback(
    (val: string | number) => {
      const nextValue = Number(val);
      setStrength(nextValue);
      onParamChange?.("strength", nextValue);
    },
    [onParamChange],
  );
  const handleSamplerChange = useCallback(
    (val: string | number) => {
      const nextValue = String(val);
      setSampler(nextValue);
      onParamChange?.("sampler_name", nextValue);
    },
    [onParamChange],
  );
  const handleClipSkipChange = useCallback(
    (val: string | number) => {
      const nextValue = Number(val) || 0;
      setClipSkip(nextValue);
      onParamChange?.("clip_skip", nextValue);
    },
    [onParamChange],
  );
  const handleMaskBlurChange = useCallback((val: string | number) => {
    setMaskBlur(Number(val));
  }, []);
  const handleInpaintingFullResPaddingChange = useCallback(
    (val: string | number) => {
      const nextValue = Number(val);
      setInpaintingFullResPadding(nextValue);
      onParamChange?.("inpainting_full_res_padding", nextValue);
    },
    [onParamChange],
  );
  const handleInitialNoiseMultiplierChange = useCallback(
    (val: string | number) => {
      const nextValue = Number(val);
      setInitialNoiseMultiplier(nextValue);
      onParamChange?.("initial_noise_multiplier", nextValue);
    },
    [onParamChange],
  );
  useEffect(() => {
    onParamChange?.("model_name", DEFAULT_MODEL_NAME);
    onParamChange?.("image_base64", "");
    onParamChange?.("mask_image_base64", "");
    onParamChange?.("prompt", "");
    onParamChange?.("negative_prompt", "");
    onParamChange?.("sd_vae", "");
    onParamChange?.("loras", []);
    onParamChange?.("embeddings", []);
    onParamChange?.("image_num", 1);
    onParamChange?.("mask_blur", 0);
    onParamChange?.("sampler_name", sampler);
    onParamChange?.("clip_skip", clipSkip);
    onParamChange?.("guidance_scale", guidanceScale);
    onParamChange?.("steps", steps);
    onParamChange?.("strength", strength);
    onParamChange?.("seed", -1);
    onParamChange?.("inpainting_full_res", false);
    onParamChange?.("inpainting_full_res_padding", 0);
    onParamChange?.("inpainting_mask_invert", false);
    onParamChange?.("initial_noise_multiplier", 0);
    getModelDetail(DEFAULT_MODLE_ID).then((details) => {
      if (details) {
        setCurModel(details);
      }
    });
  }, [clipSkip, guidanceScale, onParamChange, sampler, steps, strength]);
  useEffect(() => {
    onParamChange?.("image_base64", "");
    onParamChange?.("mask_image_base64", "");
  }, [onParamChange]);
  useEffect(() => {
    onParamFocus?.("image_base64");
    onParamChange?.("image_base64", imgSrc || "");
    setTimeout(() => {
      onParamBlur?.("image_base64");
    }, 1000);
    getImageSize(imgSrc).then((size) => {
      setImgWidth(Math.floor(size.width));
      setImgHeight(Math.floor(size.height));
    });
  }, [imgSrc, onParamFocus, onParamChange, onParamBlur]);
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
      onParamFocus?.("mask_image_base64");
      onParamChange?.("mask_image_base64", maskImg.current || "");
      setTimeout(() => {
        onParamBlur?.("mask_image_base64");
      }, 1000);
      setGenerating(true);
      setHasStartedGenerate(true);
      taskState.current = TaskState.generating;
      aborter.current = new AbortController();
      const onProgress = () => {
        if (taskState.current !== TaskState.init) {
          setGenerating(true);
          taskState.current = TaskState.generating;
          // setResultImgUrl(imgs[0])
        }
      };
      const onFinish = (imgs: string[]) => {
        if (taskState.current !== TaskState.init) {
          setGenerating(false);
          taskState.current = TaskState.finished;
          setResultImgUrl(imgs[0]);
        }
        dispatch(fetchBalanceDetail() as any);
      };
      const onFail = (code: number, reason: string) => {
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
            message.error(getFailMsgV3(code, reason));
          }
          setGenerating(false);
          taskState.current = TaskState.failed;
          setResultImgUrl("");
        }
        if (code === ResponseCodeV3.CANCELED) {
          message.warning(getFailMsgV3(code));
        }
        dispatch(fetchBalanceDetail() as any);
      };
      const syncTaskId = (taskId: string) => {
        setTaskId(taskId);
      };
      const initImage = await resizeImage(imgSrc, {
        w: imgWidth,
        h: imgHeight,
      });
      const modelName = curModel?.model_name || DEFAULT_MODEL_NAME;
      const reqParams: InpaintingRequest = {
        extra: {
          enterprise_plan: {
            enabled: enterprisePlanTipsUtils.isUseEnterprise(),
          },
        },
        request: {
          model_name: modelName,
          image_base64: initImage.replace(/data:image\/.+;base64,/, ""),
          mask_image_base64: maskImage.replace(/data:image\/.+;base64,/, ""),
          prompt: prompt,
          negative_prompt: negativePrompt,
          sd_vae: vaeModel?.sd_name || "",
          loras:
            loras
              ?.filter((p) => !!p.modelName)
              .map((l) => ({
                model_name: l.modelName,
                strength: l.strength,
              })) || [],
          embeddings:
            embeddings
              ?.filter((p) => !!p.modelName)
              .map((e) => ({ model_name: e.modelName })) || [],
          image_num: 1,
          mask_blur: maskBlur,
          sampler_name: sampler,
          steps: steps,
          guidance_scale: guidanceScale,
          strength: strength,
          seed: -1,
          inpainting_full_res: inpaintingFullRes ? 1 : 0,
          inpainting_full_res_padding: inpaintingFullResPadding,
          inpainting_mask_invert: inpaintingMaskInvert ? 1 : 0,
          initial_noise_multiplier: initialNoiseMultiplier,
        },
      };
      if (clipSkip) {
        reqParams.request.clip_skip = clipSkip;
      }
      inpaintingWithProgress(
        apiKey,
        reqParams,
        {
          onFinish,
          onProgress,
          onFail,
          onSubmitTaskSuccess: syncTaskId,
        },
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
      imgSrc,
      imgWidth,
      imgHeight,
      curModel,
      apiKey,
      prompt,
      negativePrompt,
      vaeModel,
      loras,
      embeddings,
      clipSkip,
      sampler,
      steps,
      guidanceScale,
      strength,
      inpaintingFullRes,
      inpaintingFullResPadding,
      inpaintingMaskInvert,
      initialNoiseMultiplier,
      rootPage,
      onNeedLogin,
      onParamBlur,
      dispatch,
      onLowBalance,
      maskBlur,
    ],
  );
  const showModelList = useCallback(() => {
    if (!openModelList) {
      setOpenModelList(true);
    }
    modelListModal.current?.open();
  }, [openModelList]);
  const hideModelList = useCallback(() => {
    modelListModal.current?.close();
  }, []);
  const showVaeModelList = useCallback(() => {
    if (!openVaeModelList) {
      setOpenVaeModelList(true);
    }
    vaeModelListModal.current?.open();
  }, [openVaeModelList]);
  const hideVaeModelList = useCallback(() => {
    vaeModelListModal.current?.close();
  }, []);
  const essentialForm = (
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
          onParamChange?.("image_base64", url || "");
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
                  icon={showResult ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  onClick={() => {
                    drawerRef.current?.setShowResult(!showResult);
                    setShowResult(!showResult);
                  }}
                  disabled={generating}
                />
              )}
            </div>
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={brushSizeWidget}
              fieldProps={{
                disabled: !imgSrc || generating,
              }}
              value={brushSize}
              onChange={handleBrushSizeChange}
            />
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={scaleWidget}
              fieldProps={{
                disabled: !imgSrc || generating,
              }}
              value={scale}
              onChange={handleScaleChange}
            />
          </div>
        </>
      )}
      <div className={`${styles.panel_box} ${styles.model_panel_box}`}>
        <div className={baseStyles.form_item}>
          <label>{"Model"}:</label>
          <ModelSelector
            value={curModel?.model_name || DEFAULT_MODEL_NAME}
            modelCover={curModel?.cover_url || DEFAULT_MODEL_COVER}
            fieldProps={{
              disabled: generating,
              onClick: showModelList,
            }}
          />
        </div>
      </div>
      <div className={styles.panel_box}>
        <FormItem
          widgetProps={widgets.promptWidget()}
          fieldProps={{
            disabled: generating,
          }}
          value={prompt}
          onChange={handlePromptChange}
          onFocus={() => {
            onParamFocus?.("prompt");
          }}
          onBlur={() => {
            onParamBlur?.("prompt");
          }}
        />
      </div>
      <div className={styles.panel_box}>
        <FormItem
          widgetProps={stepsWidget}
          fieldProps={{
            disabled: generating,
          }}
          value={steps}
          onChange={handleStepsChange}
          onFocus={() => {
            onParamFocus?.("steps");
          }}
          onBlur={() => {
            onParamBlur?.("steps");
          }}
        />
      </div>
      <div className={styles.panel_box}>
        <FormItem
          widgetProps={guidanceScaleWidget}
          fieldProps={{
            disabled: generating,
          }}
          value={guidanceScale}
          onChange={handleGuidanceScaleChange}
          onFocus={() => {
            onParamFocus?.("guidance_scale");
          }}
          onBlur={() => {
            onParamBlur?.("guidance_scale");
          }}
        />
      </div>
      <div className={styles.panel_box}>
        <FormItem
          widgetProps={widgets.seedWidget()}
          fieldProps={{
            disabled: generating,
          }}
          value={seed}
          onChange={handleSeedChange}
          onFocus={() => {
            onParamFocus?.("seed");
          }}
          onBlur={() => {
            onParamBlur?.("seed");
          }}
        />
      </div>
    </>
  );
  const formItems: TabsItem[] = [
    {
      key: "essential",
      label: "Essential",
      children: (
        <div className={`${styles.form_wrapper} scrollBar_container`}>
          {essentialForm}
        </div>
      ),
    },
    {
      key: "advanced",
      label: "Advanced",
      children: (
        <div className={`${styles.form_wrapper} scrollBar_container`}>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={widgets.nPromptWidget()}
              fieldProps={{
                disabled: generating,
              }}
              value={negativePrompt}
              onChange={handleNegativePromptChange}
              onFocus={() => {
                onParamFocus?.("negative_prompt");
              }}
              onBlur={() => {
                onParamBlur?.("negative_prompt");
              }}
            />
          </div>
          <div className={baseStyles.form_item}>
            <label>{"SD_VAE Model"}:</label>
            <ModelSelectorLite
              value={vaeModel?.sd_name || "None"}
              fieldProps={{
                onClick: showVaeModelList,
                disabled: generating,
              }}
            />
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={strengthWidget}
              fieldProps={{
                disabled: generating,
              }}
              value={strength}
              onChange={handleStrengthChange}
              onFocus={() => {
                onParamFocus?.("strength");
              }}
              onBlur={() => {
                onParamBlur?.("strength");
              }}
            />
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={widgets.samplerWidget()}
              fieldProps={{
                disabled: generating,
              }}
              value={sampler}
              onChange={handleSamplerChange}
              onFocus={() => {
                onParamFocus?.("sampler_name");
              }}
              onBlur={() => {
                onParamBlur?.("sampler_name");
              }}
            />
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={clipSkipWidget}
              fieldProps={{
                disabled: generating,
              }}
              value={clipSkip}
              onChange={handleClipSkipChange}
              onFocus={() => {
                onParamFocus?.("clip_skip");
              }}
              onBlur={() => {
                onParamBlur?.("clip_skip");
              }}
            />
          </div>
          <div className={styles.panel_box}>
            <LoraForm
              params={loras}
              loading={generating}
              onChange={(loraParams) => {
                console.log("lora params:", loraParams);
                setLoras(loraParams);
                onParamChange?.("loras", loraParams);
              }}
              baseModel={curBaseModel}
            />
          </div>
          <div className={styles.panel_box}>
            <EmbeddingForm
              params={embeddings}
              loading={generating}
              onChange={(params) => {
                console.log("embedding params:", params);
                setEmbeddings(params);
                onParamChange?.("embeddings", params);
              }}
              baseModel={curBaseModel}
            />
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={maskBlurWidget}
              fieldProps={{
                disabled: generating,
              }}
              value={maskBlur}
              onChange={handleMaskBlurChange}
            />
          </div>
          <div className={styles.panel_box}>
            <Switcher
              label={"Inpainting Full Res"}
              disabled={generating}
              value={inpaintingFullRes}
              onChange={(val) => {
                setInpaintingFullRes(val);
                onParamChange?.("inpainting_full_res", val);
              }}
              onFocus={() => {
                onParamFocus?.("inpainting_full_res");
              }}
              onBlur={() => {
                onParamBlur?.("inpainting_full_res");
              }}
            />
          </div>
          {inpaintingFullRes && (
            <div className={styles.panel_box}>
              <FormItem
                widgetProps={inpaintingFullResPaddingWidget}
                fieldProps={{
                  disabled: generating,
                }}
                value={inpaintingFullResPadding}
                onChange={handleInpaintingFullResPaddingChange}
                onFocus={() => {
                  onParamFocus?.("inpainting_full_res_padding");
                }}
                onBlur={() => {
                  onParamBlur?.("inpainting_full_res_padding");
                }}
              />
            </div>
          )}
          <div className={styles.panel_box}>
            <Switcher
              label={"Inpainting Mask Invert"}
              disabled={generating}
              value={inpaintingMaskInvert}
              onChange={(val) => {
                setInpaintingMaskInvert(val);
                onParamChange?.("inpainting_mask_invert", val);
              }}
              onFocus={() => {
                onParamFocus?.("inpainting_mask_invert");
              }}
              onBlur={() => {
                onParamBlur?.("inpainting_mask_invert");
              }}
            />
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={initialNoiseMultiplierWidget}
              fieldProps={{
                disabled: generating,
              }}
              value={initialNoiseMultiplier}
              onChange={handleInitialNoiseMultiplierChange}
              onFocus={() => {
                onParamFocus?.("initial_noise_multiplier");
              }}
              onBlur={() => {
                onParamBlur?.("initial_noise_multiplier");
              }}
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <>
      <ModelListModal
        ref={modelListModal}
        show={openModelList}
        wrapClassName="modellist_modal_wrapper"
        needDetails={true}
        close={() => {
          setOpenModelList(false);
        }}
        modelType={ModelType.base}
        filter={{
          is_inpainting: true,
          source: "",
        }}
        selectedModelId={curModel?.model_id || 0}
        onModelSelect={(modelDetails) => {
          setCurModel(modelDetails as ModelDetails);
          onParamChange?.("model_name", modelDetails.name);
          setGuidanceScale((modelDetails as ModelDetails).cfg_scale || 7);
          hideModelList();
          setCurBaseModel(modelDetails.base_model || "");
        }}
      />
      <ModelListModal
        ref={vaeModelListModal}
        show={openVaeModelList}
        wrapClassName="vae_modellist_modal_wrapper"
        needDetails={false}
        close={() => {
          setOpenVaeModelList(false);
        }}
        filter={{
          base_model: curBaseModel,
          source: "",
        }}
        modelType={ModelType.vae}
        selectedModelId={vaeModel?.id || 0}
        onModelSelect={(m) => {
          setVaeModel(m as Model);
          onParamChange?.("sd_vae", m.name);
          hideVaeModelList();
        }}
        baseModel={curBaseModel}
      />
      <DemoWrapper
        rootPage={rootPage}
        funcInfo={funcInfo}
        formHeightInProduct={500}
        withTabs={rootPage === "playground"}
        formContent={
          rootPage === "playground" ? (
            <TabsItems
              activeKey={curTabKey}
              className="playground_form_tabs"
              defaultActiveKey="essential"
              items={formItems}
              animated={{ inkBar: true, tabPane: true }}
              tabBarStyle={{ userSelect: "none" }}
              onChange={(key) => {
                setCurTabKey(key);
              }}
            />
          ) : (
            essentialForm
          )
        }
        formFoot={
          <div className={baseStyles.btn_group}>
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
              disabled={!imgSrc || !canGenerate || !prompt}
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
            {estimatePrice && (
              <p className={baseStyles.price_info}>
                Estimated cost:
                <strong>{`$${formatMoneyDisplay(estimatePrice)}/image`}</strong>
              </p>
            )}
          </div>
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
                  canvasWidth={imgWidth}
                  canvasHeight={imgHeight}
                  loading={generating}
                  disabled={!prompt}
                  onGenerate={handleGenerate}
                  maxWidth={rootPage === "product" ? 1024 : undefined}
                  maxHeight={rootPage === "product" ? 512 : undefined}
                  onBack={() => {
                    aborter.current?.abort();
                    aborter.current = null;
                    setImgSrc("");
                    maskImg.current = "";
                    onParamChange?.("mask_image_base64", "");
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
    </>
  );
}
