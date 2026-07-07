"use client";

import { useState, type CSSProperties } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PreviewImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  preview?: boolean;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
};

export function PreviewImage({
  src,
  alt,
  className,
  rootClassName,
  style,
  width,
  height,
  preview = true,
  onLoad,
  onClick,
}: PreviewImageProps) {
  const [open, setOpen] = useState(false);
  const img = (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        width,
        height,
        cursor: preview ? "zoom-in" : undefined,
        ...style,
      }}
      onLoad={onLoad}
      onClick={(event) => {
        onClick?.(event);
        if (preview && src) {
          setOpen(true);
        }
      }}
    />
  );

  if (!preview) {
    return img;
  }

  return (
    <span className={cn("inline-block", rootClassName)}>
      {img}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">
            {alt || "Image preview"}
          </DialogTitle>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>
    </span>
  );
}
