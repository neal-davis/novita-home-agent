"use client";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldLabel } from "./FieldLabel";
import styles from "./FormFields.module.scss";
interface SizeFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  description?: string;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
}
export const SizeField = ({
  label = "size",
  value,
  onChange,
  error,
  description,
  options,
  min = 256,
  max = 1536,
  required = false,
}: SizeFieldProps) => {
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  // Parse initial value
  useEffect(() => {
    if (value && value.includes("*")) {
      const [w, h] = value.split("*").map((v) => parseInt(v.trim()));
      if (!isNaN(w) && !isNaN(h)) {
        setWidth(w);
        setHeight(h);
      }
    }
  }, [value]);
  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    onChange(`${newWidth}*${height}`);
  };
  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    onChange(`${width}*${newHeight}`);
  };
  // If options are provided, render as a select dropdown
  if (options && options.length > 0) {
    return (
      <div className={styles.field_container}>
        <FieldLabel
          label={label}
          required={required}
          description={description}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.select_input}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <span className={styles.error_text}>{error}</span>}
      </div>
    );
  }
  // Otherwise, render as sliders
  return (
    <div className={styles.field_container}>
      <FieldLabel label={label} required={required} description={description} />

      <div className={styles.size_field}>
        {/* Width */}
        <div className={styles.size_dimension}>
          <div className={styles.dimension_header}>
            <span className={styles.dimension_label}>{"Width"}</span>
            <Input
              type="number"
              value={width}
              onChange={(e) =>
                handleWidthChange(parseInt(e.target.value) || min)
              }
              min={min}
              max={max}
              className={styles.dimension_input}
            />
          </div>
          <Slider
            value={[width]}
            onValueChange={([val]) => handleWidthChange(val)}
            min={min}
            max={max}
            step={64}
            className={styles.dimension_slider}
          />
        </div>

        {/* Height */}
        <div className={styles.size_dimension}>
          <div className={styles.dimension_header}>
            <span className={styles.dimension_label}>{"Height"}</span>
            <Input
              type="number"
              value={height}
              onChange={(e) =>
                handleHeightChange(parseInt(e.target.value) || min)
              }
              min={min}
              max={max}
              className={styles.dimension_input}
            />
          </div>
          <Slider
            value={[height]}
            onValueChange={([val]) => handleHeightChange(val)}
            min={min}
            max={max}
            step={64}
            className={styles.dimension_slider}
          />
        </div>
      </div>

      {error && <span className={styles.error_text}>{error}</span>}
    </div>
  );
};
