"use client";
import { Button } from "@/components/ui/button";
import { GenericField } from "./FormFields/GenericField";
import { SchemaProperty } from "@/types/multimodal-playground";
import { getValueByFlattenedKey } from "../utils/schemaParser";
import { VISIBLE_PARAMETERS, HIDDEN_PARAMETERS } from "../config";
import styles from "./ParametersPanel.module.scss";
interface ParametersPanelProps {
  schema: Record<string, SchemaProperty>;
  requiredFields: string[];
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  onChange: (field: string, value: any) => void;
  onReset: () => void;
  onRun: () => void;
  isRunning: boolean;
  isLoggedIn: boolean;
}
export const ParametersPanel = ({
  schema,
  requiredFields,
  formData,
  errors,
  onChange,
  onReset,
  onRun,
  isRunning,
  isLoggedIn,
}: ParametersPanelProps) => {
  const renderField = (fieldName: string, property: SchemaProperty) => {
    const isRequired = requiredFields.includes(fieldName);
    const value = getValueByFlattenedKey(fieldName, formData);
    const error = errors[fieldName];
    return (
      <GenericField
        key={fieldName}
        label={fieldName}
        type={property.type}
        value={value}
        onChange={(val) => onChange(fieldName, val)}
        error={error}
        description={property.description}
        required={isRequired}
        enum={property.enum}
        minimum={property.minimum}
        maximum={property.maximum}
        maxLength={property.maxLength}
        maxItems={property.maxItems}
        minItems={property.minItems}
        example={property.example}
        pattern={property.pattern}
        items={property.items}
      />
    );
  };
  // Filter and sort fields based on VISIBLE_PARAMETERS
  const getFilteredAndSortedFields = () => {
    const allFields = Object.entries(schema);
    // Helper function to get leaf field name (last part after dot)
    const getLeafFieldName = (fieldName: string) => {
      const parts = fieldName.split(".");
      return parts[parts.length - 1];
    };
    // Separate fields into categories
    const visibleFields: [string, SchemaProperty][] = [];
    const requiredNotVisibleFields: [string, SchemaProperty][] = [];
    allFields.forEach(([fieldName, property]) => {
      const leafName = getLeafFieldName(fieldName);
      const isRequired = requiredFields.includes(fieldName);
      const isVisible = VISIBLE_PARAMETERS.includes(leafName);
      const isHidden = HIDDEN_PARAMETERS.includes(fieldName);
      if (isHidden) {
        return;
      }
      if (isVisible) {
        visibleFields.push([fieldName, property]);
      } else if (isRequired) {
        requiredNotVisibleFields.push([fieldName, property]);
      }
    });
    // Sort visible fields according to VISIBLE_PARAMETERS order
    visibleFields.sort(([fieldNameA], [fieldNameB]) => {
      const leafA = getLeafFieldName(fieldNameA);
      const leafB = getLeafFieldName(fieldNameB);
      const indexA = VISIBLE_PARAMETERS.indexOf(leafA);
      const indexB = VISIBLE_PARAMETERS.indexOf(leafB);
      return indexA - indexB;
    });
    // Combine: required not visible + visible + other (not shown)
    return [...requiredNotVisibleFields, ...visibleFields];
  };
  const filteredFields = getFilteredAndSortedFields();
  return (
    <div className={styles.parameters_panel}>
      <div className={styles.fields_container}>
        {filteredFields.map(([fieldName, property]) =>
          renderField(fieldName, property),
        )}
      </div>

      <div className={styles.action_bar}>
        {isLoggedIn && (
          <Button
            variant="outline"
            size="sl"
            onClick={onReset}
            disabled={isRunning}
          >
            {"Reset"}
          </Button>
        )}
        <Button
          size="sl"
          onClick={onRun}
          disabled={isRunning}
          className={styles.run_button}
        >
          {isRunning
            ? "Generating..."
            : isLoggedIn
              ? "Generate"
              : "Log in to use"}
        </Button>
      </div>
    </div>
  );
};
