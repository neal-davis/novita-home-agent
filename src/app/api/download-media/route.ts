import { NextRequest, NextResponse } from "next/server";

// Configuration
const FETCH_TIMEOUT = 30000; // 30 seconds
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Download media file via server-side proxy
 * This bypasses CORS restrictions and ensures proper download behavior
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "Missing url parameter" },
        { status: 400 },
      );
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch (error) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Only allow http/https protocols
    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return NextResponse.json(
        { error: "Invalid URL protocol" },
        { status: 400 },
      );
    }

    // Create AbortController for timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      // Fetch the file from the remote URL with timeout
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch: ${response.statusText}` },
          { status: response.status },
        );
      }

      // Check file size before downloading
      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
          { status: 413 },
        );
      }

      // Get content type from response
      const contentType =
        response.headers.get("content-type") || "application/octet-stream";

      // Get filename from URL or use default
      const urlPath = targetUrl.pathname;
      const filename =
        urlPath.split("/").pop() ||
        `download-${Date.now()}.${getExtension(contentType)}`;

      // Get the file data
      const blob = await response.blob();

      // Double-check actual file size after download
      if (blob.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
          { status: 413 },
        );
      }

      const buffer = await blob.arrayBuffer();

      // Return the file with proper headers to force download
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": blob.size.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout error
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout. Please try again." },
          { status: 504 },
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Download proxy error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 },
    );
  }
}

/**
 * Get file extension from content type
 */
function getExtension(contentType: string): string {
  const mimeMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
  };

  const mime = contentType.split(";")[0].trim().toLowerCase();
  return mimeMap[mime] || "bin";
}
