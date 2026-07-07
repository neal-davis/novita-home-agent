import { Loader2 } from "lucide-react";
import ImagePlaceholder from "./ImagePlaceholder";
import styles from "./ImagePlaceholder.module.scss";
import { CSSProperties } from "react";

export default function PreviewImage({
  loading,
  large,
  url,
  noborder,
  className,
  withPreview,
  style,
}: {
  loading?: boolean;
  large?: boolean;
  url?: string;
  className?: string;
  noborder?: boolean;
  withPreview?: boolean;
  style?: CSSProperties;
}) {
  if (!url && loading) {
    return (
      <ImagePlaceholder
        large={large}
        className={`${styles.preview_img} ${styles.preview_img_animated_bg} ${className}`}
        noborder={noborder}
        style={style}
      />
    );
  }
  if (url && loading) {
    return (
      <ImagePlaceholder
        large={large}
        className={`${styles.preview_img} ${styles.preview_img_unfinished} ${className}`}
        content={
          <>
            <img src={url} alt="img" />
            <div className={styles.preview_img_spin}>
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          </>
        }
        noborder={noborder}
        style={style}
      />
    );
  }
  if (url && !loading) {
    return (
      <ImagePlaceholder
        large={large}
        className={`${styles.preview_img} ${className}`}
        url={url}
        noborder={noborder}
        withPreview={withPreview}
        style={style}
      />
    );
  }
  return (
    <ImagePlaceholder
      large={large}
      className={`${styles.preview_img} ${className}`}
      noborder={noborder}
      style={style}
    />
  );
}
