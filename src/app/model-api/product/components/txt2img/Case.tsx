"use client";

import { PreviewImage } from "@/components/ui/standard/preview-image";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import commonStyle from "../../style.module.scss";
import styles from "./Case.module.css";
import { CaseComponentProps, TaskState } from "../CaseWrapper/CaseWrapper";
import PromptInput from "@/app/components/input/PromptInput/PromptInput";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { downloadImage } from "@/lib/utils/media";
import ImagePlaceholder from "@/app/components/demos/ImagePlaceholder/ImagePlaceholder";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import defaultCases from "@/app/components/demos/defaultCases";
import { NOVITA_URL } from "@/constants/urls";

const defaultParams = defaultCases[FUNC_NAME.TXT2IMG][0];

export default function Case(props: CaseComponentProps) {
  const [prompt, setPrompt] = useState("");
  const [curCase, setCurCase] = useState(-1);

  const genParams = useRef<{ [key: string]: any }>(defaultParams);

  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <div className={styles.main}>
        <h2 className={`font-h3 text-center mb-5`}>Try text to image</h2>
        <p className={`font-p text-center`}>
          Generate AI images with{" "}
          <span className={commonStyle.keywords_h2}>Stable Diffusion API</span>{" "}
          based on SDXL 1.0. Visit the{" "}
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
        </p>
      </div>
      <div className={styles.demo_wrapper}>
        <div className={styles.input_wrap}>
          <PromptInput
            disabled={
              props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating
            }
            value={prompt}
            setValue={setPrompt}
            large={true}
            maxLine={6}
            style={{
              marginRight: 8,
              border: 0,
            }}
          />
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
          <Button
            style={{
              height: 40,
              alignSelf: "flex-end",
              marginBottom: 8,
              fontSize: "16px",
            }}
            id={CLICK_BTN_IDs.PRODUCT_GEN_BTN_ID}
            data-gtm-product-name={FUNC_NAME.TXT2IMG}
            onClick={() => {
              props.generate(
                FUNC_NAME.TXT2IMG,
                Object.assign({}, genParams.current, {
                  width: 512,
                  height: 512,
                  prompt,
                }),
              );
              // props.generate(FUNC_NAME.TXT2IMG, { prompt });
            }}
            disabled={
              props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating
            }
          >
            Generate
          </Button>
        </div>
        <div className={styles.cases_wrapper}>
          {defaultCases[FUNC_NAME.TXT2IMG].map((item, index) => (
            <div
              key={index}
              className={`${styles.case_item} ${
                curCase === index ? styles.case_item_active : ""
              } ${
                props.taskState === TaskState.loading ||
                props.taskState === TaskState.generating
                  ? styles.case_item_disabled
                  : ""
              }`}
              onClick={() => {
                if (
                  props.taskState === TaskState.loading ||
                  props.taskState === TaskState.generating
                ) {
                  return;
                }
                setCurCase(index);
                setPrompt(item.prompt);
                genParams.current = item;
              }}
            >
              <img
                className={styles.case_img}
                src={item.result}
                alt="Novita AI img"
              />
            </div>
          ))}
          {/* <PreviewImage.PreviewGroup>
            {SAMPLES.map((item) => {
              return (
                <PreviewImage key={item} height={200} src={item} alt="Novita AI img" />
              );
            })}
          </div> */}
        </div>
        {/* {props.taskState === TaskState.loading || props.taskState === TaskState.generating || props.taskState === TaskState.finished && */}
        <div className={`flex ${styles.result_img_wrapper}`}>
          <div className={`flex ${styles.preview_img_container}`}>
            <div
              className={`${styles.preview_img} ${
                props.resultImg ? "" : styles.preview_img_placeholder
              }`}
            >
              {props.resultImg && (
                <>
                  {props.taskState === TaskState.finished ? (
                    <PreviewImage
                      src={props.resultImg}
                      alt="img"
                      style={{
                        maxHeight: 512,
                      }}
                    />
                  ) : (
                    <img src={props.resultImg} alt="img" />
                  )}
                </>
              )}
              {(props.taskState === TaskState.loading ||
                props.taskState === TaskState.generating) && (
                <div
                  className={`flex flex-wrap flex-auto ${styles.preview_spin}`}
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </div>
              )}
              {props.taskState === TaskState.init && <ImagePlaceholder large />}
            </div>
          </div>
          {props.resultImg && (
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
        {/* } */}
      </div>
    </div>
  );
}
