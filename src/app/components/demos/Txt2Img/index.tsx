"use client";
import {
  useState,
  useCallback,
  useRef,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { message } from "@/components/ui/standard/notify";
import { TabsItems, type TabsItem } from "@/components/ui/standard/tabs-items";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponseCodeV3, APIErrReasonV3, Txt2ImgV3Request } from "novita-sdk";
import { useAppSelector, useAppDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { kv } from "@vercel/kv";
import { TaskState, DemoProps } from "../DemoWrapper";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import Tips from "@/app/components/Tips/Tips";
import ImgSize from "@/app/components/input/ImgSize/ImgSize";
import ModelSelector from "@/app/components/input/ModelSelector/ModelSelectorV2";
import { ModelType } from "@/app/model-api/model/components/modelList/modelList";
import LoraForm from "@/app/components/demos/components/LoraForm";
import { textToImageWithProgressV3, getFailMsgV3 } from "@/api/api";
import { FormItem } from "@/app/models/image/components/FormItem/FormItem";
import { KeyContext } from "@/app/models/lib/context";
import * as widgets from "@/app/models/lib/widgets";
import RefinerForm from "@/app/components/demos/components/RefinerForm";
import ShareLinkBtn from "@/app/models/image/components/ShareLinkBtn/ShareLinkBtn";
import PreviewImage from "@/app/components/demos/ImagePlaceholder/PreviewImage";
import PrimaryBtn from "@/app/components/button/Button";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { getApiSource } from "@/constants/constants";
import { getDefaultModelParams } from "@/lib/utils/playground";
import { getSpecifyModelInfo } from "@/app/models/lib/utils";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import defaultCases, {
  DEFAULT_MODEL_BASE_MODEL,
  DEFAULT_MODEL_IS_SDXL,
} from "@/app/components/demos/defaultCases";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import { calcPrice } from "@/lib/utils/pricing";
import { formatMoneyDisplay } from "@/lib/utils/money";
import styles from "./index.module.scss";
import baseStyles from "../base.module.scss";
const modelApiPlaygroundFormWidthHeightTips = [
  "Lower resolution may result in blurry images with less detail.Higher resolution slows down generation speed and may introduce deviations.",
  "Recommended Resolution: 1024*1024",
];
const PROMPT_LENGTH_MAX = 1024;
export default function Txt2Img({
  apiKey,
  funcInfo,
  rootPage,
  onNeedLogin,
  onLowBalance,
  onParamFocus,
  onParamBlur,
  showCancelConfirm,
}: DemoProps) {
  const { params, setParams, clearParams } = useContext(KeyContext);
  const [data, setData] = useState<Record<string, any>>({});
  const [curStep, setCurStep] = useState<TaskState>(TaskState.init);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [isCurModelSD3, setIsCurModelSD3] = useState(false);
  const [curCase, setCurCase] = useState(-1);
  const [taskId, setTaskId] = useState("");
  const [isCurModelSDXL, setIsCurModelSDXL] = useState(DEFAULT_MODEL_IS_SDXL);
  const [curTabKey, setCurTabKey] = useState("essential");
  const [curBaseModel, setCurBaseModel] = useState<string>(
    DEFAULT_MODEL_BASE_MODEL,
  );
  const [resultSeed, setResultSeed] = useState(-1);
  const [useCases, setUseCases] = useState<
    {
      [key: string]: any;
    }[]
  >([]);
  const [openModelSelector, setOpenModelSelector] = useState(false);
  const [baseModelFilter, setBaseModelFilter] = useState("");
  const aborter = useRef<AbortController | null>(null);
  const resultInfo = useRef<{
    [key: string]: string;
  }>({});
  const userState = useAppSelector((state) => state.user.state);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const disabled = useMemo(() => {
    return [TaskState.loading, TaskState.generating].includes(curStep);
  }, [curStep]);
  const estimatePrice = useMemo(() => {
    return (
      calcPrice(FUNC_NAME.TXT2IMG, {
        steps: params.steps,
        width: params.width,
        height: params.height,
      }).discountPrice ?? "-"
    );
  }, [params.steps, params.width, params.height]);
  useEffect(() => {
    const init = async () => {
      await clearParams();
      const url = new URL(window.location.href);
      const urlParams = new URLSearchParams(url.search);
      const shareId = urlParams.get("share");
      const baseModel = urlParams.get("base-model");
      const isSpecifyModel = Boolean(urlParams.get("specify-model"));
      url.search = "";
      router.replace(url.toString(), { shallow: true } as any);
      let modelId = "";
      if (baseModel) {
        setOpenModelSelector(true);
        setBaseModelFilter(baseModel);
      }
      if (shareId) {
        try {
          const info = await kv.get(shareId);
          setParams(info as Record<string, any>);
        } catch {
          //
        }
      } else if (isSpecifyModel) {
        const modelInfo = getSpecifyModelInfo();
        setParams(modelInfo);
      } else {
        modelId = defaultCases[FUNC_NAME.TXT2IMG]?.[0].model_id;
        setParams({
          model_id: modelId,
          model_name: defaultCases[FUNC_NAME.TXT2IMG]?.[0].model_name,
        });
        const cases =
          defaultCases[FUNC_NAME.TXT2IMG]?.filter(
            (c) => c.model_id === modelId,
          ) || [];
        setUseCases(cases);
      }
    };
    init();
    // eslint-disable-next-line
  }, []);
  const onProgress = useCallback((imgs: string[]) => {
    if (imgs.length > 0) {
      setCurStep(TaskState.generating);
      setData({ imgs });
    }
  }, []);
  const onFinish = useCallback(
    (imgs: string[], info?: string, extra?: Record<string, any>) => {
      if (extra?.seed) {
        setResultSeed(extra.seed);
      }
      onProgress(imgs);
      setCurStep(TaskState.finished);
      dispatch(fetchBalanceDetail() as any);
    },
    [onProgress, dispatch],
  );
  const onFail = useCallback(
    (code: number, reason: string) => {
      setCurStep(TaskState.failed);
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
      } else if (code === ResponseCodeV3.CANCELED) {
        message.warning("Task canceled");
      } else {
        message.error(getFailMsgV3(code, reason));
      }
      setData({});
      dispatch(fetchBalanceDetail() as any);
    },
    [onNeedLogin, onLowBalance, dispatch],
  );
  const onSubmitTaskSuccess = useCallback((taskId: string) => {
    setTaskId(taskId);
  }, []);
  const handleGenerate = useCallback(async () => {
    if (userState === UserState.logout) {
      onNeedLogin();
      return;
    }
    if (await enterprisePlanTipsUtils.checkTipsVisible()) {
      return;
    }
    if (params.prompt.length > PROMPT_LENGTH_MAX) {
      message.error(
        `${"Prompt length should be less than"} ${PROMPT_LENGTH_MAX}`,
      );
      return;
    }
    setHasStartedGenerate(true);
    setData({
      model: params?.model_name,
      prompt: params?.prompt,
      negative_prompt: params?.negative_prompt,
      width: params?.width,
      height: params?.height,
      steps: params?.steps,
      scale: params?.cfg_scale,
      seed: params?.seed,
      sampler_name: params?.sampler_name,
    });
    setCurStep(TaskState.loading);
    aborter.current = new AbortController();
    const requestParams: Txt2ImgV3Request = {
      request: {
        model_name: params.model_name,
        prompt: params.prompt,
        negative_prompt: params.negative_prompt,
        sampler_name: params.sampler_name,
        steps: params.steps,
        seed: params.seed,
        width: params.width,
        height: params.height,
        image_num: params.batch_size,
        guidance_scale: params.guidance_scale,
      },
      extra: {
        enterprise_plan: {
          enabled: enterprisePlanTipsUtils.isUseEnterprise(),
        },
      },
    };
    if (params.clip_skip > 0) {
      requestParams.request.clip_skip = params.clip_skip;
    }
    if (params.loras && params.loras.length > 0) {
      requestParams.request.loras = params.loras
        .filter((p: any) => !!p.modelName)
        .map((l: any) => ({
          model_name: l.modelName,
          strength: l.weight,
        }));
    }
    if (params.sd_refiner) {
      requestParams.request.refiner = {
        switch_at: params.sd_refiner.switchAt,
      };
    }
    textToImageWithProgressV3(
      apiKey,
      requestParams,
      onProgress,
      onFinish,
      onFail,
      onSubmitTaskSuccess,
      {
        source: getApiSource(rootPage),
        abortSignal: aborter.current?.signal,
      },
    );
  }, [
    onNeedLogin,
    onProgress,
    onFail,
    onFinish,
    onSubmitTaskSuccess,
    apiKey,
    params,
    rootPage,
    userState,
  ]);
  const updateByModelInfo = useCallback(
    (modelDetails: ModelDetails | Model) => {
      const isSdxl =
        modelDetails.is_sdxl === undefined
          ? DEFAULT_MODEL_IS_SDXL
          : modelDetails.is_sdxl;
      setIsCurModelSDXL(isSdxl);
      const curBaseModel =
        modelDetails.base_model == undefined
          ? DEFAULT_MODEL_BASE_MODEL
          : modelDetails.base_model;
      setCurBaseModel(curBaseModel);
      setIsCurModelSD3(modelDetails.is_sd3 || false);
      if (params.model_id !== (modelDetails as ModelDetails).model_id) {
        clearParams();
      }
      const cases = defaultCases[FUNC_NAME.TXT2IMG]?.filter(
        (c) => c.model_id === (modelDetails as ModelDetails).model_id,
      );
      setUseCases(cases);
      if (cases.length === 0 && (modelDetails as ModelDetails).prompt) {
        setUseCases([getDefaultModelParams(modelDetails as ModelDetails)]);
        setCurCase(-1);
      }
    },
    [clearParams, params],
  );
  const formItems: TabsItem[] = [
    {
      key: "essential",
      label: "Essential",
      children: (
        <div className={`${styles.form_wrapper} scrollBar_container`}>
          <div className={styles.panel_box}>
            <div style={{ flex: 1, width: "100%" }}>
              <label className={styles.form_title}>{"Model"}</label>
              <ModelSelector
                open={openModelSelector}
                baseModel={baseModelFilter}
                modelId={params.model_id}
                modelType={ModelType.base}
                value={params.model_name}
                fieldProps={{ disabled }}
                onModelSelect={updateByModelInfo}
              />
            </div>
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={{
                ...widgets.promptWidget(),
                ...(isCurModelSD3
                  ? {
                      placeholder:
                        "Long, detailed prompts up to 10,000 characters. But the longer and more complex the prompt, the more likely something will be missing. Avoid negative prompts.",
                    }
                  : {}),
              }}
              fieldProps={{
                disabled,
                maxLength: PROMPT_LENGTH_MAX,
              }}
              value={params.prompt}
              onFocus={() => {
                onParamFocus?.("prompt");
              }}
              onBlur={() => {
                onParamBlur?.("prompt");
              }}
            />
            {useCases.length > 0 && (
              <span
                className={`${styles.try_example} cursor-pointer border flex items-center justify-center rounded-sm`}
                onClick={() => {
                  if (useCases.length === 1) {
                    setParams({ ...useCases[0] });
                    return;
                  }
                  const len = useCases.length;
                  const getNewIdx = (): number => {
                    const i = Math.floor(Math.random() * len);
                    if (i === curCase) {
                      return getNewIdx();
                    }
                    setCurCase(i);
                    return i;
                  };
                  setParams({ ...useCases[getNewIdx()] });
                }}
              >
                {"Try an example"}
                {useCases.length > 1 ? (
                  <RefreshCcw width={12} className="ml-2" />
                ) : null}
              </span>
            )}
          </div>
          <div className={styles.panel_box}>
            <div style={{ flex: 1, width: "100%" }}>
              <label className={styles.form_title}>
                {"Width & Height" + " "}
                <Tips content={modelApiPlaygroundFormWidthHeightTips} />
              </label>
              <ImgSize
                minWidth={widgets.widthWidget().numberProps?.min}
                minHeight={widgets.heightWidget().numberProps?.min}
                maxWidth={widgets.widthWidget().numberProps?.max}
                maxHeight={widgets.heightWidget().numberProps?.max}
                width={params["width"]}
                height={params["height"]}
                fieldProps={{ disabled }}
                onWidthChange={(val) => {
                  if (val) {
                    setParams({ width: val });
                  }
                }}
                onHeightChange={(val) => {
                  if (val) {
                    setParams({ height: val });
                  }
                }}
              />
            </div>
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={widgets.stepsWidget()}
              fieldProps={{ disabled }}
              value={params["steps"]}
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
              widgetProps={widgets.imageNumWidget()}
              fieldProps={{ disabled }}
              value={params["batch_size"]}
              onFocus={() => {
                onParamFocus?.("batch_size");
              }}
              onBlur={() => {
                onParamBlur?.("batch_size");
              }}
            />
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={widgets.guidanceScaleWidget()}
              fieldProps={{ disabled }}
              value={params["guidance_scale"]}
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
              fieldProps={{ disabled }}
              value={params["seed"]}
              onFocus={() => {
                onParamFocus?.("seed");
              }}
              onBlur={() => {
                onParamBlur?.("seed");
              }}
            />
          </div>
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
                disabled,
                maxLength: PROMPT_LENGTH_MAX,
              }}
              value={params["negative_prompt"]}
              onFocus={() => {
                onParamFocus?.("negative_prompt");
              }}
              onBlur={() => {
                onParamBlur?.("negative_prompt");
              }}
            />
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={widgets.samplerWidget()}
              fieldProps={{ disabled }}
              value={params["sampler_name"]}
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
              widgetProps={widgets.clipSkipWidget()}
              fieldProps={{ disabled }}
              value={params["clip_skip"]}
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
              disabled={isCurModelSD3}
              params={params.loras}
              baseModel={curBaseModel}
              loading={[TaskState.loading, TaskState.generating].includes(
                curStep,
              )}
              onFocus={() => {
                onParamFocus?.("clip_skip");
              }}
              onBlur={() => {
                onParamBlur?.("clip_skip");
              }}
              onChange={(loraParams) => {
                console.log("lora params:", loraParams);
                setParams({ loras: loraParams });
              }}
              isSDXL={isCurModelSDXL}
              isInpainting={false}
            />
          </div>
          {isCurModelSDXL && (
            <div className={styles.panel_box}>
              <RefinerForm
                params={params.sd_refiner}
                loading={[TaskState.loading, TaskState.generating].includes(
                  curStep,
                )}
                onFocus={() => {
                  onParamFocus?.("clip_skip");
                }}
                onBlur={() => {
                  onParamBlur?.("clip_skip");
                }}
                onChange={(refinerParams) => {
                  console.log(refinerParams);
                  if (refinerParams.modelName === "None") {
                    setParams({ sd_refiner: undefined });
                    return;
                  }
                  setParams({ sd_refiner: refinerParams });
                }}
              />
            </div>
          )}
        </div>
      ),
    },
  ];
  return (
    <DemoWrapper
      withTabs
      rootPage={rootPage}
      funcInfo={funcInfo}
      formWidth={420}
      formContent={
        <div className={styles.panel_body}>
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
        </div>
      }
      formFoot={
        <div className={baseStyles.btn_group}>
          <PrimaryBtn
            type="secondary"
            className={baseStyles.gen_btn}
            id={CLICK_BTN_IDs.PLAYGROUND_GEN_BTN_ID}
            elAttrs={{
              "data-gtm-product-name": funcInfo.name || "",
            }}
            onClick={handleGenerate}
            loading={
              curStep === TaskState.generating || curStep === TaskState.loading
            }
            disabled={!params.prompt}
          >
            {"Generate"}
          </PrimaryBtn>
          {(curStep === TaskState.generating ||
            curStep === TaskState.loading) && (
            <Button
              variant="ghost"
              className={baseStyles.cancel_btn}
              onClick={() => {
                showCancelConfirm?.(() => {
                  aborter.current?.abort();
                  aborter.current = null;
                  setCurStep(TaskState.init);
                  resultInfo.current = {};
                });
              }}
            >
              {"Cancel"}
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
        <div>
          {curStep === TaskState.finished && (
            <ShareLinkBtn params={params} seed={resultSeed} />
          )}
          <div className={`${styles.result} scrollBar_container`}>
            <div
              className={`flex flex-wrap flex-auto ${styles.preview_img_list}`}
            >
              {[TaskState.init, TaskState.failed].includes(curStep) &&
                Array.from({ length: params.batch_size }).map((_, idx) => (
                  <PreviewImage key={idx} large={params.batch_size === 1} />
                ))}
              {curStep === TaskState.loading &&
                Array.from({ length: params.batch_size }).map((_, idx) => (
                  <PreviewImage
                    key={idx}
                    large={params.batch_size === 1}
                    loading
                  />
                ))}
              {curStep === TaskState.generating &&
                data.imgs?.map((url: string, idx: number) => (
                  <PreviewImage
                    key={idx}
                    url={url}
                    loading
                    large={data.imgs?.length === 1}
                  />
                ))}
              {curStep === TaskState.finished &&
                data.imgs?.map((url: string, idx: number) => (
                  <PreviewImage
                    key={idx}
                    url={url}
                    withPreview
                    large={data.imgs?.length === 1}
                  />
                ))}
            </div>
          </div>
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
