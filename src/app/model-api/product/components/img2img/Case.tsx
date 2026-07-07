"use client";

import { PreviewImage } from "@/components/ui/standard/preview-image";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import commonStyle from "../../style.module.scss";
import styles from "./Case.module.css";
import demoBaseStyle from "@/app/components/demos/base.module.scss";
import { CaseComponentProps, TaskState } from "../CaseWrapper/CaseWrapper";
import Dragger, { DraggerMethods } from "@/app/components/dragger/Dragger";
import PromptInput from "@/app/components/input/PromptInput/PromptInput";
import AutoHeightImage from "@/app/components/demos/AutoHeightImage";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import {
  downloadImage,
  getImgBase64FromPath,
  isImgBase64,
} from "@/lib/utils/media";
import ImagePlaceholder from "@/app/components/demos/ImagePlaceholder/ImagePlaceholder";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import defaultCases from "@/app/components/demos/defaultCases";
import { NOVITA_URL } from "@/constants/urls";

const defaultParams = defaultCases[FUNC_NAME.IMG2IMG][0];

export default function Case(props: CaseComponentProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [prompt, setPrompt] = useState("");
  const [curCase, setCurCase] = useState(-1);

  const dragger = useRef<DraggerMethods>(null);
  const genParams = useRef<{ [key: string]: any }>(defaultParams);

  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try image to image API</h2>
      <div className={`font-p text-center`}>
        Generate AI images with{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2> based
        on SDXL 1.0. Visit the{" "}
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.TXT2IMG}`}>
          <strong
            style={{
              textDecoration: "underline",
            }}
          >
            Playground
          </strong>{" "}
        </a>
        for access to more models and features.
      </div>
      <div className={styles.demo_wrapper}>
        <div className={styles.form_wrapper}>
          <Dragger
            ref={dragger}
            disabled={
              props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating
            }
            restrictions={{}}
            onUpload={(url: string) => {
              setImgSrc(url || "");
            }}
          />
          <div className={demoBaseStyle.cases_wrapper}>
            {defaultCases[FUNC_NAME.IMG2IMG].map((item, index) => (
              <div
                key={index}
                className={`${demoBaseStyle.case_item} ${
                  curCase === index ? demoBaseStyle.case_item_active : ""
                } ${
                  props.taskState === TaskState.loading ||
                  props.taskState === TaskState.generating
                    ? demoBaseStyle.case_item_disabled
                    : ""
                }
                `}
                onClick={() => {
                  if (
                    props.taskState === TaskState.loading ||
                    props.taskState === TaskState.generating
                  ) {
                    return;
                  }
                  setCurCase(index);
                  genParams.current = item;
                  if (item.init_images?.[0]) {
                    dragger.current?.setImg(item.init_images[0]);
                    setImgSrc(item.init_images[0]);
                  }
                  setPrompt(item.prompt);
                }}
              >
                <img
                  className={demoBaseStyle.case_img}
                  src={item.init_images?.[0]}
                  alt=""
                />
              </div>
            ))}
          </div>
          <PromptInput value={prompt} setValue={setPrompt} maxLine={6} />
          <div className={styles.btn_group}>
            <Button
              style={{
                height: 40,
                fontSize: "16px",
              }}
              onClick={async () => {
                let imgBase64 = imgSrc;
                if (!isImgBase64(imgSrc)) {
                  imgBase64 = await getImgBase64FromPath(imgSrc);
                }
                props.generate(
                  FUNC_NAME.IMG2IMG,
                  Object.assign({}, genParams.current, {
                    init_images: [imgBase64],
                    prompt,
                  }),
                );
              }}
              disabled={
                props.taskState === TaskState.loading ||
                props.taskState === TaskState.generating
              }
              data-gtm-product-name={FUNC_NAME.IMG2IMG}
              id={CLICK_BTN_IDs.PRODUCT_GEN_BTN_ID}
            >
              Generate
            </Button>
            {(props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating) && (
              <Button
                variant="ghost"
                className={styles.cancel_btn}
                onClick={() => {
                  props.cancel();
                }}
              >
                Cancel
              </Button>
            )}
            {props.taskState === TaskState.finished && (
              <Button
                variant="ghost"
                className={styles.dl_btn}
                id={CLICK_BTN_IDs.DOWNLOAD_BTN_ID}
                onClick={() => {
                  downloadImage(props.resultImg);
                }}
                disabled={!props.resultImg}
              >
                Download
              </Button>
            )}
          </div>
        </div>
        <div className={styles.result_wrapper}>
          <div className={styles.preview_img_wrapper}>
            {!imgSrc && <ImagePlaceholder large />}
            {imgSrc && !props.resultImg && (
              <div className={styles.preview_img_container}>
                <AutoHeightImage
                  className={`${styles.preview_img} ${styles.preview_img_origin}`}
                  maxHeight={512}
                  src={imgSrc}
                  alt="img"
                  loading={
                    props.taskState === TaskState.loading ||
                    props.taskState === TaskState.generating
                  }
                />
              </div>
            )}
            {props.resultImg && (
              <div className={`flex ${styles.preview_img_container}`}>
                <div
                  className={`${styles.preview_img} ${
                    props.resultImg ? "" : styles.preview_img_placeholder
                  }`}
                >
                  {props.taskState === TaskState.finished ? (
                    <PreviewImage
                      src={props.resultImg}
                      alt="img"
                      style={{
                        maxHeight: 512,
                      }}
                    />
                  ) : (
                    <img
                      src={props.resultImg}
                      alt="img"
                      style={{
                        height: 512,
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
