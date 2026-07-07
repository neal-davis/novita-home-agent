"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import styles from "./FormFields.module.scss";
interface ArrayInputFieldProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string | null;
  description?: string;
  maxItems?: number;
  minItems?: number;
  required?: boolean;
  placeholder?: string;
  itemDescription?: string;
}
export const ArrayInputField = ({
  label = "items",
  value,
  onChange,
  error,
  description,
  maxItems = 10,
  minItems,
  required = false,
  placeholder = "Enter content",
  itemDescription,
}: ArrayInputFieldProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const handleAdd = () => {
    if (!inputValue.trim()) return;
    if (value.length >= maxItems) {
      alert(
        "Maximum {maxItems} items allowed".replace(
          "{maxItems}",
          String(maxItems),
        ),
      );
      return;
    }
    onChange([...value, inputValue.trim()]);
    setInputValue("");
    setShowInput(false);
  };
  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };
  const handleUpdate = (index: number, newValue: string) => {
    const newArray = [...value];
    newArray[index] = newValue;
    onChange(newArray);
  };
  return (
    <div className={styles.field_container}>
      <FieldLabel label={label} required={required} description={description} />

      <div className={styles.array_input_container}>
        {/* Item list */}
        {value.length > 0 && (
          <div className={styles.array_input_list}>
            {value.map((item, index) => (
              <div key={index} className={styles.array_input_item}>
                <div className={styles.array_item_header}>
                  <span className={styles.array_item_index}>{index + 1}</span>
                  <button
                    onClick={() => handleRemove(index)}
                    className={styles.remove_icon_button}
                    type="button"
                    title={"Remove"}
                  >
                    <X size={16} />
                  </button>
                </div>
                <Input
                  value={item}
                  onChange={(e) => handleUpdate(index, e.target.value)}
                  placeholder={placeholder}
                  className={styles.array_item_input}
                />
              </div>
            ))}
          </div>
        )}

        <div className={styles.array_input_actions}>
          <p className={`${styles.field_hint} mr-2`}>
            {"{current}/{max} items"
              .replace("{current}", String(value.length))
              .replace("{max}", String(maxItems))}
            {minItems &&
              minItems > 0 &&
              ` ${"(minimum {minItems} items)".replace("{minItems}", String(minItems))}`}
          </p>

          {/* Add button */}
          {value.length < maxItems && !showInput && (
            <Button
              type="button"
              variant="outline"
              className="rounded-[4px]"
              size="sm"
              onClick={() => setShowInput(true)}
            >
              <Plus size={16} className="mr-1" />
              {"Add item"}
            </Button>
          )}
        </div>

        {/* Input for new item */}
        {showInput && (
          <div className={styles.array_input_add}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="h-7 font-small"
              containerClassName="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                } else if (e.key === "Escape") {
                  setInputValue("");
                  setShowInput(false);
                }
              }}
              autoFocus
            />
            <Button type="button" size="sm" onClick={handleAdd}>
              {"Add"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setInputValue("");
                setShowInput(false);
              }}
            >
              {"Cancel"}
            </Button>
          </div>
        )}

        {/* Item description hint */}
        {itemDescription && (
          <p className={styles.field_hint}>{itemDescription}</p>
        )}
      </div>

      {error && <span className={styles.error_text}>{error}</span>}
    </div>
  );
};
