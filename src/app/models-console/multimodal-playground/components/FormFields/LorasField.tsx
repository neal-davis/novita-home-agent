"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Plus, X } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import styles from "./FormFields.module.scss";
interface LoraItem {
  path: string;
  scale: number;
}
interface LorasFieldProps {
  label?: string;
  value: LoraItem[];
  onChange: (value: LoraItem[]) => void;
  error?: string | null;
  description?: string;
  maxItems?: number;
  required?: boolean;
}
export const LorasField = ({
  label = "loras",
  value,
  onChange,
  error,
  description,
  maxItems = 3,
  required = false,
}: LorasFieldProps) => {
  const handleAdd = () => {
    if (value.length >= maxItems) return;
    onChange([...value, { path: "", scale: 1 }]);
  };
  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };
  const handlePathChange = (index: number, path: string) => {
    const newValue = [...value];
    newValue[index].path = path;
    onChange(newValue);
  };
  const handleScaleChange = (index: number, scale: number) => {
    const newValue = [...value];
    newValue[index].scale = scale;
    onChange(newValue);
  };
  return (
    <div className={styles.field_container}>
      <FieldLabel label={label} required={required} description={description} />

      <div className={styles.loras_list}>
        {value.map((lora, index) => (
          <div key={index} className={styles.lora_item}>
            <div className={styles.lora_header}>
              <span className={styles.lora_label}>
                {"LoRA {index}".replace("{index}", String(index + 1))}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className={styles.remove_icon_button}
              >
                <X size={14} />
              </button>
            </div>

            <div className={styles.lora_fields}>
              {/* Path input */}
              <div className={styles.lora_field}>
                <Label className={styles.mini_label}>{"Path"}</Label>
                <Input
                  value={lora.path}
                  onChange={(e) => handlePathChange(index, e.target.value)}
                  placeholder={""}
                  className={styles.lora_input}
                />
              </div>

              {/* Scale slider */}
              <div className={styles.lora_field}>
                <div className={styles.lora_scale_header}>
                  <Label className={styles.mini_label}>{"Scale"}</Label>
                  <span className={styles.scale_value}>
                    {lora.scale.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[lora.scale]}
                  onValueChange={([val]) => handleScaleChange(index, val)}
                  min={0}
                  max={4}
                  step={0.1}
                  className={styles.lora_slider}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {value.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className={styles.add_button}
        >
          <Plus size={14} className="mr-1" />
          {"Add LoRA"}
        </Button>
      )}

      {error && <span className={styles.error_text}>{error}</span>}
    </div>
  );
};
