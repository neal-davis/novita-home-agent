"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import styles from "./FormFields.module.scss";
interface SeedFieldProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string | null;
  description?: string;
  min?: number;
  max?: number;
  required?: boolean;
}
export const SeedField = ({
  label = "seed",
  value,
  onChange,
  error,
  description,
  min = -1,
  max = 2147483647,
  required = false,
}: SeedFieldProps) => {
  const handleRandomize = () => {
    const randomSeed = Math.floor(Math.random() * max);
    onChange(randomSeed);
  };
  return (
    <div className={styles.field_container}>
      <FieldLabel label={label} required={required} description={description} />

      <div className={styles.seed_field}>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          min={min}
          max={max}
          className={styles.seed_input}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleRandomize}
          title={"Random seed"}
          className="h-7 w-7 p-0"
        >
          <Dices size={14} />
        </Button>
      </div>

      {error && <span className={styles.error_text}>{error}</span>}
    </div>
  );
};
