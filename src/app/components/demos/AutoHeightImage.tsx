"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import Loading from "../Loading/Loading_new";
import { PreviewImage } from "@/components/ui/standard/preview-image";

type Props = {
  src: string;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  alt?: string;
  maxHeight?: number;
  loading?: boolean;
  withPreview?: boolean;
};

export default function AutoHeightImage(props: Props) {
  const imgWrapper = useRef<HTMLDivElement>(null);
  const [imgHeight, setImgHeight] = useState<string | number | undefined>();
  const [imgWidth, setImgWidth] = useState<string | number | undefined>();

  const onImgLoad = useCallback(
    (el: HTMLImageElement) => {
      const rect = imgWrapper.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const imgEl = el;
      const nRatio = imgEl.naturalHeight / imgEl.naturalWidth;

      if (props.maxHeight && imgWrapper.current) {
        if (nRatio > props.maxHeight / rect.width) {
          imgWrapper.current.style.height = `${props.maxHeight}px`;
        } else {
          imgWrapper.current.style.height = "";
        }
      }

      const rectRatio = rect.height / rect.width;
      if (rectRatio - nRatio < 0.001) {
        imgEl.style.maxHeight = "100%";
        imgEl.style.width = "auto";
        setImgHeight("100%");
        setImgWidth("auto");
      } else {
        imgEl.style.maxWidth = "100%";
        imgEl.style.height = "auto";
        setImgWidth("100%");
        setImgHeight("auto");
      }
    },
    [props.maxHeight],
  );

  useEffect(() => {
    if (props.withPreview && imgWrapper.current) {
      const imgEl: HTMLImageElement | null =
        imgWrapper.current.querySelector("img");
      if (!imgEl) {
        return;
      }
      if (imgEl.complete) {
        onImgLoad(imgEl);
      } else {
        imgEl.addEventListener("load", () => {
          onImgLoad(imgEl);
        });
      }
    }
  }, [props.withPreview, onImgLoad, props.src]);

  return (
    <div
      ref={imgWrapper}
      className={props.className}
      style={{
        position: "relative",
        overflow: "hidden",
        maxHeight: `${props.maxHeight}px`,
        userSelect: "none",
        ...props.style,
      }}
    >
      {props.loading && <Loading />}
      {props.withPreview ? (
        <PreviewImage
          src={props.src}
          alt={props.alt}
          style={{ ...props.imgStyle }}
          height={imgHeight}
          width={imgWidth}
          // onLoad={onImgLoad}
        />
      ) : (
        <img
          src={props.src}
          alt={props.alt}
          style={{ ...props.imgStyle }}
          onLoad={(e) => {
            onImgLoad(e.target as HTMLImageElement);
          }}
        />
      )}
    </div>
  );
}
