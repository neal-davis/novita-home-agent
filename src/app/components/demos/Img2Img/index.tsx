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
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { TabsItems, type TabsItem } from "@/components/ui/standard/tabs-items";
import { ResponseCodeV3, APIErrReasonV3, Img2ImgV3Request } from "novita-sdk";
import { useAppSelector, useAppDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { TaskState, DemoProps } from "../DemoWrapper";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import Tips from "@/app/components/Tips/Tips";
import ImgSize from "@/app/components/input/ImgSize/ImgSize";
import ModelSelector from "@/app/components/input/ModelSelector/ModelSelectorV2";
import { ModelType } from "@/app/model-api/model/components/modelList/modelList";
import LoraForm from "@/app/components/demos/components/LoraForm";
import { imageToImageWithProgressV3, getFailMsgV3 } from "@/api/api";
import { FormItem } from "@/app/models/image/components/FormItem/FormItem";
import { KeyContext } from "@/app/models/lib/context";
import * as widgets from "@/app/models/lib/widgets";
import { getImgBase64FromPath, isImgBase64 } from "@/lib/utils/media";
import RefinerForm from "@/app/components/demos/components/RefinerForm";
import IPAdapterForm from "@/app/components/demos/components/IPAdapterForm";
import ControlnetForm from "@/app/components/demos/components/ControlnetForm";
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
export default function Img2Img({
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
  const [taskId, setTaskId] = useState("");
  const [useCases, setUseCases] = useState<
    {
      [key: string]: any;
    }[]
  >([]);
  const [curCase, setCurCase] = useState(-1);
  const [curTabKey, setCurTabKey] = useState("essential");
  const [isCurModelSDXL, setIsCurModelSDXL] = useState(DEFAULT_MODEL_IS_SDXL);
  const [isCurModelSD3, setIsCurModelSD3] = useState(false);
  const [curBaseModel, setCurBaseModel] = useState<string>(
    DEFAULT_MODEL_BASE_MODEL,
  );
  const [showcaseVisible, setShowcaseVisible] = useState(true);
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
      calcPrice(FUNC_NAME.IMG2IMG, {
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
      const isSpecifyModel = Boolean(urlParams.get("specify-model"));
      url.search = "";
      router.replace(url.toString(), { shallow: true } as any);
      let modelId = "";
      if (isSpecifyModel) {
        const modelInfo = getSpecifyModelInfo();
        setParams(modelInfo);
      } else {
        modelId = defaultCases[FUNC_NAME.IMG2IMG]?.[0].model_id;
        setParams({
          model_id: modelId,
          model_name: defaultCases[FUNC_NAME.IMG2IMG]?.[0].model_name,
        });
        const cases =
          defaultCases[FUNC_NAME.IMG2IMG]?.filter(
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
    (imgs: string[]) => {
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
    let requestParamsValid = true;
    let paramsInvalidMsg = "";
    const requestParams: Img2ImgV3Request = {
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
        image_base64: params.init_images[0],
        strength: params.strength,
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
    if (params.init_images[0] && !isImgBase64(params.init_images[0])) {
      const b64s = await getImgBase64FromPath(params.init_images[0]);
      requestParams.request.image_base64 = b64s;
    }
    if (params.ip_adapters) {
      requestParams.request.ip_adapters = params.ip_adapters.map((a: any) => {
        if (!a.imageBase64) {
          paramsInvalidMsg = "Image in IP-Adapter is required.";
          requestParamsValid = false;
          return;
        }
        return {
          model_name: a.modelName,
          image_base64: a.imageBase64,
          strength: a.strength,
        };
      });
    }
    if (params.controlnet && params.controlnet.units) {
      requestParams.request.controlnet = {
        units: params.controlnet.units.map((cn: ControlnetUnitParams) => {
          const u: Record<string, any> = {
            model_name: cn.modelName,
            image_base64: cn.imageBase64,
            strength: cn.strength,
            guidance_start: cn.guidanceStart,
            guidance_end: cn.guidanceEnd,
          };
          if (cn.preprocessor !== "none") {
            u.preprocessor = cn.preprocessor;
          }
          return u;
        }),
      };
    }
    if (!requestParamsValid) {
      setCurStep(TaskState.failed);
      message.error(paramsInvalidMsg);
      setData({});
      return;
    }
    imageToImageWithProgressV3(
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
      const bModel =
        modelDetails.base_model == undefined
          ? DEFAULT_MODEL_BASE_MODEL
          : modelDetails.base_model;
      setCurBaseModel(bModel);
      setIsCurModelSD3(modelDetails.is_sd3 || false);
      if (params.model_id !== (modelDetails as ModelDetails).model_id) {
        setShowcaseVisible(false);
        clearParams();
      }
      const cases =
        defaultCases[funcInfo.name]?.filter(
          (c) => c.model_id === (modelDetails as ModelDetails).model_id,
        ) || [];
      if (cases.length > 0) {
        setUseCases(cases);
      } else {
        setUseCases([getDefaultModelParams(modelDetails as ModelDetails)]);
        setCurCase(-1);
      }
    },
    [clearParams, funcInfo, params],
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
                modelId={params.model_id}
                modelType={ModelType.base}
                value={params.model_name}
                fieldProps={{ disabled }}
                onModelSelect={updateByModelInfo}
              />
            </div>
          </div>
          <div className={`${styles.panel_box} ${styles.img2img_init_img}`}>
            <FormItem
              widgetProps={widgets.imageWidget(true)}
              onFocus={() => {
                onParamFocus?.("init_images");
              }}
              onBlur={() => {
                onParamBlur?.("init_images");
              }}
              value={params["init_images"]?.[0]}
              onChange={(val) => {
                if (
                  curCase > -1 &&
                  val !==
                    defaultCases[FUNC_NAME.IMG2IMG][curCase].init_images?.[0]
                ) {
                  setCurCase(-1);
                }
              }}
            />
            {showcaseVisible &&
              useCases.filter((c) => c.init_images?.length > 0).length > 0 && (
                <div className={styles.img2img_cases_wrapper}>
                  <div className={styles.img2img_cases_title}>{"Showcase"}</div>
                  <div className={styles.img2img_cases_content}>
                    {useCases.map((item, index) => (
                      <div
                        key={index}
                        className={`${styles.img2img_case_item} ${curCase === index ? styles.case_item_active : ""} ${
                          curStep === TaskState.loading ||
                          curStep === TaskState.generating
                            ? styles.case_item_disabled
                            : ""
                        }`}
                        onClick={() => {
                          if (
                            curStep === TaskState.loading ||
                            curStep === TaskState.generating
                          ) {
                            return;
                          }
                          if (index === curCase) {
                            setCurCase(-1);
                            setParams((v) => ({
                              ...v,
                              init_images: [],
                            }));
                            return;
                          }
                          setCurCase(index);
                          setParams({
                            ...params,
                            ...item,
                          });
                        }}
                      >
                        <img
                          className={styles.img2img_case_img}
                          src={item.init_images?.[0]}
                          alt=""
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
                maxLength: PROMPT_LENGTH_MAX,
              }}
              value={params["prompt"]}
              onFocus={() => {
                onParamFocus?.("prompt");
              }}
              onBlur={() => {
                onParamBlur?.("prompt");
              }}
            />
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
                fieldProps={{
                  disabled:
                    curStep === TaskState.loading ||
                    curStep === TaskState.generating,
                }}
                onWidthChange={(val) => {
                  if (val) {
                    setParams((v) => ({
                      ...v,
                      width: val,
                    }));
                  }
                }}
                onHeightChange={(val) => {
                  if (val) {
                    setParams((v) => ({
                      ...v,
                      height: val,
                    }));
                  }
                }}
              />
            </div>
          </div>
          <div className={styles.panel_box}>
            <FormItem
              widgetProps={widgets.stepsWidget()}
              fieldProps={{
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
              }}
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
              fieldProps={{
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
              }}
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
              fieldProps={{
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
              }}
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
              fieldProps={{
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
              }}
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
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
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
              widgetProps={widgets.strengthWidget()}
              fieldProps={{
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
              }}
              value={params["strength"]}
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
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
              }}
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
              fieldProps={{
                disabled:
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating,
              }}
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
            <ControlnetForm
              disabled={isCurModelSD3}
              params={params.controlnet?.units || []}
              loading={
                curStep === TaskState.loading ||
                curStep === TaskState.generating
              }
              onFocus={() => {
                onParamFocus?.("controlnet");
              }}
              onBlur={() => {
                onParamBlur?.("controlnet");
              }}
              onChange={(cnParams: any) => {
                console.log("controlnet params:", cnParams);
                setParams({
                  ...params,
                  controlnet: {
                    units: cnParams,
                  },
                });
              }}
              baseModel={curBaseModel}
            />
          </div>

          <div className={styles.panel_box}>
            <LoraForm
              disabled={isCurModelSD3}
              params={params.loras}
              baseModel={curBaseModel}
              loading={
                curStep === TaskState.loading ||
                curStep === TaskState.generating
              }
              onFocus={() => {
                onParamFocus?.("loras");
              }}
              onBlur={() => {
                onParamBlur?.("loras");
              }}
              onChange={(loraParams) => {
                console.log("lora params:", loraParams);
                setParams({
                  ...params,
                  loras: loraParams,
                });
              }}
              isSDXL={isCurModelSDXL}
              isInpainting={false}
            />
          </div>
          {isCurModelSDXL && (
            <div className={styles.panel_box}>
              <RefinerForm
                params={params.sd_refiner}
                loading={
                  curStep === TaskState.loading ||
                  curStep === TaskState.generating
                }
                onFocus={() => {
                  onParamFocus?.("sd_refiner.switch_at");
                }}
                onBlur={() => {
                  onParamBlur?.("sd_refiner.switch_at");
                }}
                onChange={(refinerParams) => {
                  console.log(refinerParams);
                  if (refinerParams.modelName === "None") {
                    setParams((v) => ({
                      ...v,
                      sd_refiner: undefined,
                    }));
                    return;
                  }
                  setParams({
                    ...params,
                    sd_refiner: refinerParams,
                  });
                }}
              />
            </div>
          )}
          <div className={styles.panel_box}>
            <IPAdapterForm // TODO: make it the same as controlnet/lora
              params={params.ip_adapters?.[0]}
              loading={
                curStep === TaskState.loading ||
                curStep === TaskState.generating
              }
              baseModel={curBaseModel}
              onChange={(ipAdapterParams: any) => {
                if (ipAdapterParams.enable === false) {
                  setParams((v) => ({
                    ...v,
                    ip_adapters: undefined,
                  }));
                  return;
                }
                setParams({
                  ...params,
                  ip_adapters: [ipAdapterParams],
                });
              }}
            />
          </div>
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
              ghost
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
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
