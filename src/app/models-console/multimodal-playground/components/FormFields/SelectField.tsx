"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldLabel } from "./FieldLabel";
import styles from "./FormFields.module.scss";
interface SelectFieldProps {
  label: string;
  type: string;
  value: any;
  onChange: (value: any) => void;
  error?: string | null;
  description?: string;
  required?: boolean;
  options: any[];
}
export const SelectField = ({
  label,
  type,
  value,
  onChange,
  error,
  description,
  required = false,
  options,
}: SelectFieldProps) => {
  const handleValueChange = (val: string) => {
    // Convert to appropriate type
    if (type === "integer") {
      onChange(parseInt(val));
    } else if (type === "number") {
      onChange(parseFloat(val));
    } else if (type === "boolean") {
      onChange(val === "true");
    } else {
      onChange(val);
    }
  };
  return (
    <div className={styles.field_container}>
      <FieldLabel label={label} required={required} description={description} />
      <Select value={String(value ?? "")} onValueChange={handleValueChange}>
        <SelectTrigger className={styles.select_input}>
          <SelectValue placeholder={"Select"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={String(option)} value={String(option)}>
              {String(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <span className={styles.error_text}>{error}</span>}
    </div>
  );
};
