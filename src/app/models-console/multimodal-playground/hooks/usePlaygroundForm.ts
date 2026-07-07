import { useState, useEffect, useCallback } from "react";
import {
  generateDefaultFormData,
  validateField,
  filterEmptyFields,
} from "../utils/schemaParser";
import {
  loadPlaygroundFormData,
  clearPlaygroundFormData,
} from "../utils/localStorage";
import { getImageInputMode } from "../utils/imageFieldConfig";

interface UsePlaygroundFormProps {
  requestSchema: Record<string, any>;
  requiredFields: string[];
  examples: {
    request: Record<string, any>;
    response: Record<string, any>;
  }[];
  modelName?: string;
}

interface UsePlaygroundFormReturn {
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  handleFieldChange: (field: string, value: any) => void;
  handleReset: () => void;
  validateForm: () => boolean;
  getFilteredData: () => Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

function getDefaultExampleFormData(
  examples: {
    request: Record<string, any>;
    response: Record<string, any>;
  }[],
): Record<string, any> | null {
  if (examples.length === 0) {
    return null;
  }
  return examples[0].request;
}

function validateImageUrlField(fieldName: string, value: any): string | null {
  if (getImageInputMode(fieldName) !== "httpUrl") {
    return null;
  }

  const values = Array.isArray(value) ? value : value ? [value] : [];
  const hasInvalidUrl = values.some(
    (item) => typeof item !== "string" || !/^https?:\/\//i.test(item.trim()),
  );

  return hasInvalidUrl
    ? "Please enter an image URL starting with http or https"
    : null;
}

export const usePlaygroundForm = ({
  requestSchema,
  requiredFields,
  examples,
  modelName,
}: UsePlaygroundFormProps): UsePlaygroundFormReturn => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setErrors({});

    if (!requestSchema || Object.keys(requestSchema).length === 0) {
      return;
    }

    let savedData: Record<string, any> | null = null;
    if (modelName) {
      savedData = loadPlaygroundFormData(modelName);
      if (savedData) {
        clearPlaygroundFormData(modelName);
      }
    }

    // Generate default form data from schema
    const defaultData = generateDefaultFormData(requestSchema, requiredFields);

    // Merge with saved data or example data, keeping defaults for missing fields
    const sourceData = savedData || getDefaultExampleFormData(examples);
    const initialData = sourceData
      ? { ...defaultData, ...sourceData }
      : defaultData;

    setFormData(initialData);
  }, [requestSchema, requiredFields, modelName, examples]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const handleReset = useCallback(() => {
    setFormData(generateDefaultFormData(requestSchema, requiredFields));
    setErrors({});
  }, [requestSchema, requiredFields]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    Object.entries(requestSchema).forEach(([fieldName, property]) => {
      const isRequired = requiredFields.includes(fieldName);
      const value = formData[fieldName];
      const error =
        validateField(value, property, isRequired) ||
        validateImageUrlField(fieldName, value);

      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [requestSchema, requiredFields, formData]);

  const getFilteredData = useCallback((): Record<string, any> => {
    return filterEmptyFields(formData, requiredFields);
  }, [formData, requiredFields]);

  return {
    formData,
    errors,
    handleFieldChange,
    handleReset,
    validateForm,
    getFilteredData,
    setFormData,
  };
};
