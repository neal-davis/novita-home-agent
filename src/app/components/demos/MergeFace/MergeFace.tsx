import { useState, useRef, useEffect, useMemo } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { Loader2 } from "lucide-react";
import { ResponseCodeV3, APIErrReasonV3 } from "novita-sdk";
import { useAppDispatch, useAppSelector } from "@/store";
import { UserState } from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import styles from "./MergeFace.module.scss";
import baseStyles from "../base.module.scss";
import { mergeFace, getFailMsgV3 } from "@/api/api";
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
import ImagePlaceholder from "../ImagePlaceholder/ImagePlaceholder";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import defaultCases from "../defaultCases";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { calcPrice } from "@/lib/utils/pricing";
import { formatMoneyDisplay } from "@/lib/utils/money";
import Tips from "../../Tips/Tips";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
const modelApiPlaygroundMergeFaceTipsDetail = [
  "Base image : Single-person portrait only, does not support multiple persons",
  "Face image: Only human faces, clear and recognizable. It does not support cartoon or animal facial images",
  "Image restrictions: Maximum 2048*2048 resolution, less than 30 MB",
];
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const useCases = defaultCases[FUNC_NAME.MERGE_FACE].slice(2);
export default function MergeFace(props: DemoProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [faceImgSrc, setFaceImgSrc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasStartedGenerate, setHasStartedGenerate] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [resultImgUrl, setResultImgUrl] = useState("");
  const [curBaseCase, setCurBaseCase] = useState(-1);
  const [curFaceCase, setCurFaceCase] = useState(-1);
  const [curTaskImgSrc, setCurTaskImgSrc] = useState("");
  const [curTaskFaceImgSrc, setCurTaskFaceImgSrc] = useState("");
  const aborter = useRef<AbortController | null>(null);
  const taskState = useRef(TaskState.init);
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user.state);
  const { onParamBlur, onParamChange, onParamFocus } = props;
  const estimatePrice = useMemo(() => {
    return calcPrice(FUNC_NAME.MERGE_FACE).discountPrice ?? "-";
  }, []);
  useEffect(() => {
    onParamChange?.("image_file", "");
    onParamChange?.("face_image_file", "");
  }, [onParamChange]);
  useEffect(() => {
    onParamFocus?.("image_file");
    onParamChange?.("image_file", imgSrc.split(";base64,")[1]);
    setTimeout(() => {
      onParamBlur?.("image_file");
    }, 1000);
  }, [imgSrc, onParamBlur, onParamChange, onParamFocus]);
  useEffect(() => {
    onParamFocus?.("face_image_file");
    onParamChange?.("face_image_file", faceImgSrc.split(";base64,")[1]);
    setTimeout(() => {
      onParamBlur?.("face_image_file");
    }, 1000);
  }, [faceImgSrc, onParamBlur, onParamChange, onParamFocus]);
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
    const src = imgSrc;
    const face = faceImgSrc;
    const onFinish = (img: string, taskId: string) => {
      setTaskId(taskId);
      setCurTaskImgSrc(src);
      setCurTaskFaceImgSrc(face);
      if (taskState.current !== TaskState.init) {
        setGenerating(false);
        taskState.current = TaskState.finished;
        setResultImgUrl(img);
        dispatch(fetchBalanceDetail() as any);
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
        setGenerating(false);
        taskState.current = TaskState.init;
        setResultImgUrl("");
      }
      if (code === ResponseCodeV3.CANCELED) {
        message.warning(getFailMsgV3(code, reason, msg));
      }
    };
    let imgFile = imgSrc;
    let faceImgFile = faceImgSrc;
    if (!isImgBase64(imgFile)) {
      imgFile = await getImgBase64FromPath(imgFile);
    }
    if (!isImgBase64(faceImgFile)) {
      faceImgFile = await getImgBase64FromPath(faceImgFile);
    }
    mergeFace(
      props.apiKey,
      {
        image_file: imgFile.split(";base64,")[1],
        face_image_file: faceImgFile.split(";base64,")[1],
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
      resultClassName={styles.demo_result_wrapper}
      rootPage={props.rootPage}
      funcInfo={props.funcInfo}
      formWidth={400}
      formContent={
        <>
          <div className={styles.dragger_wrapper}>
            <Dragger
              disabled={generating}
              className={styles.dragger}
              restrictions={{
                maxSize: MAX_IMAGE_SIZE,
                maxWidth: MAX_WIDTH,
                maxHeight: MAX_HEIGHT,
              }}
              onUpload={(url: string) => {
                setImgSrc(url || "");
                if (curBaseCase > -1) {
                  if (
                    isImgBase64(url) ||
                    url !== useCases[curBaseCase].image_file
                  ) {
                    setCurBaseCase(-1);
                  }
                }
              }}
              text={"Upload base image"}
              icon={<img src="/playground/face_1.svg" alt="face" />}
              curValue={imgSrc}
            />
            <Dragger
              disabled={generating}
              className={styles.dragger}
              restrictions={{
                maxSize: MAX_IMAGE_SIZE,
                maxWidth: MAX_WIDTH,
                maxHeight: MAX_HEIGHT,
              }}
              onUpload={(url: string) => {
                setFaceImgSrc(url || "");
                if (curFaceCase > -1) {
                  if (
                    isImgBase64(url) ||
                    url !== useCases[curFaceCase].face_image_file
                  ) {
                    setCurFaceCase(-1);
                  }
                }
              }}
              text={"Upload face image"}
              icon={<img src="/playground/face_2.svg" alt="face" />}
              curValue={faceImgSrc}
            />
          </div>
          <div className={baseStyles.btn_group_vertical}>
            <PrimaryBtn
              type="secondary"
              className={`${baseStyles.gen_btn} primary-btn`}
              id={getGenBtnId(props.rootPage)}
              elAttrs={{
                "data-gtm-product-name": props.funcInfo.name,
              }}
              onClick={handleGenerate}
              loading={generating}
              disabled={!imgSrc || !faceImgSrc}
            >
              {"Generate"}
            </PrimaryBtn>
            {generating && (
              <Button
                ghost={true}
                className={baseStyles.cancel_btn}
                onClick={() => {
                  props.showCancelConfirm?.(() => {
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
          {estimatePrice && (
            <p className={baseStyles.price_info}>
              Estimated cost:
              <strong>{`$${formatMoneyDisplay(estimatePrice)}/image`}</strong>
            </p>
          )}
          <div className={styles.tips_box}>
            <span className={styles.tips_title}>
              {"Tips: The difference of base image and face image"}
            </span>
            <Tips content={modelApiPlaygroundMergeFaceTipsDetail} />
          </div>
          <div className={baseStyles.showcase_box}>
            <label className={baseStyles.cases_title}>
              {"Choose base image"}
            </label>
            <div className={baseStyles.cases_wrapper}>
              {useCases.map((item, index) => (
                <div
                  key={index}
                  className={`${baseStyles.case_item} ${curBaseCase === index ? baseStyles.case_item_active : ""} ${generating ? baseStyles.case_item_disabled : ""}`}
                  onClick={() => {
                    if (generating) {
                      return;
                    }
                    if (index === curBaseCase) {
                      setCurBaseCase(-1);
                      setImgSrc("");
                    } else {
                      setCurBaseCase(index);
                      setImgSrc(item.image_file);
                    }
                  }}
                >
                  <div className={baseStyles.merge_img}>
                    <img
                      className={baseStyles.case_img}
                      src={item.image_file}
                      alt=""
                    />
                    {/* <img
              className={baseStyles.case_img}
              src={item.face_image_file}
              alt=""
            /> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={baseStyles.showcase_box}>
            <label className={baseStyles.cases_title}>
              {"Choose face image"}
            </label>
            <div className={baseStyles.cases_wrapper}>
              {useCases.map((item, index) => (
                <div
                  key={index}
                  className={`${baseStyles.case_item} ${curFaceCase === index ? baseStyles.case_item_active : ""} ${generating ? baseStyles.case_item_disabled : ""}`}
                  onClick={() => {
                    if (generating) {
                      return;
                    }
                    if (index === curFaceCase) {
                      setCurFaceCase(-1);
                      setFaceImgSrc("");
                    } else {
                      setCurFaceCase(index);
                      setFaceImgSrc(item.face_image_file);
                    }
                  }}
                >
                  <div className={baseStyles.merge_img}>
                    {/* <img
              className={baseStyles.case_img}
              src={item.image_file}
              alt=""
            /> */}
                    <img
                      className={baseStyles.case_img}
                      src={item.face_image_file}
                      alt=""
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      }
      resultContent={
        <>
          <div className={styles.preview_img_wrapper}>
            <div className={styles.result_img_wrapper}>
              {resultImgUrl ? (
                <div className={styles.preview_img_container}>
                  <AutoHeightImage
                    // maxHeight={props.rootPage === "product" ? 512 : undefined}
                    className={`${styles.preview_img} ${styles.preview_img_result}`}
                    src={resultImgUrl}
                    alt="img"
                    loading={generating}
                    withPreview={true}
                  />
                </div>
              ) : (
                <div className={styles.preview_img_container}>
                  <ImagePlaceholder
                    style={{ maxHeight: "100%" }}
                    noborder
                    content={
                      generating ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                      ) : undefined
                    }
                  />
                </div>
              )}
            </div>
            <div className={styles.ori_img_wrapper}>
              {/* {generating && <Loading />} */}
              <div className={styles.ori_img_container}>
                <p className={styles.img_title}>{"Base Image"}</p>
                {curTaskImgSrc && (
                  <AutoHeightImage
                    // maxHeight={props.rootPage === "product" ? 512 : undefined}
                    className={`${styles.preview_img} ${styles.preview_img_ori}`}
                    src={curTaskImgSrc}
                    alt="img"
                    withPreview={true}
                  />
                )}
              </div>
              <div className={styles.ori_img_container}>
                <p className={styles.img_title}>{"Face Image"}</p>
                {curTaskFaceImgSrc && (
                  <AutoHeightImage
                    // maxHeight={props.rootPage === "product" ? 512 : undefined}
                    className={`${styles.preview_img} ${styles.preview_img_ori}`}
                    src={curTaskFaceImgSrc}
                    alt="img"
                    withPreview={true}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      }
      hasStartedGenerate={hasStartedGenerate}
      taskId={taskId}
    />
  );
}
