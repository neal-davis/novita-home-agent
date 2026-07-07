import { PreviewImage } from "@/components/ui/standard/preview-image";
import { AudioPlayer } from "./AudioPlayer";
import styles from "./states.module.scss";
interface PreviewContentProps {
  images: string[];
  videos: string[];
  audios: string[];
  texts: string[];
  resultType: "image" | "video" | "audio" | null;
}
// Handle base64 formatted URLs and ensure the correct prefix is included
const normalizeImageUrl = (url: string): string => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("data:")) {
    return url;
  }
  return `data:image/png;base64,${url}`;
};
export const PreviewContent = ({
  images,
  videos,
  audios,
  texts,
  resultType,
}: PreviewContentProps) => {
  if (!resultType) {
    return (
      <div className={styles.no_images}>
        <p>{"No result yet"}</p>
      </div>
    );
  }
  if (resultType === "image") {
    return (
      <div className={styles.preview_container}>
        {images.map((url, index) => {
          const normalizedUrl = normalizeImageUrl(url);
          return (
            <div key={index} className={styles.result_content}>
              <PreviewImage
                src={normalizedUrl}
                alt={"Image {index}".replace("{index}", String(index + 1))}
                className={styles.media_element}
              />
            </div>
          );
        })}
      </div>
    );
  }
  if (resultType === "video") {
    return (
      <div className={styles.preview_container}>
        {videos.map((url, index) => (
          <div key={index} className={styles.result_content}>
            <video src={url} controls className={styles.media_element} />
          </div>
        ))}
      </div>
    );
  }
  if (resultType === "audio") {
    if (audios.length > 0) {
      return (
        <div className={styles.preview_container}>
          {audios.map((url, index) => (
            <div key={index} className={styles.result_content}>
              <AudioPlayer src={url} className={styles.media_element} />
            </div>
          ))}
        </div>
      );
    }
    if (texts.length > 0) {
      return (
        <div className={styles.preview_container}>
          {texts.map((text, index) => (
            <pre key={index} className={styles.text_result_preview}>
              {text}
            </pre>
          ))}
        </div>
      );
    }
  }
  return null;
};
