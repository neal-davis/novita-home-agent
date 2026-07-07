import { useState, useEffect, useCallback } from "react";
import { NumberInput } from "@/components/ui/standard/number-input";
import { SelectItems as Select } from "@/components/ui/standard/select-items";
import { ValueSlider as Slider } from "@/components/ui/standard/value-slider";
import { Switch } from "@/components/ui/switch";
import styles from "./form.module.scss";
import Dragger from "@/app/components/dragger/Dragger";
type IPAdapterFormProps = {
  params?: {
    modelName: string;
    imageBase64: string;
    strength: number;
  };
  loading?: boolean;
  baseModel: string;
  onFocus?: () => void;
  onChange: (params: {
    enable: boolean;
    modelName: string;
    imageBase64: string;
    strength: number;
  }) => void;
  onBlur?: () => void;
};
export const IPAdapterModel = {
  SD15: ["ip-adapter_sd15.bin"],
  SDXL: ["ip-adapter_sdxl.bin"],
};
export default function IPAdapterForm({
  onFocus,
  onChange,
  onBlur,
  params,
  loading,
  baseModel,
}: IPAdapterFormProps) {
  const [on, setOn] = useState(false);
  const [modelName, setModelName] = useState<string>(
    params?.modelName || IPAdapterModel.SDXL[0],
  );
  const [modelList, setModelList] = useState<string[]>(IPAdapterModel.SD15);
  const [imageBase64, setImageBase64] = useState<string>(
    params?.imageBase64 || "",
  );
  const [strength, setStrength] = useState<number>(params?.strength || 0.7);
  useEffect(() => {
    if (params) {
      setModelName(params.modelName || IPAdapterModel.SDXL[0]);
      setImageBase64(params.imageBase64 || "");
      setStrength(params.strength || 0.7);
    } else {
      setOn(false);
      setModelName(IPAdapterModel.SDXL[0]);
      setImageBase64("");
      setStrength(0.7);
    }
  }, [params]);
  useEffect(() => {
    if (baseModel.includes("SDXL")) {
      setModelList(IPAdapterModel.SDXL);
      setModelName(IPAdapterModel.SDXL[0]);
    } else {
      setModelList(IPAdapterModel.SD15);
      setModelName(IPAdapterModel.SD15[0]);
    }
  }, [baseModel]);
  const handleModelChange = useCallback(
    (value: string) => {
      const newValue = value === null ? modelName : value;
      setModelName(newValue);
      onChange({
        enable: true,
        modelName: newValue,
        imageBase64,
        strength,
      });
    },
    [onChange, modelName, imageBase64, strength],
  );
  const handleImageChange = useCallback(
    (value: string) => {
      const newValue = value === null ? imageBase64 : value;
      setImageBase64(newValue);
      onChange({
        enable: true,
        modelName,
        imageBase64: newValue,
        strength,
      });
    },
    [onChange, modelName, imageBase64, strength],
  );
  const handleStrengthChange = useCallback(
    (value: number | null) => {
      if (!value) {
        return;
      }
      const newValue = value === null ? strength : value;
      setStrength(newValue);
      onChange({
        enable: true,
        modelName,
        imageBase64,
        strength: newValue,
      });
    },
    [onChange, modelName, imageBase64, strength],
  );
  const onSwitch = useCallback(
    (checked: boolean) => {
      setOn(checked);
      if (!checked) {
        onChange({ enable: false, modelName, imageBase64, strength });
        return;
      }
      onChange({ enable: true, modelName, imageBase64, strength });
    },
    [modelName, imageBase64, strength, onChange],
  );
  return (
    <div className={`${styles.ipadapter_form} ${styles.form_item}`}>
      <div
        className={styles.title}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>IP-Adapter</div>
        <div className={styles.switch}>
          <Switch disabled={loading} checked={on} onCheckedChange={onSwitch} />
        </div>
      </div>
      {on && (
        <div className={styles.ipadapter_wrapper}>
          <div className={styles.form_item}>
            <label className={styles.title}>{"Model"}</label>
            <Select
              disabled={loading}
              value={modelName}
              options={modelList.map((s) => ({
                label: s,
                value: s,
              }))}
              onChange={handleModelChange}
            />
          </div>
          <div className={styles.form_item}>
            <label className={styles.title}>{"Image"}</label>
            <Dragger
              disabled={loading}
              onUpload={handleImageChange}
              curValue={imageBase64 as string}
              draggerStyle={{
                flex: 1,
                width: 200,
                height: 200,
              }}
            />
          </div>
          <div className={styles.form_item}>
            <label className={styles.title}>{"Strength"}</label>
            <div className={styles.slider_wrap}>
              <Slider
                className={styles.slider}
                min={0}
                max={1}
                step={0.01}
                onChange={handleStrengthChange}
                value={strength}
                disabled={loading}
              />
              <NumberInput
                className={styles.slider_input}
                min={0}
                max={1}
                value={strength}
                onChange={handleStrengthChange}
                onFocus={onFocus}
                onBlur={onBlur}
                controls={false}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
