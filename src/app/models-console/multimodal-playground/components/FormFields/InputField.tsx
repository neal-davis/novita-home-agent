"use client";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "./FieldLabel";
import styles from "./FormFields.module.scss";
interface InputFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  description?: string;
  placeholder?: string;
  required?: boolean;
}
export const InputField = ({
  label = "input",
  value,
  onChange,
  error,
  description,
  placeholder = "Enter...",
  required = false,
}: InputFieldProps) => {
  return (
    <div className={styles.field_container}>
      <FieldLabel label={label} required={required} description={description} />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.generic_input}
      />
      {error && <span className={styles.error_text}>{error}</span>}
    </div>
  );
};
