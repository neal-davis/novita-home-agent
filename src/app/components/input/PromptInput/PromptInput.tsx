import { useRef, CSSProperties, useEffect, useCallback } from "react";
import styles from "./PromptInput.module.css";
type Props = {
  value: string;
  setValue: (val: string) => void;
  large?: boolean;
  style?: CSSProperties;
  lineHeight?: number;
  maxLine?: number;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (val: string) => void;
  disabled?: boolean;
};
export default function PromptInput(props: Props) {
  const promptInputEl = useRef<HTMLTextAreaElement | null>(null);
  const inputPadding = props.large ? 16 : 8;
  let maxInputHeight =
    inputPadding +
    (props.style?.lineHeight
      ? parseInt(props.style.lineHeight.toString())
      : 24) *
      (props.maxLine || 4);
  if (props.maxLine === 1) {
    maxInputHeight += inputPadding;
  }
  const setTextareaHeight = useCallback(() => {
    if (promptInputEl.current) {
      const el = promptInputEl.current;
      el.style.height = "auto";
      if (el.scrollHeight > maxInputHeight) {
        el.style.height = `${maxInputHeight}px`;
        el.style.overflow = "auto";
        return;
      }
      el.style.height = `${el.scrollHeight}px`;
      el.style.overflow = "hidden";
    }
  }, [maxInputHeight]);
  useEffect(() => {
    setTextareaHeight();
  }, [props.value, setTextareaHeight]);

  return (
    <textarea
      disabled={props.disabled}
      style={props.style}
      ref={promptInputEl}
      className={`${styles.input} ${styles.prompt_input} ${props.large ? styles.prompt_input_large : ""} ${props.disabled ? styles.prompt_input_disabled : ""} scrollBar_container`}
      placeholder={
        props.placeholder || "Description of what you want to generate..."
      }
      value={props.value}
      rows={1}
      onChange={(e) => {
        props.setValue(e.target.value);
        props.onChange?.(e.target.value);
      }}
      onKeyUp={setTextareaHeight}
      onMouseDown={setTextareaHeight}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
}
