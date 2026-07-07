/**
 * LocalStorage utilities for multimodal playground form data persistence
 */

const STORAGE_KEY_PREFIX = "multimodal_playground_";

interface PlaygroundFormData {
  modelName: string;
  formData: Record<string, any>;
  timestamp: number;
}

/**
 * Save form data to localStorage based on the selected model
 */
export const savePlaygroundFormData = (
  modelName: string,
  formData: Record<string, any>,
): void => {
  if (typeof window === "undefined") return;

  try {
    const data: PlaygroundFormData = {
      modelName,
      formData,
      timestamp: Date.now(),
    };

    const key = `${STORAGE_KEY_PREFIX}${modelName}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save playground form data:", error);
  }
};

/**
 * Load form data from localStorage for a specific model
 */
export const loadPlaygroundFormData = (
  modelName: string,
): Record<string, any> | null => {
  if (typeof window === "undefined") return null;

  try {
    const key = `${STORAGE_KEY_PREFIX}${modelName}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const data: PlaygroundFormData = JSON.parse(stored);

    // Check if data is for the correct model
    if (data.modelName !== modelName) return null;

    // Optional: Check if data is not too old (e.g., 24 hours)
    const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - data.timestamp > MAX_AGE) {
      clearPlaygroundFormData(modelName);
      return null;
    }

    return data.formData;
  } catch (error) {
    console.error("Failed to load playground form data:", error);
    return null;
  }
};

/**
 * Clear form data from localStorage for a specific model
 */
export const clearPlaygroundFormData = (modelName: string): void => {
  if (typeof window === "undefined") return;

  try {
    const key = `${STORAGE_KEY_PREFIX}${modelName}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear playground form data:", error);
  }
};

/**
 * Clear all playground form data from localStorage
 */
export const clearAllPlaygroundFormData = (): void => {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to clear all playground form data:", error);
  }
};
