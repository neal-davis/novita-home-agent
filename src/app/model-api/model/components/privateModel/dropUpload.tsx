"use client";

import { Inbox as InboxOutlined } from "lucide-react";
import { message } from "@/components/ui/standard/notify";
import { ProgressBar } from "@/components/ui/standard/progress";

import { getUploadUrl } from "@/api/user";
import { useId, useState } from "react";
import styles from "./dropUpload.module.css";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";

export type UploadFileLike = {
  uid: string;
  name: string;
  status?: "done" | "uploading" | "error";
  originFileObj?: File;
};

async function computeSHA256Hex(file: File) {
  if (!window.crypto || !window.btoa) {
    return undefined;
  }
  // 读取文件内容
  const buffer = await file.arrayBuffer();

  // 使用 Web Cryptography API 计算 SHA-256
  const hash = await window.crypto.subtle.digest("SHA-256", buffer);

  // base64
  const hashArray = Array.from(new Uint8Array(hash));
  const base64String = window.btoa(
    hashArray.map((b) => String.fromCharCode(b)).join(""),
  );

  return base64String;
}

function uploadFileWithXHR(
  file: File,
  presignedUrl: string,
  contentSign: string,
  onProgress: (v: number) => void,
) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(xhr.statusText));
        }
      }
    };

    xhr.open("PUT", presignedUrl, true);

    xhr.setRequestHeader("Content-Type", "binary/octet-stream");
    xhr.setRequestHeader("x-amz-checksum-sha256", contentSign);
    xhr.setRequestHeader("X-Amz-Sdk-Checksum-Algorithm", "SHA256");

    xhr.send(file);
  });
}

export default function DropUpload({
  model_name,
  fileList,
  setFileList,
  fileExtension,
  setLoading,
  setIsUpload,
}: {
  model_name: string;
  fileList: UploadFileLike[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFileLike[]>>;
  fileExtension: string[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUpload: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const keys = useSelectKeys();
  const inputId = useId();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<"exception" | "active">(
    "active",
  );

  const accept = fileExtension.map((one) => "." + one).join(",");
  const handleFile = async (file?: File) => {
    if (!file) return;
    if (model_name === "") {
      message.error("Please enter model name first");
      return;
    }
    if (/^[A-Za-z0-9_]{1,100}$/.test(model_name) === false) {
      message.error(
        "Model name can only contain letters, numbers, and underscores, and the length does not exceed 100",
      );
      return;
    }
    if (keys.length === 0) {
      message.error("Please add key first");
      return;
    }
    setFileList([
      {
        uid: `${file.name}-${file.lastModified}`,
        name: file.name,
        status: "uploading",
        originFileObj: file,
      },
    ]);
    try {
      const sha256 = await computeSHA256Hex(file);

      if (!sha256) {
        message.error(
          "SHA256 computation failed, Please check if your browser version supports crypto and btoa functions, or you can contact us to resolve model upload issues.",
        );
        return;
      }

      const file_extension = file.name.split(".").pop() ?? "";
      setIsUpload(true);
      const res = await getUploadUrl(
        keys[0],
        model_name,
        sha256,
        file_extension,
      );
      if (!res.upload_url) {
        message.error(res.message ?? "Upload failed");
        return;
      }
      setUploadProgress(0);
      setLoading(true);
      setUploadStatus("active");
      uploadFileWithXHR(file, res.upload_url, sha256, (v) => {
        setUploadProgress(v);
      })
        .then((res) => {
          console.log(res);
          setUploadProgress(100);
        })
        .catch((err) => {
          console.error("file upload error", err);
          setUploadProgress(0);
          setUploadStatus("exception");
          setIsUpload(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log("Upload error", error);
      setIsUpload(false);
      message.error("Upload failed");
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={styles.dragger_wrap}
        style={{
          padding: "10px",
          border: "1px solid var(--gray-2)",
        }}
        onClick={() => document.getElementById(inputId)?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            document.getElementById(inputId)?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          void handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          id={inputId}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <div>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p
            className="ant-upload-text"
            style={{
              color: "var(--black)",
            }}
          >
            Click or drag file to this area to upload
          </p>
          <p
            className="ant-upload-hint"
            style={{
              color: "var(--dark-2)",
            }}
          >
            Support for a single or bulk upload. Strictly prohibited from
            uploading company data or other banned files.
          </p>
        </div>
      </div>
      {fileList.length > 0 &&
        fileList.map((file) => (
          <div
            key={file.uid}
            style={{
              marginTop: 10,
            }}
          >
            <span>{file.name}</span>
            <span>
              <ProgressBar
                percent={Number(uploadProgress.toFixed(1))}
                status={uploadStatus}
              />
            </span>
          </div>
        ))}
    </div>
  );
}
