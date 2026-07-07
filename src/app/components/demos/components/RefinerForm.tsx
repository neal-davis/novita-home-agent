import { useState, useEffect } from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import { ValueSlider as Slider } from "@/components/ui/standard/value-slider";
import styles from "./form.module.scss";

const DEFAULT_REFINER_MODEL = "sd_xl_refiner_1.0.safetensors";

type RefinerFormProps = {
  params: {
    modelName: string;
    switchAt: number;
  };
  loading?: boolean;
  onFocus: () => void;
  onChange: (params: { modelName: string; switchAt: number }) => void;
  onBlur: () => void;
};

export default function RefinerForm({
  onFocus,
  onChange,
  onBlur,
  params,
  loading,
}: RefinerFormProps) {
  const [refinerParams, setRefinerParams] = useState<{
    modelName: string;
    switchAt: number;
  }>({ modelName: "None", switchAt: 0 });

  useEffect(() => {
    if (params) {
      setRefinerParams(params);
    } else {
      setRefinerParams({
        modelName: "None",
        switchAt: 0,
      });
      onChange({
        modelName: "None",
        switchAt: 0,
      });
    }
  }, [onChange, params]);

  return (
    <div className={`${styles.refiner_form} ${styles.form_item}`}>
      <div className={styles.refiner_model_wrapper}>
        <label className={styles.title}>Refiner Model</label>
        <Select
          className={styles.input}
          value={params?.modelName || refinerParams.modelName}
          options={[
            { label: "None", value: "None" },
            { label: DEFAULT_REFINER_MODEL, value: DEFAULT_REFINER_MODEL },
          ]}
          onChange={(val) => {
            setRefinerParams({
              modelName: val,
              switchAt: refinerParams.switchAt,
            });
            onChange({ modelName: val, switchAt: refinerParams.switchAt });
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={loading}
        />
      </div>
      {refinerParams.modelName !== "None" && (
        <div className={styles.refiner_switchat}>
          <label className={styles.title}>Switch At:</label>
          <div className={styles.slider_wrap}>
            <Slider
              className={styles.slider}
              min={0}
              max={1}
              step={0.01}
              onChange={(value) => {
                setRefinerParams({
                  modelName: refinerParams.modelName,
                  switchAt: value,
                });
                if (refinerParams.modelName) {
                  onChange({
                    modelName: refinerParams.modelName,
                    switchAt: value,
                  });
                }
              }}
              value={params?.switchAt || refinerParams.switchAt}
              disabled={loading}
            />
            <NumberInput
              className={styles.slider_input}
              min={0}
              max={1}
              value={params?.switchAt || refinerParams.switchAt}
              onChange={(value) => {
                if (!value) {
                  return;
                }
                setRefinerParams({
                  modelName: refinerParams.modelName,
                  switchAt: value,
                });
                if (refinerParams.modelName) {
                  onChange({
                    modelName: refinerParams.modelName,
                    switchAt: value,
                  });
                }
              }}
              onFocus={onFocus}
              onBlur={onBlur}
              controls={false}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
