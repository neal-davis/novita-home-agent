import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import {
  Eye as EyeOutlined,
  EyeOff as EyeInvisibleOutlined,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import styles from "./RemoveBackground.module.css";
import baseStyles from "../base.module.scss";
import { removeBackground, getFailMsgV3 } from "@/api/api";
import Dragger from "@/app/components/dragger/Dragger";
import { TaskState, DemoProps } from "../DemoWrapper";
import { MAX_IMAGE_SIZE, getApiSource } from "@/constants/constants";
import {
  getGenBtnId,
  CLICK_BTN_IDs,
} from "@/app/components/analytics/constants";
import {
  downloadImage,
  getImgBase64FromPath,
  isImgBase64,
} from "@/lib/utils/media";
import AutoHeightImage from "../AutoHeightImage";
import PrimaryBtn from "../../button/Button";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import defaultCases from "../defaultCases";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { calcPrice } from "@/lib/utils/pricing";
import { formatMoneyDisplay } from "@/lib/utils/money";
const MAX_RES = 1600 * 10000;
const useCases = defaultCases[FUNC_NAME.REMOVE_BACKGROUND];
export default function RemoveBackground({
  apiKey,
  rootPage,
  funcInfo,
  onParamFocus,
  onParamChange,
  onParamBlur,
  onNeedLogin,
  onLowBalance,
  showCancelConfirm,
}: DemoProps) {
  const [imgSrc, setImgSrc] = useState(useCases[0].img);
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const [showOrigin, setShowOrigin] = useState(false);
  const aborter = useRef<AbortController | null>(null);
  const [curCase, setCurCase] = useState(0);
  const taskState = useRef(TaskState.init);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
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
  const estimatePrice = useMemo(() => {
    return calcPrice(FUNC_NAME.REMOVE_BACKGROUND).discountPrice ?? "-";
  }, []);
  const handleGenerate = useCallback(async () => {
    if (userState === UserState.logout) {
      onNeedLogin();
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
          onNeedLogin();
        } else if (
          code === ResponseCodeV3.REQUEST_INVALID &&
          reason === APIErrReasonV3.BALANCE_NOT_ENOUGH
        ) {
          onLowBalance();
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
    let img = imgSrc;
    if (!isImgBase64(img)) {
      img = await getImgBase64FromPath(img);
    }
    removeBackground(
      apiKey,
      {
        image_file: img,
        extra: {
          enterprise_plan: {
            enabled: enterprisePlanTipsUtils.isUseEnterprise(),
          },
        },
      },
      onFinish,
      onFail,
      {
        source: getApiSource(rootPage),
        abortSignal: aborter.current?.signal,
      },
    );
  }, [
    userState,
    imgSrc,
    apiKey,
    rootPage,
    onNeedLogin,
    dispatch,
    onLowBalance,
  ]);
  return (
    <DemoWrapper
      rootPage={rootPage}
      funcInfo={funcInfo}
      formContent={
        <>
          <Dragger
            disabled={generating}
            restrictions={{
              maxSize: MAX_IMAGE_SIZE,
              maxRes: MAX_RES,
            }}
            onUpload={(url: string) => {
              setImgSrc(url || "");
              if (curCase > -1 && url !== useCases[curCase]?.img) {
                setCurCase(-1);
              }
            }}
            curValue={imgSrc}
          />
          <div className={baseStyles.showcase_box}>
            <label className={baseStyles.title}>{"Showcase"}</label>
            <div className={baseStyles.cases_wrapper}>
              {useCases.map((item, index) => (
                <div
                  key={index}
                  className={`${baseStyles.case_item} ${curCase === index ? baseStyles.case_item_active : ""} ${generating ? baseStyles.case_item_disabled : ""}`}
                  onClick={() => {
                    if (generating) {
                      return;
                    }
                    setCurCase(index);
                    setImgSrc(useCases[index].img);
                  }}
                >
                  <img className={baseStyles.case_img} src={item.img} alt="" />
                </div>
              ))}
            </div>
          </div>
          <div className={baseStyles.btn_group_vertical}>
            <PrimaryBtn
              type="secondary"
              className={baseStyles.gen_btn}
              id={getGenBtnId(rootPage)}
              elAttrs={{
                "data-gtm-product-name": funcInfo.name,
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
            {estimatePrice && (
              <p className={baseStyles.price_info}>
                Estimated cost:
                <strong>{`$${formatMoneyDisplay(estimatePrice)}/image`}</strong>
              </p>
            )}
          </div>
        </>
      }
      resultContent={
        <div className={styles.preview_wrapper}>
          <div className={styles.preview_img_wrapper}>
            {!resultImgUrl && !imgSrc && <ImagePlaceholder large noborder />}
            {!resultImgUrl && imgSrc && (
              <div className={styles.preview_img_container}>
                <AutoHeightImage
                  maxHeight={rootPage === "product" ? 512 : undefined}
                  className={`${styles.preview_img} ${styles.preview_img_origin}`}
                  style={{
                    visibility:
                      !resultImgUrl || showOrigin ? "visible" : "hidden",
                  }}
                  src={imgSrc}
                  alt="img"
                  loading={generating}
                />
              </div>
            )}
            {resultImgUrl && (
              <div className={styles.preview_img_container}>
                {imgSrc && (
                  <AutoHeightImage
                    maxHeight={rootPage === "product" ? 512 : undefined}
                    className={`${styles.preview_img} ${styles.preview_img_origin}`}
                    style={{
                      visibility:
                        !resultImgUrl || showOrigin ? "visible" : "hidden",
                    }}
                    src={imgSrc}
                    alt="img"
                  />
                )}
                <img
                  className={`${styles.preview_img} ${styles.preview_img_result}`}
                  style={{
                    visibility: showOrigin ? "hidden" : "visible",
                  }}
                  src={resultImgUrl}
                  alt="img"
                />
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
              </div>
            )}
          </div>
        </div>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
