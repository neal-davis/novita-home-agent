import React, { useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import styles from "../page.module.scss";

interface DateToggleGroupProps {
  options: { value: string; label: string }[];
  onCycleChange: (cycle: string) => void;
  selected?: string | null;
}

const DateToggleGroup: React.FC<DateToggleGroupProps> = ({
  options,
  onCycleChange,
  selected = null,
}) => {
  const [value, setValue] = React.useState<string>(
    selected || options[0].value,
  );
  useEffect(() => {
    setValue(selected || options[0].value);
  }, [selected, options]);

  return (
    <ToggleGroup
      type="single"
      value={value}
      defaultValue="hour"
      className={styles.cycle_toggle_group}
      onValueChange={(newValue: string) => {
        if (newValue) {
          setValue(newValue);
          onCycleChange(newValue);
        } else {
          setValue("0");
          onCycleChange("0");
        }
      }}
      style={{
        borderColor: "var(--gray-1)",
        height: 32,
      }}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          style={{
            height: 26,
          }}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default DateToggleGroup;
