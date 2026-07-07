import styles from "./modelItem.module.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Link from "next/link";

export type ModelItem = {
  base_model: string;
  base_model_type: string;
  categories: string[];
  cover_url: string;
  hash_sha256: string;
  id: number;
  name: string;
  sd_name: string;
  sd_name_in_api: string;
  source: string;
  status: number;
  tags: string[];
  type: {
    name: string;
    display_name: string;
  };
  is_nsfw: boolean;
};

export default function ModelItem(data: ModelItem) {
  return data.id ? (
    <Link
      className={styles.img_wrap}
      href={`/model/${data.id}`}
      target="_blank"
    >
      <LazyLoadImage
        src={
          data.cover_url && !data.is_nsfw ? data.cover_url : "/not_found.png"
        }
        alt={data.sd_name}
        loading="lazy"
      />
      <div className={styles.text_box}>
        <div className={styles.name}>{data.sd_name}</div>
      </div>
      <div className={styles.tag}>{data.type.display_name}</div>
      {/* {data.cover_url && <div className={styles.mask}></div>} */}
    </Link>
  ) : (
    <div className={styles.img_wrap}>
      <LazyLoadImage
        src={
          data.cover_url && !data.is_nsfw ? data.cover_url : "/not_found.png"
        }
        alt={data.sd_name}
        loading="lazy"
      />
      <div className={styles.text_box}>
        <div className={styles.name}>{data.sd_name}</div>
      </div>
      <div className={styles.tag}>{data.type.display_name}</div>
      {/* {data.cover_url && <div className={styles.mask}></div>} */}
    </div>
  );
}
