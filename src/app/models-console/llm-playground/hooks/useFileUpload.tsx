import { useCallback, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { nanoid } from "nanoid";
import { message } from "@/components/ui/standard/notify";

export type FileType = "image" | "audio" | "video";

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
  url?: string; // Vercel Blob URL
  uploading?: boolean;
  uploadError?: string;
  uploadProgress?: number; // 0-100
  fileType: FileType;
  abortController?: AbortController;
}

interface FileTypeLimits {
  image?: number;
  audio?: number;
  video?: number;
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  enablePaste?: boolean;
  enableClick?: boolean;
  enableDrop?: boolean;
  fileTypeLimits?: FileTypeLimits; // New: per file type limits
}

export function useFileUpload(
  textAreaRef?: React.RefObject<HTMLTextAreaElement>,
  options: UseFileUploadOptions = {},
) {
  const {
    maxFiles = 1,
    maxFileSize = 100 * 1024 * 1024, // 100MB
    acceptedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
    ],
    enablePaste = true,
    enableClick = true,
    enableDrop = true,
    fileTypeLimits = {
      image: 5,
      audio: 3,
      video: 1,
    },
  } = options;

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [lastUploadedFileIds, setLastUploadedFileIds] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to determine file type
  const getFileType = useCallback((mimeType: string): FileType => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    return "image"; // default
  }, []);

  // Helper function to check file type limits
  const canAddFileOfType = useCallback(
    (fileType: FileType): boolean => {
      const currentCount = files.filter((f) => f.fileType === fileType).length;
      const limit = fileTypeLimits[fileType] || 0;
      return currentCount < limit;
    },
    [files, fileTypeLimits],
  );

  const uploadToBlob = useCallback(async (file: File, fileId: string) => {
    const abortController = new AbortController();

    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                uploading: true,
                uploadError: undefined,
                uploadProgress: 0,
                abortController,
              }
            : f,
        ),
      );

      const getFileExtension = (fileName: string): string => {
        const lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
          message.error("Unrecognized file type");
          throw new Error("Unrecognized file type");
        }
        return fileName.substring(lastDotIndex + 1).toLowerCase();
      };

      const fileExtension = getFileExtension(file.name);
      const safeFileName = `${nanoid()}.${fileExtension}`;

      const blob = await upload(safeFileName, file, {
        access: "public",
        handleUploadUrl: "/api/upload-file",
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                url: blob.url,
                uploading: false,
                uploadProgress: 100,
                abortController: undefined,
              }
            : f,
        ),
      );

      return blob.url;
    } catch (error: any) {
      // Check if upload was cancelled
      if (abortController.signal.aborted) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      } else {
        message.error("File upload failed");
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
      throw error;
    }
  }, []);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const newFileIds: string[] = [];

      for (const file of fileArray) {
        if (!acceptedTypes.includes(file.type)) {
          console.warn(`File type ${file.type} not supported`);
          continue;
        }

        const fileType = getFileType(file.type);

        // Check file type specific limits
        if (!canAddFileOfType(fileType)) {
          const limit = fileTypeLimits[fileType];
          message.warning(
            `Maximum ${limit} ${fileType} file${limit! > 1 ? "s" : ""} allowed`,
          );
          continue;
        }

        if (file.size > maxFileSize) {
          const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
          message.error(`File size exceeds limit ${maxSizeMB}MB`);
          continue;
        }

        try {
          const preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const fileId =
            Date.now().toString() + Math.random().toString(36).substr(2, 9);
          newFileIds.push(fileId);
          setFiles((prev) => {
            if (prev.length >= maxFiles) {
              console.warn(`Maximum ${maxFiles} files allowed`);
              return prev;
            }
            return [
              ...prev,
              {
                file,
                preview,
                id: fileId,
                uploading: false,
                fileType,
                uploadProgress: 0,
              },
            ];
          });
          // Upload files concurrently
          uploadToBlob(file, fileId).catch((error) => {
            // Error handling is done in uploadToBlob
          });
        } catch (error) {
          console.error("Error reading file:", error);
        }
      }
      setLastUploadedFileIds(newFileIds);
    },
    [
      acceptedTypes,
      maxFileSize,
      maxFiles,
      uploadToBlob,
      getFileType,
      canAddFileOfType,
      fileTypeLimits,
    ],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!enablePaste) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const fileFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            fileFiles.push(file);
          }
        }
      }

      if (fileFiles.length > 0) {
        e.preventDefault();
        processFiles(fileFiles);
      }
    },
    [enablePaste, processFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles],
  );

  const openFileDialog = useCallback(() => {
    if (enableClick && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [enableClick]);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      // If file is being uploaded, abort the upload
      if (fileToRemove?.abortController) {
        fileToRemove.abortController.abort();
      }
      return prev.filter((file) => file.id !== fileId);
    });
  }, []);

  const clearFiles = useCallback(() => {
    // Abort all ongoing uploads
    files.forEach((file) => {
      if (file.abortController) {
        file.abortController.abort();
      }
    });
    setFiles([]);
  }, [files]);

  const replaceFile = useCallback(
    async (fileId: string, newFile: File) => {
      try {
        const fileType = getFileType(newFile.type);
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(newFile);
        });

        setFiles((prev) => {
          const fileToReplace = prev.find((f) => f.id === fileId);
          // Abort ongoing upload if any
          if (fileToReplace?.abortController) {
            fileToReplace.abortController.abort();
          }
          return prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  file: newFile,
                  preview,
                  url: undefined,
                  uploading: false,
                  uploadError: undefined,
                  uploadProgress: 0,
                  fileType,
                  abortController: undefined,
                }
              : file,
          );
        });

        // Upload new file to Vercel Blob
        await uploadToBlob(newFile, fileId);
      } catch (error) {
        console.error("Error replacing file:", error);
      }
    },
    [uploadToBlob, getFileType],
  );

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      if (!enableDrop) return;
      e.preventDefault();
      e.stopPropagation();
      if (!isDragOver) {
        setIsDragOver(true);
      }
    },
    [enableDrop, isDragOver],
  );

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      if (!enableDrop) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current++;
      setIsDragOver(true);
    },
    [enableDrop],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      if (!enableDrop) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current--;
      setTimeout(() => {
        if (dragCounterRef.current <= 0) {
          dragCounterRef.current = 0;
          setIsDragOver(false);
        }
      }, 10);
    },
    [enableDrop],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (!enableDrop) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragOver(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const fileFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (acceptedTypes.includes(file.type)) {
            fileFiles.push(file);
          }
        }
        if (fileFiles.length > 0) {
          processFiles(fileFiles);
        }
      }
    },
    [enableDrop, acceptedTypes, processFiles],
  );

  // Setup paste event listener
  useEffect(() => {
    if (!enablePaste) return;

    const textarea = textAreaRef?.current;
    if (textarea) {
      textarea.addEventListener("paste", handlePaste);
      return () => {
        textarea.removeEventListener("paste", handlePaste);
      };
    }
  }, [handlePaste, textAreaRef, enablePaste]);

  // Setup drag and drop event listeners
  useEffect(() => {
    if (!enableDrop) return;

    const textarea = textAreaRef?.current;
    if (textarea) {
      textarea.addEventListener("dragover", handleDragOver, true);
      textarea.addEventListener("dragenter", handleDragEnter, true);
      textarea.addEventListener("dragleave", handleDragLeave, true);
      textarea.addEventListener("drop", handleDrop, true);

      return () => {
        textarea.removeEventListener("dragover", handleDragOver, true);
        textarea.removeEventListener("dragenter", handleDragEnter, true);
        textarea.removeEventListener("dragleave", handleDragLeave, true);
        textarea.removeEventListener("drop", handleDrop, true);
      };
    }
  }, [
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    textAreaRef,
    enableDrop,
  ]);

  // Create hidden file input element
  const fileInputElement = enableClick ? (
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept={acceptedTypes.join(",")}
      onChange={handleFileSelect}
      style={{ display: "none" }}
    />
  ) : null;

  return {
    files,
    removeFile,
    clearFiles,
    replaceFile,
    openFileDialog,
    fileInputElement,
    canAddMore: files.length < maxFiles,
    remainingSlots: maxFiles - files.length,
    uploadedFileUrl: files.find(
      (file) =>
        lastUploadedFileIds.includes(file.id) && file.url && !file.uploading,
    )?.url,
    isDragOver,
    canAddFileOfType,
    getFileTypeCounts: () => {
      return {
        image: files.filter((f) => f.fileType === "image").length,
        audio: files.filter((f) => f.fileType === "audio").length,
        video: files.filter((f) => f.fileType === "video").length,
      };
    },
    isUploading: files.some((f) => f.uploading),
    hasFiles: files.length > 0,
  };
}

export type { UploadedFile };
