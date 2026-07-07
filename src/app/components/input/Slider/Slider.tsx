import styles from "./Slider.module.scss";
import { NumberInput } from "@/components/ui/standard/number-input";
import { ValueSlider } from "@/components/ui/standard/value-slider";
import { Switch } from "@/components/ui/switch";
import { useCallback, useEffect, useRef, useState } from "react";

type SliderProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  withInput?: boolean;
  withSwitch?: boolean;
  min?: number;
  max?: number;
  nilVal?: number;
  step?: number;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function Slider({
  label,
  value,
  onChange,
  disabled,
  withInput,
  withSwitch,
  min,
  max,
  nilVal,
  step,
  onFocus,
  onBlur,
}: SliderProps) {
  const [widgetOpen, setWidgetOpen] = useState(true);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (withSwitch) {
      setWidgetOpen(false);
      onChangeRef.current?.(nilVal === undefined ? 0 : nilVal);
    }
  }, [withSwitch, nilVal]);

  const handleWidgetSwitch = useCallback(() => {
    setWidgetOpen((v) => {
      let valToSet = value || min || 1;
      if (v) {
        valToSet = nilVal === undefined ? 0 : nilVal;
      }
      if (onChange) {
        onChange(valToSet);
      }
      return !v;
    });
  }, [value, min, onChange, nilVal]);

  return (
    <div className={styles.form_item}>
      <label
        className={styles.form_label}
        style={{ marginBottom: withSwitch ? 8 : 0 }}
      >
        <span>{label}: </span>
        {!withInput && <span>{value}</span>}
        {withSwitch && (
          <Switch
            className="ml-auto"
            checked={widgetOpen}
            onCheckedChange={handleWidgetSwitch}
            size="sm"
          />
        )}
      </label>
      <div className={styles.slider_wrap}>
        <div className={styles.slider}>
          <ValueSlider
            disabled={disabled || !widgetOpen}
            min={min}
            max={max}
            step={step || 0.1}
            value={value}
            onChange={(val) => {
              onChange(val);
            }}
            onAfterChange={() => {
              onFocus?.();
              setTimeout(() => {
                onBlur?.();
              }, 1000);
            }}
          />
        </div>
        {withInput && (
          <NumberInput
            disabled={disabled || !widgetOpen}
            className={styles.slider_input}
            min={widgetOpen ? min : nilVal || 0}
            max={max}
            value={value}
            onChange={(val) => {
              onChange(val || value);
            }}
            onFocus={() => {
              onFocus?.();
            }}
            onBlur={() => {
              onBlur?.();
            }}
            controls={false}
          />
        )}
      </div>
    </div>
  );
}
