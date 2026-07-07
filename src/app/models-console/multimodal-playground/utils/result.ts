import { MultimodalTaskResult } from "@/types/multimodal-playground";

const MAX_STRING_LENGTH = 500; // JSON attribute value length limit

export type ResultCategory = "image_gen" | "audio_gen" | "video_gen";

export function getResultType(
  result: MultimodalTaskResult | null,
  category: ResultCategory,
) {
  if (!result) {
    return null;
  }

  if (result instanceof Blob) {
    if (category === "audio_gen") {
      return "audio";
    }

    return null;
  }

  if (typeof result === "object" && result.images && result.images.length > 0) {
    return "image";
  }

  if (typeof result === "object" && result.videos && result.videos.length > 0) {
    return "video";
  }

  if (typeof result === "object" && result.audios && result.audios.length > 0) {
    return "audio";
  }

  if (category === "image_gen") {
    return "image";
  }

  if (category === "video_gen") {
    return "video";
  }

  if (category === "audio_gen") {
    return "audio";
  }

  return null;
}

/**
 * Extract image URLs from result object
 */
/**
 * Generic function to extract URLs from API response
 * @param result - API response object
 * @param key - The key in result object (e.g., 'images', 'videos')
 * @param urlProperty - The property name in object items (e.g., 'image_url', 'video_url')
 * @returns Array of extracted URL strings
 */
function extractUrls(
  result: any,
  key: string,
  urlProperty: string,
  category: ResultCategory,
  extraUrlProperties: string[] = [],
): string[] {
  if (!result) return [];

  const items = typeof result === "object" ? result[key] : null;
  if (!Array.isArray(items)) {
    // The result may come from a synchronous task and might not be of type TaskResultResponse
    if (
      (key === "images" && category === "image_gen") ||
      (key === "videos" && category === "video_gen") ||
      (key === "audios" && category === "audio_gen")
    ) {
      if (result.data && Array.isArray(result.data)) {
        const urls: string[] = [];
        result.data.forEach((item: any) => {
          if (item && typeof item === "object" && (item.url || item.b64_json)) {
            urls.push(item.url || item.b64_json);
          }
        });
        if (urls.length > 0) {
          return urls.filter(
            (url) => typeof url === "string" && url.trim() !== "",
          );
        }
      }

      // The response might be raw binary data (Blob or ArrayBuffer)
      if (key === "audios" && category === "audio_gen") {
        if (result instanceof Blob) {
          if (
            result.type.includes("pcm") ||
            result.type === "" ||
            result.type === "application/octet-stream"
          ) {
            const blobUrl = URL.createObjectURL(result);
            (window as any).__pendingAudioConversion =
              (window as any).__pendingAudioConversion || {};
            (window as any).__pendingAudioConversion[blobUrl] = result;
            return [blobUrl];
          } else {
            const blobUrl = URL.createObjectURL(result);
            return [blobUrl];
          }
        }

        // Check if result has base64 encoded audio data
        if (typeof result === "string" && result.startsWith("data:audio/")) {
          return [result];
        }
      }
    }
  }

  const urls: string[] = [];

  if (!items || items.length === 0) {
    extraUrlProperties.forEach((prop) => {
      if (result[prop]) {
        if (Array.isArray(result[prop])) {
          urls.push(...result[prop]);
        } else if (typeof result[prop] === "string") {
          urls.push(result[prop]);
        }
      }
    });
  } else {
    items?.forEach((item: any) => {
      if (typeof item === "string") {
        urls.push(item);
      } else if (item && typeof item === "object" && item[urlProperty]) {
        urls.push(item[urlProperty]);
      }
    });
  }

  return urls.filter((url) => typeof url === "string" && url.trim() !== "");
}

export function extractImages(result: any, category: ResultCategory): string[] {
  return extractUrls(result, "images", "image_url", category, ["image_urls"]);
}

export function extractVideos(result: any, category: ResultCategory): string[] {
  return extractUrls(result, "videos", "video_url", category);
}

export function extractAudios(result: any, category: ResultCategory): string[] {
  return extractUrls(result, "audios", "audio_url", category);
}

export function extractTexts(result: any, category: ResultCategory): string[] {
  if (!result) return [];

  if (category === "audio_gen") {
    if (result.text) {
      return [result.text];
    }
  }
  return [];
}

/**
 * Convert flat dot-notation object to nested object
 * Example: { "input.prompt": "test", "parameters.seed": 0 }
 * => { input: { prompt: "test" }, parameters: { seed: 0 } }
 * Also truncates long string values to prevent UI freezing
 */
export const convertFlatToNested = (
  flatObj: Record<string, any>,
): Record<string, any> => {
  const result: Record<string, any> = {};

  Object.entries(flatObj).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length === 0) {
      return;
    }

    if (value === "") {
      return;
    }

    const keys = key.split(".");
    let current = result;

    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        // Last key, assign the value with truncation applied
        current[k] = truncateLongStrings(value);
      } else {
        // Intermediate key, create nested object if it doesn't exist
        if (!current[k] || typeof current[k] !== "object") {
          current[k] = {};
        }
        current = current[k];
      }
    });
  });

  return result;
};

/**
 * Recursively process object and truncate overly long strings
 */
export const truncateLongStrings = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    if (obj.length > MAX_STRING_LENGTH) {
      return `${obj.substring(0, MAX_STRING_LENGTH)}... (truncated, total length: ${obj.length} chars)`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => truncateLongStrings(item));
  }

  if (typeof obj === "object") {
    const truncated: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        truncated[key] = truncateLongStrings(obj[key]);
      }
    }
    return truncated;
  }

  return obj;
};
