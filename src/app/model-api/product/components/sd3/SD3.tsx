"use client";

import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/standard/number-input";
import { Textarea } from "@/components/ui/textarea";
import { ValueSlider as Slider } from "@/components/ui/standard/value-slider";
import { PreviewImage } from "@/components/ui/standard/preview-image";
import Modal from "@/app/components/Modal/Modal";
import { TabsItems } from "@/components/ui/standard/tabs-items";
import { Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import styles from "./SD3.module.scss";
import { CaseComponentProps, TaskState } from "../CaseWrapper/CaseWrapper";
import Dragger, { DraggerMethods } from "./Dragger_new";
import AutoHeightImage from "@/app/components/demos/AutoHeightImage";
import { FUNC_DISPLAY_NAME, FUNC_NAME } from "@/app/models/constants/funcs";
import {
  downloadImage,
  getImgBase64FromPath,
  isImgBase64,
} from "@/lib/utils/media";
import ImagePlaceholder from "@/app/components/demos/ImagePlaceholder/ImagePlaceholder";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import defaultCases from "@/app/components/demos/defaultCases";
import { setSpecifyModelInfo } from "@/app/models/lib/utils";

const SD3_MODEL_NAME = "sd3_base_medium.safetensors";
export const SD3_PARAMS = {
  model_name: SD3_MODEL_NAME,
  width: 1024,
  height: 1024,
  steps: 15,
  image_num: 1,
};

function SD3Demo({
  func,
  props,
}: {
  func: FUNC_NAME;
  props: CaseComponentProps;
}) {
  const [imgSrc, setImgSrc] = useState("");
  const [prompt, setPrompt] = useState("");
  const [nPrompt, setNPrompt] = useState("");
  const [seed, setSeed] = useState(-1);
  const [strength, setStrength] = useState(0.7);
  const [useCases] = useState<{ [key: string]: any }[]>(
    func === FUNC_NAME.SD3_TXT2IMG
      ? defaultCases[FUNC_NAME.TXT2IMG]
      : defaultCases[FUNC_NAME.IMG2IMG],
  );
  const [curCase, setCurCase] = useState(-1);
  const [openExampleModal, setOpenExampleModal] = useState(false);

  const dragger = useRef<DraggerMethods>(null);

  useEffect(() => {
    setSpecifyModelInfo(SD3_PARAMS);
  }, []);

  return (
    <div className={`${styles.demo_content} flex`}>
      <Modal
        title="Select an example"
        open={openExampleModal}
        onCancel={() => {
          setOpenExampleModal(false);
        }}
        footer={null}
        zIndex={1001}
        width={380}
        styles={{
          content: {
            borderRadius: 8,
          },
          mask: {
            backdropFilter: "blur(14px)",
            background: "rgba(0,0,0,.35)",
          },
        }}
      >
        <div className="grid grid-cols-3 justify-center mt-5">
          {defaultCases[FUNC_NAME.IMG2IMG].map((example, idx) => {
            return (
              <div
                className={styles.img2img_example_item}
                key={idx}
                onClick={() => {
                  setPrompt(example.prompt);
                  setNPrompt(example.negative_prompt);
                  setImgSrc(example.init_images?.[0] || "");
                  setStrength(example.strength);
                  setOpenExampleModal(false);
                }}
              >
                <img src={example.init_images?.[0] || ""} alt="" />
              </div>
            );
          })}
        </div>
      </Modal>
      <div className={`${styles.form_wrapper} flex flex-col`}>
        <div className={`${styles.form_item} flex flex-col gap-y-3`}>
          {func === FUNC_NAME.SD3_TXT2IMG && (
            <Button
              variant="link"
              size="sm"
              className={styles.try_btn}
              onClick={() => {
                // if (func === FUNC_NAME.SD3_IMG2IMG) {
                //   setOpenExampleModal(true);
                //   return;
                // }
                let sample;
                if (useCases.length === 1) {
                  sample = useCases[0];
                } else if (useCases.length > 1) {
                  const len = useCases.length;
                  const getNewIdx = (): number => {
                    const i = Math.floor(Math.random() * len);
                    if (i === curCase) {
                      return getNewIdx();
                    }
                    setCurCase(i);
                    return i;
                  };
                  sample = useCases[getNewIdx()];
                }
                if (!sample) {
                  return;
                }
                setPrompt(sample.prompt);
                setNPrompt(sample.negative_prompt);
                setStrength(sample.strength);
              }}
            >
              Try an example
            </Button>
          )}
          <label>Image Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            draggable={false}
            style={{ resize: "none", lineHeight: "150%", padding: 12 }}
            disabled={
              props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating
            }
          />
        </div>
        <div className={`${styles.form_item} flex flex-col gap-y-3`}>
          <label>Negative Prompt</label>
          <Textarea
            value={nPrompt}
            onChange={(e) => setNPrompt(e.target.value)}
            rows={3}
            draggable={false}
            style={{ resize: "none", lineHeight: "150%", padding: 12 }}
            disabled={
              props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating
            }
          />
        </div>
        {func === FUNC_NAME.SD3_IMG2IMG && (
          <div className={`${styles.form_item} flex flex-col gap-y-2`}>
            <label>Strength</label>
            <div className="flex gap-x-3">
              <Slider
                className="flex-1"
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => {
                  setStrength(value);
                }}
                value={strength}
                disabled={
                  props.taskState === TaskState.loading ||
                  props.taskState === TaskState.generating
                }
              />
              <NumberInput
                className={styles.input}
                disabled={
                  props.taskState === TaskState.loading ||
                  props.taskState === TaskState.generating
                }
                min={0}
                max={1}
                step={0.01}
                onChange={(value) => {
                  value !== null && setStrength(value);
                }}
                value={strength}
                controls={false}
              />
            </div>
          </div>
        )}
        <div className={`${styles.form_item} flex gap-x-3 items-center`}>
          <label>Seed</label>
          <NumberInput
            className={`${styles.input} flex-1`}
            value={seed}
            min={-1}
            controls={false}
            onChange={(val) => {
              val !== null && setSeed(val);
            }}
            disabled={
              props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating
            }
          />
        </div>
        {func === FUNC_NAME.SD3_IMG2IMG && (
          <Dragger
            draggerStyle={{ width: "100%", height: 144 }}
            ref={dragger}
            disabled={
              props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating
            }
            restrictions={{}}
            onUpload={(url: string) => {
              setImgSrc(url || "");
            }}
            curValue={imgSrc}
          />
        )}
        <div
          className={`${styles.btn_group} flex items-center gap-x-2 mt-auto`}
        >
          <Button
            className="flex-1"
            style={{
              height: 54,
              fontSize: 16,
            }}
            onClick={async () => {
              if (func === FUNC_NAME.SD3_TXT2IMG) {
                props.generate(func, {
                  prompt,
                  negative_prompt: nPrompt,
                  seed,
                });
                return;
              }
              let imgBase64 = imgSrc;
              if (!isImgBase64(imgSrc)) {
                imgBase64 = await getImgBase64FromPath(imgSrc);
              }
              props.generate(func, {
                init_images: [imgBase64],
                prompt,
                negative_prompt: nPrompt,
                seed,
                strength,
              });
            }}
            disabled={
              props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating ||
              !prompt ||
              (func === FUNC_NAME.SD3_IMG2IMG && !imgSrc)
            }
            id={CLICK_BTN_IDs.PRODUCT_GEN_BTN_ID}
            data-gtm-product-name="sd3"
          >
            {(props.taskState === TaskState.loading ||
              props.taskState === TaskState.generating) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Generate
          </Button>
          {(props.taskState === TaskState.loading ||
            props.taskState === TaskState.generating) && (
            <Button
              variant="outline"
              className="flex-1"
              style={{ height: 54, fontSize: 16 }}
              onClick={() => {
                props.cancel();
              }}
            >
              Cancel
            </Button>
          )}
          {props.taskState === TaskState.finished && (
            <Button
              variant="outline"
              className="flex-1"
              style={{ height: 54, fontSize: 16 }}
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
      <div
        className={`${styles.result_wrapper} flex-1 flex items-center justify-center`}
      >
        <div
          className={`w-full h-full flex items-center justify-center relative`}
        >
          {props.taskState === TaskState.init && !imgSrc && (
            <ImagePlaceholder large noborder />
          )}
          {(props.taskState === TaskState.loading ||
            props.taskState === TaskState.generating) &&
            !imgSrc && (
              <div
                className={`flex justify-center items-center ${styles.preview_spin}`}
              >
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            )}
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
  );
}

export default function SD3(props: CaseComponentProps) {
  const items = [
    {
      key: FUNC_NAME.SD3_TXT2IMG,
      label: FUNC_DISPLAY_NAME.TXT2IMG,
      children: <SD3Demo func={FUNC_NAME.SD3_TXT2IMG} props={props} />,
    },
    {
      key: FUNC_NAME.SD3_IMG2IMG,
      label: FUNC_DISPLAY_NAME.IMG2IMG,
      children: <SD3Demo func={FUNC_NAME.SD3_IMG2IMG} props={props} />,
    },
  ];
  return (
    <div className="max_width_container">
      <TabsItems
        defaultActiveKey={FUNC_NAME.SD3_TXT2IMG}
        items={items}
        onChange={() => {
          props.setTaskState(TaskState.init);
        }}
      />
    </div>
  );
}
