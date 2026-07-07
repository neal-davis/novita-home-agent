"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { InputField } from "./InputField";
import { PromptField } from "./PromptField";
import { ImageUploadField } from "./ImageUploadField";
import { ArrayInputField } from "./ArrayInputField";
import { SizeField } from "./SizeField";
import { SeedField } from "./SeedField";
import { LorasField } from "./LorasField";
import { SelectField } from "./SelectField";
import { FieldLabel } from "./FieldLabel";
import { getImageInputMode } from "../../utils/imageFieldConfig";
import styles from "./FormFields.module.scss";
interface GenericFieldProps {
  label: string;
  type: string;
  value: any;
  onChange: (value: any) => void;
  error?: string | null;
  description?: string;
  required?: boolean;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  maxItems?: number;
  minItems?: number;
  example?: any;
  pattern?: string;
  items?: any;
}
export const GenericField = ({
  label,
  type,
  value,
  onChange,
  error,
  description,
  required = false,
  enum: enumValues,
  minimum,
  maximum,
  maxLength,
  maxItems,
  minItems,
  example,
  pattern,
  items,
}: GenericFieldProps) => {
  const baseFieldName = label.split(".").pop() || label;
  const imageInputMode = getImageInputMode(label);
  // Prompt field (multiline string)
  if (baseFieldName === "prompt" || baseFieldName === "negative_prompt") {
    return (
      <PromptField
        label={label}
        value={value || ""}
        onChange={onChange}
        error={error}
        description={description}
        required={required}
      />
    );
  }
  // Single image field (string type with image-related description)
  if (type === "string" && imageInputMode !== null) {
    return (
      <ImageUploadField
        label={label}
        value={value ? [value] : []}
        onChange={(newValue) => onChange(newValue[0] || "")}
        error={error}
        description={description}
        maxItems={1}
        required={required}
        inputMode={imageInputMode}
      />
    );
  }
  // Images field (array of image inputs)
  if (type === "array" && imageInputMode !== null) {
    return (
      <ImageUploadField
        label={label}
        value={value || []}
        onChange={onChange}
        error={error}
        description={description}
        maxItems={maxItems}
        required={required}
        inputMode={imageInputMode}
      />
    );
  }
  // Array of strings (generic string array input)
  if (
    type === "array" &&
    items?.type === "string" &&
    !description?.toLowerCase().includes("image")
  ) {
    // Extract item description from items.description
    const itemDescription = items?.description;
    return (
      <ArrayInputField
        label={label}
        value={value || []}
        onChange={onChange}
        error={error}
        description={description}
        maxItems={maxItems}
        minItems={minItems}
        required={required}
        placeholder={"Enter URL or content"}
        itemDescription={itemDescription}
      />
    );
  }
  // Size field (width*height pattern or enum with size values)
  if (
    baseFieldName === "size" &&
    (pattern?.includes("\\*") ||
      (enumValues && enumValues.some((v: any) => String(v).includes("*"))))
  ) {
    return (
      <SizeField
        label={label}
        value={value || "1024*1024"}
        onChange={onChange}
        error={error}
        description={description}
        options={enumValues}
        required={required}
      />
    );
  }
  // Seed field (integer with random option)
  if (baseFieldName === "seed" && type === "integer") {
    return (
      <SeedField
        label={label}
        value={value ?? -1}
        onChange={onChange}
        error={error}
        description={description}
        min={minimum}
        max={maximum}
        required={required}
      />
    );
  }
  // Loras field (array of objects with path and scale)
  if (
    baseFieldName === "loras" &&
    type === "array" &&
    (items?.type === "object" || items?.$ref?.includes("LoraWeight"))
  ) {
    return (
      <LorasField
        label={label}
        value={value || []}
        onChange={onChange}
        error={error}
        description={description}
        maxItems={maxItems || 3}
        required={required}
      />
    );
  }
  // Render enum as select
  if (enumValues && enumValues.length > 0) {
    return (
      <SelectField
        label={label}
        type={type}
        value={value}
        onChange={onChange}
        error={error}
        description={description}
        required={required}
        options={enumValues}
      />
    );
  }
  // Render boolean as switch
  if (type === "boolean") {
    return (
      <div className={styles.field_container}>
        <div className={styles.switch_field}>
          <div className="flex items-center gap-2">
            <Label htmlFor={label} className={styles.switch_label}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </Label>
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-[var(--dark-3)]" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Switch
            id={label}
            checked={value ?? false}
            onCheckedChange={onChange}
            size="sm"
          />
        </div>
        {error && <span className={styles.error_text}>{error}</span>}
      </div>
    );
  }
  // Render string with maxLength > 100 as textarea
  if (type === "string" && maxLength && maxLength > 100) {
    return (
      <div className={styles.field_container}>
        <FieldLabel
          label={label}
          required={required}
          description={description}
        />
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={example ? String(example) : ""}
          maxLength={maxLength}
          className={styles.textarea}
          rows={3}
        />
        {maxLength && (
          <p className={styles.field_hint}>
            {(value ?? "").length} / {maxLength}
          </p>
        )}
        {error && <span className={styles.error_text}>{error}</span>}
      </div>
    );
  }
  // Render integer/number as number input
  if (type === "integer" || type === "number") {
    const getValidationError = (
      numValue: number | undefined,
    ): string | null => {
      if (numValue === undefined || numValue === null || isNaN(numValue)) {
        return null;
      }
      if (minimum !== undefined && numValue < minimum) {
        return `Value must be at least ${minimum}`;
      }
      if (maximum !== undefined && numValue > maximum) {
        return `Value must be at most ${maximum}`;
      }
      return null;
    };
    const validationError = getValidationError(value);
    const displayError = error || validationError;
    return (
      <div className={styles.field_container}>
        <FieldLabel
          label={label}
          required={required}
          description={description}
        />
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              onChange(undefined);
            } else {
              onChange(type === "integer" ? parseInt(val) : parseFloat(val));
            }
          }}
          min={minimum}
          max={maximum}
          placeholder={example ? String(example) : ""}
          className={styles.generic_input}
        />
        {displayError && (
          <span className={styles.error_text}>{displayError}</span>
        )}
      </div>
    );
  }
  // Render string as text input
  if (type === "string") {
    return (
      <div className={styles.field_container}>
        <FieldLabel
          label={label}
          required={required}
          description={description}
        />
        <Input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={example ? String(example) : ""}
          className={styles.generic_input}
        />
        {error && <span className={styles.error_text}>{error}</span>}
      </div>
    );
  }
  // Fallback: render InputField for unsupported types
  return (
    <InputField
      label={label}
      value={typeof value === "string" ? value : value ? String(value) : ""}
      onChange={(newValue) => onChange(newValue)}
      error={error}
      description={description}
      placeholder={example ? String(example) : "Enter..."}
      required={required}
    />
  );
};
