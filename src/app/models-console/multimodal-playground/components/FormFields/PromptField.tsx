"use client";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel } from "./FieldLabel";
import styles from "./FormFields.module.scss";
interface PromptFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  description?: string;
  placeholder?: string;
  required?: boolean;
}
const maxLength = 2000;
export const PromptField = ({
  label = "prompt",
  value,
  onChange,
  error,
  description,
  placeholder = "Enter prompt...",
  required = false,
}: PromptFieldProps) => {
  return (
    <div className={styles.field_container}>
      <FieldLabel label={label} required={required} description={description} />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.textarea}
        rows={4}
        maxLength={maxLength}
      />
      <div className="flex justify-between items-center mt-1">
        <div>{error && <span className={styles.error_text}>{error}</span>}</div>
        <span className="text-xs text-gray-500">
          {value.length} / {maxLength}
        </span>
      </div>
    </div>
  );
};
