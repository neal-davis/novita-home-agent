import {
  CSSProperties,
  DOMAttributes,
  InputHTMLAttributes,
  MouseEvent,
} from "react";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { ChevronRight as RightOutlined } from "lucide-react";
import styles from "./ModelSelector.module.scss";

type ModelSelectorLiteProps = {
  value?: string | number;
  fixedModel?: string;
  fieldProps?: InputHTMLAttributes<HTMLInputElement> &
    DOMAttributes<HTMLInputElement>;
  style?: CSSProperties;
  type?: "primary" | "default";
};

export default function ModelSelector({
  value,
  type,
  fixedModel,
  fieldProps,
  style,
}: ModelSelectorLiteProps) {
  return (
    <div
      className={`${styles.model_selector_wrap} ${
        styles.model_selector_wrap_lite
      } ${fixedModel ? styles.model_selector_fixed : ""} ${
        fieldProps?.disabled ? styles.disabled : ""
      }`}
    >
      <Tooltip title={value} mouseEnterDelay={0.5}>
        <div
          className={`${styles.model_selector_trigger} ${
            fieldProps?.disabled ? styles.disabled : ""
          } ${type === "primary" ? styles.primary : ""}`}
          style={style}
          onClick={(e) => {
            if (fieldProps?.disabled) {
              return;
            }
            if (fieldProps?.onClick) {
              fieldProps.onClick(e as MouseEvent<HTMLInputElement>);
            }
            if (fieldProps?.onFocus) {
              fieldProps.onFocus(e as any);
            }
          }}
        >
          <span className={styles.model_name}>{fixedModel || value}</span>
          {!fixedModel && (
            <span className={styles.arrow}>
              <RightOutlined />
            </span>
          )}
        </div>
      </Tooltip>
    </div>
  );
}
