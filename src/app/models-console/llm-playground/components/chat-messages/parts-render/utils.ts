import { ThinkingContent } from "./types";

/**
 * Parse thinking content from text that contains <think> tags
 */
export const parseThinkingContent = (text: string): ThinkingContent | null => {
  if (!text.includes("<think>")) return null;

  if (text.includes("</think>")) {
    const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>([\s\S]*)/);
    if (thinkMatch) {
      const [, reasoningText, regularText] = thinkMatch;
      return {
        reasoningText: reasoningText.trim(),
        regularText: regularText.trim(),
      };
    }
  }

  return null;
};

// Configuration for part types that should not be rendered in the UI
// These are typically used for internal processing, state management, or metadata
export const NON_RENDERABLE_PART_TYPES = new Set([
  "step-start", // Step initialization marker - used for flow control
  "step-end", // Step completion marker - used for flow control
  "metadata", // Internal metadata - not user-facing
  "internal-state", // Component state data - not user-facing
  "timing-info", // Performance timing data - handled separately
  "debug-info", // Debug information - not shown in production UI
  // Add other non-visual part types here as needed
]);

/**
 * Check if a part type should be rendered in the UI
 * @param partType - The type of the message part
 * @returns true if the part should be rendered, false if it should be filtered out
 */
export const shouldRenderPartType = (partType: string): boolean => {
  return !NON_RENDERABLE_PART_TYPES.has(partType);
};

/**
 * Preprocess message parts to extract reasoning content and ensure proper ordering
 * This function handles cases where reasoning content is embedded in text parts
 */
export const preprocessMessageParts = (parts: any[]): any[] => {
  const processedParts: any[] = [];

  parts.forEach((part) => {
    if (part.type === "text" && part.text?.includes("<think>")) {
      const thinkingContent = parseThinkingContent(part.text);

      if (thinkingContent) {
        const { reasoningText, regularText } = thinkingContent;

        // Create reasoning part if there's thinking content
        if (reasoningText) {
          processedParts.push({
            type: "reasoning",
            text: reasoningText,
            // Note: Reasoning parts don't need providerMetadata as they don't render SLA metrics
          });
        }

        // Create text part with regular content if there's remaining text
        if (regularText) {
          processedParts.push({
            ...part,
            text: regularText,
          });
        }
      } else if (
        part.text.includes("<think>") &&
        !part.text.includes("</think>")
      ) {
        // Handle streaming thinking content - convert to reasoning part
        const thinkStartMatch = part.text.match(/<think>([\s\S]*)/);
        if (thinkStartMatch) {
          const [, thinkingText] = thinkStartMatch;
          processedParts.push({
            type: "reasoning",
            text: thinkingText,
            isStreaming: true,
            // Note: Reasoning parts don't need providerMetadata as they don't render SLA metrics
          });
        }
      } else {
        // Keep original part if no thinking content found
        processedParts.push(part);
      }
    } else {
      // Keep non-text parts as is
      processedParts.push(part);
    }
  });

  // Sort parts to ensure reasoning content appears first
  return processedParts.sort((a, b) => {
    const aIsReasoning = a.type === "reasoning";
    const bIsReasoning = b.type === "reasoning";

    // Reasoning parts come first
    if (aIsReasoning && !bIsReasoning) return -1;
    if (!aIsReasoning && bIsReasoning) return 1;

    // Maintain original order for same types
    return 0;
  });
};
