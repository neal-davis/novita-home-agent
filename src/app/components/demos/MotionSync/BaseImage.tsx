import styles from "./MotionSync.module.scss";

export default function BaseImage({
  src,
  onSelect,
  selected,
  loading,
}: {
  src: string;
  onSelect: () => void;
  selected: boolean;
  loading: boolean;
}) {
  return (
    <div
      className={`
        ${styles.base_image_wrap}
        ${selected ? styles.active : ""}
        ${loading ? styles.disabled : ""}
      `}
      onClick={() => {
        if (loading) {
          return;
        }
        onSelect();
      }}
    >
      <img className={styles.base_image} src={src} alt="generate image" />
    </div>
  );
}
