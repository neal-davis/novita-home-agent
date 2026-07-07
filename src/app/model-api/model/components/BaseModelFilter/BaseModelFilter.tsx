import { Button } from "@/components/ui/button";
import styles from "./BaseModelFilter.module.scss";

export const baseModelList = [
  {
    label: "SD 1.5",
    value: "SD_1.5",
  },
  {
    label: "SDXL 1.0",
    value: "SDXL_1.0",
  },
];

export default function BaseModelFilter({
  baseModel,
  setBaseModel,
  disabled,
}: {
  baseModel: string;
  setBaseModel: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={styles.filter_wrap}>
      <div className={styles.inner}>
        <label>Base Model:</label>
        <Button
          size="sm"
          disabled={disabled}
          variant={!baseModel ? "default" : "outline"}
          onClick={() => {
            if (disabled || !baseModel) {
              return;
            }
            setBaseModel("");
          }}
        >
          All
        </Button>
        {baseModelList.map((bm) => {
          const isSelected = baseModel === bm.value || baseModel === bm.label;
          return (
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              key={bm.value}
              className={`${bm.value === "SD_3" && styles.sd3} ${
                isSelected ? "cursor-default" : ""
              }`}
              disabled={disabled}
              onClick={() => {
                if (disabled || isSelected) {
                  return;
                }
                setBaseModel(bm.value);
              }}
            >
              <span>{bm.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
