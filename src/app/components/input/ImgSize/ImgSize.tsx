import { DOMAttributes, InputHTMLAttributes, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { NumberInput } from "@/components/ui/standard/number-input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import styles from "./ImgSize.module.scss";
type ImgSizeProps = {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  width: number;
  height: number;
  fieldProps?: InputHTMLAttributes<HTMLInputElement> &
    DOMAttributes<HTMLInputElement>;
  onWidthChange?: (val?: number) => void;
  onHeightChange?: (val?: number) => void;
};
const defaultSizes = [
  {
    width: 1024,
    height: 1024,
    ratio: "1:1",
  },
  {
    width: 1280,
    height: 1024,
    ratio: "5:4",
  },
  {
    width: 1536,
    height: 1024,
    ratio: "3:2",
  },
];
export default function ImgSize({
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  fieldProps,
  onWidthChange,
  onHeightChange,
}: ImgSizeProps) {
  const [curRes, setCurRes] = useState(0);
  const [inputWidth, setInputWidth] = useState(width);
  const [inputHeight, setInputHeight] = useState(height);
  useEffect(() => {
    setInputWidth(width);
    setInputHeight(height);
    const res = defaultSizes.findIndex(
      (size) => size.width === width && size.height === height,
    );
    if (res > -1) {
      setCurRes(res);
    } else {
      setCurRes(-1);
    }
  }, [width, height]);
  return (
    <div className={styles.size_wrapper}>
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <span style={{ userSelect: "none" }}>
              {"Resolution"}: {inputWidth}px × {inputHeight}px
            </span>
            <ChevronDown className="h-4 w-4 text-[var(--black)]" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className={styles.size_content}>
            <div className={styles.size_selector}>
              {defaultSizes.map((size, idx) => (
                <div
                  key={idx}
                  className={`${styles.size_item} ${curRes === idx ? styles.size_item_active : ""}`}
                  onClick={() => {
                    setCurRes(idx);
                    onWidthChange?.(size.width);
                    onHeightChange?.(size.height);
                  }}
                >
                  <div
                    className={styles.ratio_box}
                    style={{
                      height: 30,
                      width: 30 * (size.width / size.height),
                    }}
                  >
                    {size.ratio}
                  </div>
                  <div>{`${size.width}px × ${size.height}px`}</div>
                </div>
              ))}
            </div>
            <div className={styles.size_input_wrapper}>
              <div className={styles.size_input}>
                <label htmlFor="imgsize_input_width">{`${"Width"} (${minWidth}~${maxWidth})`}</label>
                <NumberInput
                  id="imgsize_input_width"
                  className={styles.input_number}
                  readOnly={fieldProps?.readOnly}
                  value={inputWidth}
                  disabled={fieldProps?.disabled}
                  min={minHeight || 100}
                  max={maxHeight}
                  step={1}
                  controls={false}
                  onChange={(val) => {
                    if (val) {
                      onWidthChange?.(val);
                      setInputWidth(val);
                    }
                    if (curRes > -1 && val !== defaultSizes[curRes].width) {
                      setCurRes(-1);
                    }
                  }}
                  onFocus={(e) => {
                    if (fieldProps?.onFocus) {
                      fieldProps.onFocus(e);
                    }
                  }}
                  onBlur={(e) => {
                    if (fieldProps?.onBlur) {
                      fieldProps.onBlur(e);
                    }
                  }}
                />
              </div>
              <div className={styles.size_input}>
                <label htmlFor="imgsize_input_height">{`${"Heigh"} (${minHeight}~${maxHeight})`}</label>
                <NumberInput
                  id="imgsize_input_height"
                  className={styles.input_number}
                  readOnly={fieldProps?.readOnly}
                  value={inputHeight}
                  disabled={fieldProps?.disabled}
                  min={minHeight || 100}
                  max={maxHeight}
                  step={1}
                  controls={false}
                  onChange={(val) => {
                    if (val) {
                      onHeightChange?.(val);
                      setInputHeight(val);
                    }
                    if (curRes > -1 && val !== defaultSizes[curRes].height) {
                      setCurRes(-1);
                    }
                  }}
                  onFocus={(e) => {
                    if (fieldProps?.onFocus) {
                      fieldProps.onFocus(e);
                    }
                  }}
                  onBlur={(e) => {
                    if (fieldProps?.onBlur) {
                      fieldProps.onBlur(e);
                    }
                  }}
                />
                {/* <input
                      type="number"
                      className={styles.input_number}
                      readOnly={fieldProps?.readOnly}
                      value={inputHeight}
                      disabled={fieldProps?.disabled}
                      min={minHeight || 100}
                      max={maxHeight}
                      step={1}
                      onChange={(e) => {
                        if (e.target.value) {
                          onHeightChange?.(parseInt(e.target.value));
                          if (
                            curRes > -1 &&
                            parseInt(e.target.value) !==
                              defaultSizes[curRes].height
                          ) {
                            setCurRes(-1);
                          }
                        }
                      }}
                    /> */}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
