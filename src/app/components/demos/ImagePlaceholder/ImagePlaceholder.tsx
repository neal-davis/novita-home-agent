import { useEffect, useRef, useCallback } from "react";
import { PreviewImage } from "@/components/ui/standard/preview-image";
import styles from "./ImagePlaceholder.module.scss";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  content?: React.ReactNode;
  url?: string;
  noborder?: boolean;
  large?: boolean;
  withPreview?: boolean;
  tipsTitle?: string;
  tipsMessage?: string;
};

export default function ImagePlaceholder({
  className,
  style,
  content,
  url,
  noborder,
  large,
  withPreview,
  tipsTitle,
  tipsMessage,
}: Props) {
  const imgRatio = useRef(1);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapper.current && (!large || (large && url))) {
      const rect = wrapper.current.getBoundingClientRect();
      wrapper.current.style.height = `${rect.width / imgRatio.current}px`;
    }
  }, [large, url]);
  useEffect(() => {
    if (wrapper.current && !large) {
      const rObserver = new ResizeObserver((entries) => {
        if (!wrapper.current) {
          return;
        }
        for (const ent of entries) {
          if (ent.contentBoxSize) {
            const contentBoxSize = ent.contentBoxSize[0];
            wrapper.current.style.height = `${
              contentBoxSize.inlineSize / imgRatio.current
            }px`;
          }
        }
      });
      rObserver.observe(wrapper.current);
      return () => {
        rObserver.disconnect();
      };
    }
  });

  const onImgLoad = useCallback(
    (e: any) => {
      if (!wrapper.current) {
        return;
      }
      const target = e.target as HTMLImageElement;
      imgRatio.current = target.naturalWidth / target.naturalHeight;
      const currentRect = wrapper.current?.getBoundingClientRect();
      // if (ratio > 1) {
      //   wrapper.current.style.width = `${currentRect.height * ratio}px`
      // } else {

      // }
      if (!large) {
        wrapper.current.style.height = `${
          currentRect.width / imgRatio.current
        }px`;
        return;
      }
      if (target.naturalWidth < currentRect.width) {
        wrapper.current.style.width = target.naturalWidth + "px";
        wrapper.current.style.height = target.naturalHeight + "px";
      } else {
        wrapper.current.style.height = `${
          currentRect.width / imgRatio.current
        }px`;
      }
    },
    [large],
  );

  return (
    <div
      ref={wrapper}
      className={`${styles.image_placeholder} ${
        content ? styles.with_content : ""
      } ${noborder ? styles.no_border : ""} ${
        large ? styles.preview_img_large : ""
      } ${className}`}
      style={{ ...style }}
    >
      <div className={styles.content_wrapper}>
        {content}
        {url &&
          (withPreview ? (
            <PreviewImage
              className={styles.img}
              src={url}
              alt="img"
              onLoad={onImgLoad}
            />
          ) : (
            <img
              className={styles.img}
              src={url}
              alt="img"
              onLoad={onImgLoad}
            />
          ))}
      </div>
      {(tipsTitle || tipsMessage) && (
        <div className={styles.nsfw_notice}>
          {tipsTitle && <p className={styles.nsfw_notice_title}>{tipsTitle}</p>}
          {tipsMessage && (
            <p className={styles.nsfw_notice_message}>{tipsMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
