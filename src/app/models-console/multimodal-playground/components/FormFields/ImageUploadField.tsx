"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, X } from "lucide-react";
import { FieldLabel } from "./FieldLabel";
import { ImageInputMode } from "../../utils/imageFieldConfig";
import styles from "./FormFields.module.scss";
interface ImageUploadFieldProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string | null;
  description?: string;
  maxItems?: number;
  required?: boolean;
  inputMode?: ImageInputMode;
}

const isDataBase64Url = (value: string): boolean =>
  /^data:[^;]+;base64,/i.test(value.trim());

const isHttpUrl = (value: string): boolean =>
  /^https?:\/\//i.test(value.trim());

export const ImageUploadField = ({
  label = "images",
  value,
  onChange,
  error,
  description,
  maxItems = 3,
  required = false,
  inputMode = "image",
}: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tipTitle, setTipTitle] = useState<string | null>(null);

  const showTip = (title: string) => {
    setTipTitle(title);
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (value.length >= maxItems) {
      showTip(
        "Maximum {maxItems} images allowed".replace(
          "{maxItems}",
          String(maxItems),
        ),
      );
      return;
    }
    // Validate file type
    if (!file.type.startsWith("image/")) {
      showTip("Please select a valid image file");
      return;
    }
    setUploading(true);
    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      onChange([...value, base64]);
    } catch (err) {
      console.error("Upload failed:", err);
      showTip("Image processing failed, please try again");
    } finally {
      setUploading(false);
      // Reset input to allow uploading the same file again
      e.target.value = "";
    }
  };
  const handleAddUrl = () => {
    const nextUrl = urlInput.trim();
    if (!nextUrl) return;
    if (value.length >= maxItems) {
      showTip(
        "Maximum {maxItems} images allowed".replace(
          "{maxItems}",
          String(maxItems),
        ),
      );
      return;
    }
    if (
      inputMode === "httpUrl" &&
      (isDataBase64Url(nextUrl) || !isHttpUrl(nextUrl))
    ) {
      showTip("Please enter an image URL starting with http or https");
      return;
    }
    onChange([...value, nextUrl]);
    setUrlInput("");
    setShowUrlInput(false);
  };
  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };
  return (
    <div className={styles.field_container}>
      <FieldLabel label={label} required={required} description={description} />

      <div className={styles.image_upload_container}>
        {/* Image previews */}
        {Array.isArray(value) && value.length > 0 && (
          <div className={styles.image_preview_list}>
            {value.map((url, index) => (
              <div key={index} className={styles.image_preview_item}>
                <img src={url} alt={`Upload ${index + 1}`} />
                <button
                  onClick={() => handleRemove(index)}
                  className={styles.remove_button}
                  type="button"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.upload_container}>
          <p className={`${styles.field_hint} mr-2`}>
            {"{current}/{max} images"
              .replace("{current}", String(value.length))
              .replace("{max}", String(maxItems))}
          </p>
          {/* Upload buttons */}
          {value.length < maxItems && (
            <div className={styles.upload_actions}>
              {inputMode !== "httpUrl" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-[4px]"
                    size="sm"
                    disabled={uploading}
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    {uploading ? "Uploading..." : "Upload image"}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </>
              )}

              <Button
                type="button"
                variant="outline"
                className="rounded-[4px]"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                Add link
              </Button>
            </div>
          )}
        </div>

        {/* URL input */}
        {showUrlInput && (
          <div className={styles.url_input_container}>
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={
                inputMode === "base64"
                  ? "data:image/png;base64,..."
                  : "https://example.com/image.jpg"
              }
              className="h-7 font-small"
              containerClassName="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <Button type="button" size="sm" onClick={handleAddUrl}>
              Add
            </Button>
          </div>
        )}
      </div>

      {error && <span className={styles.error_text}>{error}</span>}

      <AlertDialog
        open={!!tipTitle}
        onOpenChange={(open) => {
          if (!open) {
            setTipTitle(null);
          }
        }}
      >
        <AlertDialogContent className={styles.tip_dialog_content}>
          <AlertDialogHeader className={styles.tip_dialog_header}>
            <div className={styles.tip_dialog_icon}>
              <AlertCircle size={18} />
            </div>
            <div className={styles.tip_dialog_text}>
              <AlertDialogTitle className={styles.tip_dialog_title}>
                Invalid input format
              </AlertDialogTitle>
              <AlertDialogDescription className={styles.tip_dialog_description}>
                {tipTitle}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className={styles.tip_dialog_footer}>
            <AlertDialogAction
              className={styles.tip_dialog_action}
              onClick={() => setTipTitle(null)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
