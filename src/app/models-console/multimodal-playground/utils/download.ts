/**
 * MIME type to file extension mapping
 */
const MIME_TO_EXTENSION: Record<string, string> = {
  // Images
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  // Videos
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogg",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  "video/x-matroska": "mkv",
  "video/mpeg": "mpeg",
  // Audio
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/wave": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
  "audio/aac": "aac",
  "audio/flac": "flac",
  "audio/x-m4a": "m4a",
};

/**
 * Get file extension from MIME type
 */
const getExtensionFromMimeType = (mimeType: string): string => {
  const normalizedMime = mimeType.toLowerCase().trim();
  return (
    MIME_TO_EXTENSION[normalizedMime] || normalizedMime.split("/")[1] || "bin"
  );
};

/**
 * Convert base64 string to Blob
 */
const base64ToBlob = (base64Data: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Detect MIME type from base64 data signature
 */
const detectMimeTypeFromBase64 = (base64Data: string): string => {
  // Check common file signatures
  if (base64Data.startsWith("/9j/")) return "image/jpeg";
  if (base64Data.startsWith("iVBORw0KGgo")) return "image/png";
  if (base64Data.startsWith("R0lGOD")) return "image/gif";
  if (base64Data.startsWith("AAAA")) return "video/mp4"; // ftyp
  if (base64Data.startsWith("GkXfo")) return "video/webm";
  if (base64Data.startsWith("ID3")) return "audio/mp3";
  if (base64Data.startsWith("//sQA")) return "audio/mp3"; // MPEG audio without ID3
  if (base64Data.startsWith("//swA")) return "audio/mp3"; // MPEG audio alternative
  if (base64Data.startsWith("SUQz")) return "audio/mp3"; // ID3v2

  // RIFF format (WebP or WAV) - needs more detailed check
  if (base64Data.startsWith("UklGR")) {
    // Check for WebP signature (RIFF....WEBP)
    if (base64Data.includes("V0VCUA")) return "image/webp";
    // Check for WAV signature (RIFF....WAVE)
    if (base64Data.includes("V0FWRQ")) return "audio/wav";
    // Check for AVI signature (RIFF....AVI)
    if (base64Data.includes("QVZJ")) return "video/avi";
    // Default to WAV for RIFF format
    return "audio/wav";
  }

  // OGG container (could be audio or video)
  if (base64Data.startsWith("T2dn")) return "audio/ogg";

  // FLAC audio
  if (base64Data.startsWith("ZkxhQ")) return "audio/flac";

  // M4A/AAC audio (MP4 container)
  if (base64Data.startsWith("AAAAGG")) return "audio/m4a";

  return "application/octet-stream";
};

/**
 * Get appropriate file prefix based on MIME type
 */
const getFilePrefix = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
};

/**
 * Fetch content type from URL via HEAD request
 */
const fetchContentType = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors",
    });
    return response.headers.get("Content-Type");
  } catch (error) {
    // If HEAD fails (possibly due to CORS), try GET with Range header
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Range: "bytes=0-0", // Request only 1 byte
        },
        mode: "cors",
      });
      return response.headers.get("Content-Type");
    } catch (getError) {
      return null;
    }
  }
};

/**
 * Trigger download by creating and clicking a link element
 */
const triggerDownload = (href: string, filename: string) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};

/**
 * Download media file from URL or base64 data
 * Supports images, videos, and audio in both URL and binary formats
 * @param url - Media file URL or base64 data
 * @param index - File index for naming
 */
export const downloadMedia = async (url: string, index: number) => {
  // Handle data URL format (data:mime/type;base64,...)
  if (url.startsWith("data:")) {
    const mimeMatch = url.match(/data:([^;]+);base64,/);
    const mimeType = mimeMatch?.[1] || "application/octet-stream";
    const extension = getExtensionFromMimeType(mimeType);
    const prefix = getFilePrefix(mimeType);

    // Convert base64 to blob
    const base64Data = url.split(",")[1];
    const blob = base64ToBlob(base64Data, mimeType);

    // Create object URL from blob
    const blobUrl = URL.createObjectURL(blob);
    const filename = `${prefix}-${index + 1}.${extension}`;

    triggerDownload(blobUrl, filename);

    // Clean up the object URL after download
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    return;
  }

  // Handle raw base64 string without data: prefix
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("blob:")
  ) {
    try {
      // Try to detect MIME type from base64 signature
      const detectedMimeType = detectMimeTypeFromBase64(url);
      const mimeType = detectedMimeType || "application/octet-stream";
      const extension = getExtensionFromMimeType(mimeType);
      const prefix = getFilePrefix(mimeType);

      const blob = base64ToBlob(url, mimeType);
      const blobUrl = URL.createObjectURL(blob);
      const filename = `${prefix}-${index + 1}.${extension}`;

      triggerDownload(blobUrl, filename);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      return;
    } catch (error) {
      console.error("Failed to process base64 data:", error);
      return;
    }
  }

  // Handle regular HTTP(S) URL - use backend proxy to avoid CORS issues
  // Fetch the file through proxy to get the actual content type
  const proxyUrl = `/api/download-media?url=${encodeURIComponent(url)}`;

  try {
    // Download the file via proxy
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    // Get content type from response
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";

    // Get extension from content type
    const extension = getExtensionFromMimeType(contentType);
    const prefix = getFilePrefix(contentType);
    const filename = `${prefix}-${index + 1}.${extension}`;

    // Convert response to blob
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    triggerDownload(blobUrl, filename);

    // Clean up the object URL after download
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error("Failed to download media:", error);

    // Fallback: try direct download without filename control
    // This at least attempts the download even if we can't set the correct name
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  }
};
