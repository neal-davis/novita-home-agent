import {
  CSSProperties,
  DOMAttributes,
  InputHTMLAttributes,
  MouseEvent,
} from "react";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { ChevronRight as RightOutlined } from "lucide-react";
import styles from "./ModelSelector.module.scss";
type ModelSelectorProps = {
  onChange?: (val: string | number) => void;
  value?: string | number;
  modelCover?: string;
  fixedModel?: string;
  fixedModelCover?: string;
  fieldProps?: InputHTMLAttributes<HTMLInputElement> &
    DOMAttributes<HTMLInputElement>;
  style?: CSSProperties;
  hideCover?: boolean;
};
export default function ModelSelector({
  value,
  modelCover,
  fixedModel,
  fixedModelCover,
  fieldProps,
  style,
  hideCover,
}: ModelSelectorProps) {
  return (
    <div
      className={`${styles.model_selector_wrap} ${fixedModel ? styles.model_selector_fixed : ""} ${fieldProps?.disabled ? styles.disabled : ""}`}
    >
      <Tooltip title={fixedModel || (value as string)} mouseEnterDelay={0.5}>
        <div
          className={`${styles.model_selector_trigger} ${hideCover ? styles.model_selector_nocover : ""} ${fieldProps?.disabled ? styles.disabled : ""}`}
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
          {!hideCover && (
            <img
              className={styles.model_cover}
              src={fixedModelCover || modelCover || "/not_found.png"}
              alt="cover"
            />
          )}
          <span className={styles.model_name}>
            {fixedModel || value || "Click to select..."}
          </span>
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
