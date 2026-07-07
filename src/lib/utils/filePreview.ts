/**
 * File preview utilities for opening and displaying uploaded files
 */

/**
 * Preview an uploaded file in a new window
 * @param fileUrl - The preview URL of the file (data URL or blob URL)
 * @param fileName - The name of the file
 * @param fileType - The MIME type of the file
 */
export const previewUploadedFile = (
  fileUrl: string,
  fileName: string,
  fileType: string,
): void => {
  try {
    // Open file in new window for preview
    const newWindow = window.open("", "_blank");

    console.log("newWindow", newWindow?.document);

    if (!newWindow) {
      console.error("Failed to open preview window - popup blocked");
      return;
    }

    // Use the existing document structure
    const doc = newWindow.document;

    // Use existing head and body elements instead of creating new ones
    const head = doc.head;
    const body = doc.body;

    // Clear existing content
    head.innerHTML = "";
    body.innerHTML = "";

    // Set document title
    const title = doc.createElement("title");
    title.textContent = `Preview: ${fileName}`;
    head.appendChild(title);

    // Create and add styles
    const style = doc.createElement("style");
    style.textContent = `
      body {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .media-content {
        max-width: 100%;
        max-height: 80vh;
        border-radius: 4px;
      }
    `;
    head.appendChild(style);

    // Create content based on file type
    if (fileType.startsWith("image/")) {
      const img = doc.createElement("img");
      img.src = fileUrl;
      img.alt = fileName;
      img.className = "media-content";
      img.style.objectFit = "contain";
      body.appendChild(img);
    } else if (fileType.startsWith("video/")) {
      const video = doc.createElement("video");
      video.src = fileUrl;
      video.className = "media-content";
      video.controls = true;
      video.style.objectFit = "contain";

      // Add fallback text
      video.textContent = "Your browser does not support the video tag.";
      body.appendChild(video);
    } else if (fileType.startsWith("audio/")) {
      const audio = doc.createElement("audio");
      audio.src = fileUrl;
      audio.className = "media-content";
      audio.controls = true;
      body.appendChild(audio);
    }

    // Focus the new window
    newWindow.focus();
  } catch (error) {
    console.error("Error previewing file:", error);
    // Fallback: try to open the file URL directly
    window.open(fileUrl, "_blank");
  }
};
