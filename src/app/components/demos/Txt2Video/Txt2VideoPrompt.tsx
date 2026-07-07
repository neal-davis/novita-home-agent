import { useState, useEffect } from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { X as CloseOutlined, Plus as PlusOutlined } from "lucide-react";
import styles from "./Txt2Video.module.scss";
import PromptInput from "../../input/PromptInput/PromptInput";
type Txt2VideoPromptFormItemProps = {
  param: {
    prompt: string;
    startFrame: number;
    frames: number;
  };
  onFocus: () => void;
  onChange: (prompt: string, frames: number) => void;
  onBlur: () => void;
};
const DEFAULT_CLIP_FRAME = 16;
export const MIN_CLIP_FRAME = 8;
export const MAX_CLIP_FRAME = 64;
export const TOTAL_MAX_FRAME = 128;
const Txt2VideoPromptFormItem = ({
  param,
  onFocus,
  onChange,
  onBlur,
}: Txt2VideoPromptFormItemProps) => {
  const [prompt, setPrompt] = useState<string>("");
  // const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(
    param.frames
      ? param.startFrame + param.frames - 1
      : param.startFrame + DEFAULT_CLIP_FRAME - 1,
  );
  useEffect(() => {
    if (param.prompt) {
      setPrompt(param.prompt);
    }
    setEndFrame(
      param.startFrame + Math.max(param.frames - 1, MIN_CLIP_FRAME - 1),
    );
  }, [param]);
  return (
    <div className={styles.prompt_form_item}>
      <div className={styles.prompt_frames}>
        <div className={styles.prompt_form_item_input}>
          <label>{"Frames"}:</label>
          <div>
            <span>{param.startFrame} ~ </span>
            <NumberInput
              className={styles.frames_input}
              min={Math.min(param.startFrame + MIN_CLIP_FRAME, TOTAL_MAX_FRAME)}
              max={Math.min(param.startFrame + MAX_CLIP_FRAME, TOTAL_MAX_FRAME)}
              value={endFrame}
              onChange={(value) => {
                setEndFrame(value || endFrame);
                // if (prompt) {
                onChange(prompt, (value || endFrame) - param.startFrame + 1);
                // }
              }}
              onFocus={onFocus}
              onBlur={onBlur}
              controls={false}
            />
          </div>
        </div>
        <div
          className={styles.prompt_form_item_input}
          style={{ flex: 1, marginRight: 10 }}
        >
          <label>{"Prompt"}:</label>
          <PromptInput
            value={prompt}
            setValue={setPrompt}
            maxLine={3}
            onFocus={() => {
              onFocus();
            }}
            onBlur={() => {
              onBlur();
            }}
            onChange={(val: string) => {
              onChange(val, endFrame - param.startFrame + 1);
            }}
          />
        </div>
      </div>
    </div>
  );
};
function genId(): string {
  return Math.random().toString(36).substring(2, 10);
}
type PromptFormProps = {
  loading?: boolean;
  params: {
    id?: string;
    prompt: string;
    frames: number;
  }[];
  onFocus: () => void;
  onChange: (
    params: {
      prompt: string;
      frames: number;
    }[],
  ) => void;
  onBlur: () => void;
};
export default function Txt2VideoPromptForm({
  loading,
  onFocus,
  onChange,
  onBlur,
  params,
}: PromptFormProps) {
  const [promptParams, setPromptParams] = useState<
    {
      id: string;
      prompt: string;
      startFrame: number;
      frames: number;
    }[]
  >([]);
  useEffect(() => {
    if (Array.isArray(params)) {
      let curFrame = 0;
      const p = params.map((p) => {
        const newP = {
          id: p.id || genId(),
          prompt: p.prompt,
          startFrame: curFrame,
          frames: p.frames,
        };
        curFrame += p.frames;
        return newP;
      });
      setPromptParams(p);
    } else {
      setPromptParams([
        {
          id: genId(),
          prompt: "",
          startFrame: 0,
          frames: DEFAULT_CLIP_FRAME,
        },
      ]);
      onChange([
        {
          prompt: "",
          frames: 0,
        },
      ]);
    }
  }, [onChange, params]);
  // useEffect(() => {
  //   if (Array.isArray(params)) {
  //     let curFrame = 0;
  //     const p = params.map((p) => {
  //       const newP = {
  //         id: p.id || genId(),
  //         prompt: p.prompt,
  //         startFrame: curFrame,
  //         frames: p.frames,
  //       };
  //       curFrame += p.frames;
  //       return newP;
  //     });
  //     setPromptParams(p);
  //   }
  // }, [params])
  return (
    <div
      className={`${styles.txt2video_prompt_form} ${styles.playground_form_item}`}
    >
      {loading && <div className={styles.form_loading}></div>}
      {promptParams.map((p, idx) => (
        <div key={p.id} className={styles.prompt_form_item_wrapper}>
          <Txt2VideoPromptFormItem
            param={p}
            onFocus={onFocus}
            onChange={(prompt: string, frames: number) => {
              const newP = promptParams;
              const oldP = promptParams[idx];
              newP[idx] = {
                id: oldP?.id || genId(),
                prompt,
                startFrame: oldP?.startFrame || 0,
                frames: frames,
              };
              for (let i = idx + 1; i < newP.length; i++) {
                newP[i] = {
                  ...newP[i],
                  startFrame: newP[i - 1].startFrame + newP[i - 1].frames,
                };
              }
              setPromptParams(newP);
              onChange(newP);
            }}
            onBlur={onBlur}
          />
          {promptParams.length >= 1 && (
            <span
              className={styles.prompt_form_item_close}
              onClick={() => {
                const newP = promptParams
                  .slice(0, idx)
                  .concat(promptParams.slice(idx + 1));
                for (let i = 0; i < newP.length; i++) {
                  const lastP = newP[i - 1];
                  newP[i] = {
                    ...newP[i],
                    startFrame: lastP ? lastP.startFrame + lastP.frames : 0,
                  };
                }
                setPromptParams(newP);
                onChange(newP);
              }}
            >
              <CloseOutlined />
            </span>
          )}
        </div>
      ))}
      {promptParams.length < 16 && (
        <div className={styles.prompt_form_item_add}>
          <span
            className={styles.prompt_form_item_add_btn}
            onClick={() => {
              const lastP = promptParams[promptParams.length - 1];
              const newP = promptParams.concat([
                {
                  id: genId(),
                  prompt: "",
                  startFrame: lastP ? lastP.startFrame + lastP.frames : 0,
                  frames: DEFAULT_CLIP_FRAME,
                },
              ]);
              setPromptParams(newP);
              onChange(newP);
            }}
          >
            <PlusOutlined />
          </span>
        </div>
      )}
    </div>
  );
}
