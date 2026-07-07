/**
 * Model Constraints Configuration
 * Defines special constraints for specific models (e.g., OCR models with limited prompts)
 *
 * Features:
 * - Restricted Prompts: Limit users to predefined prompt templates
 * - File Upload Constraints: Override default file upload capabilities
 * - Auto Clear History: Automatically clear chat history after each submission (for stateless models like OCR)
 */

export interface PromptTemplate {
  id: string;
  label: string;
  prompt: string;
  description?: string;
}

export interface FileUploadConstraints {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  fileTypeLimits?: {
    image?: number;
    audio?: number;
    video?: number;
  };
}

export interface ModelConstraints {
  // Model identifier (can be model ID or a pattern)
  modelId: string | RegExp;

  // If true, user can only select from predefined prompts
  restrictedPrompts?: boolean;

  // Available prompt templates
  promptTemplates?: PromptTemplate[];

  // Custom file upload constraints (overrides default capabilities)
  fileUploadConstraints?: FileUploadConstraints;

  // Whether to allow custom input when restrictedPrompts is true
  allowCustomInput?: boolean;

  // Placeholder text for input
  inputPlaceholder?: string;

  // If true, automatically clear chat history after each submission
  autoClearHistory?: boolean;
}

/**
 * Centralized model constraints configuration
 * Add new model constraints here
 */
function createModelConstraintsConfig(): ModelConstraints[] {
  return [
    {
      modelId: "deepseek/deepseek-ocr", // Matches any model ID containing "deepseek" and "ocr"
      restrictedPrompts: true,
      allowCustomInput: false,
      inputPlaceholder: "Select a prompt template for OCR...",
      autoClearHistory: true, // Auto clear history after each submission
      promptTemplates: [
        {
          id: "document",
          label: "Document",
          prompt: "<|grounding|>Convert the document to markdown.",
          description: "Convert document to markdown format",
        },
        {
          id: "ocr-image",
          label: "OCR Image",
          prompt: "<|grounding|>OCR this image.",
          description: "Extract text from general images",
        },
        {
          id: "without-layouts",
          label: "Free OCR",
          prompt: "Free OCR.",
          description: "Free-form OCR without layout constraints",
        },
        {
          id: "figures",
          label: "Parse Figure",
          prompt: "Parse the figure.",
          description: "Parse figures in documents",
        },
        {
          id: "general",
          label: "Describe Image",
          prompt: "Describe this image in detail.",
          description: "Generate detailed image descriptions",
        },
      ],
      fileUploadConstraints: {
        maxFiles: 1,
        fileTypeLimits: {
          image: 1,
          audio: 0,
          video: 0,
        },
        acceptedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      },
    },
    // Add more model constraints here as needed
    // Example:
    // {
    //   modelId: "another-special-model",
    //   restrictedPrompts: true,
    //   promptTemplates: [...],
    //   fileUploadConstraints: {...},
    // },
  ];
}

/**
 * Get constraints for a specific model
 */
export function getModelConstraints(
  modelId: string | undefined | null,
): ModelConstraints | null {
  if (!modelId) return null;

  return (
    createModelConstraintsConfig().find((config) => {
      if (typeof config.modelId === "string") {
        return config.modelId === modelId;
      }
      // RegExp matching
      return config.modelId.test(modelId);
    }) || null
  );
}

/**
 * Check if a model has restricted prompts
 */
export function hasRestrictedPrompts(
  modelId: string | undefined | null,
): boolean {
  const constraints = getModelConstraints(modelId);
  return constraints?.restrictedPrompts ?? false;
}

/**
 * Get prompt templates for a model
 */
export function getPromptTemplates(
  modelId: string | undefined | null,
): PromptTemplate[] {
  const constraints = getModelConstraints(modelId);
  return constraints?.promptTemplates ?? [];
}

/**
 * Get file upload constraints for a model
 */
export function getFileUploadConstraints(
  modelId: string | undefined | null,
): FileUploadConstraints | null {
  const constraints = getModelConstraints(modelId);
  return constraints?.fileUploadConstraints ?? null;
}

/**
 * Check if a model requires auto clearing history after submission
 */
export function shouldAutoClearHistory(
  modelId: string | undefined | null,
): boolean {
  const constraints = getModelConstraints(modelId);
  return constraints?.autoClearHistory ?? false;
}
