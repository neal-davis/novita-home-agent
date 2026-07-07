import { Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Link from "next/link";
import styles from "./modelItem.module.css";
import { getModelDetail } from "@/api/model";

export type ModelItemProps = {
  model: Model;
  componentType: "link" | "dom";
  needDetails?: boolean;
  onSelect: (details: ModelDetails | Model) => void;
  selected: boolean;
  itemWidth?: number;
  offMatureBlur?: boolean;
};

function generateModelUrl(model: Model) {
  const pattern = /^([a-zA-Z0-9_.-]+?)(?:_v\d+|-\d+)?(?=_[0-9]+\.safetensors$)/;
  const match = model.sd_name.match(pattern);
  let modelName = match ? match[1] : model.sd_name_in_api;
  // 去除空格
  modelName = modelName.replace(/\s/g, "");
  modelName = modelName.replace(".safetensors", "");
  return modelName + "_" + model.id;
}

export default function ModelItem(props: ModelItemProps) {
  const [loading, setLoading] = useState(false);

  const detailsCache = useRef<ModelDetails | null>(null);

  const content = (
    <>
      <LazyLoadImage
        src={
          props.model.cover_url && !props.model.is_nsfw
            ? props.model.cover_url
            : "/not_found.png"
        }
        alt={props.model.sd_name}
        loading="lazy"
      />
      <div className={styles.text_box}>
        <div className={styles.name}>
          <div className={styles.api_name}>
            <span className={styles.tag_item}>model_name</span>
            <span>
              {Array.isArray(props.model.hight_light?.sd_name) &&
              props.model.hight_light.sd_name.length > 0 ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: props.model.hight_light.sd_name.join(""),
                  }}
                ></span>
              ) : (
                props.model.sd_name
              )}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.tag}>{props.model.type.display_name}</div>
    </>
  );
  if (props.componentType === "link") {
    const url = generateModelUrl(props.model);
    return (
      <Link
        className={`${styles.img_wrap} ${
          props.selected ? styles.selected : ""
        }`}
        style={{
          width: props.itemWidth || 320,
          height: props.itemWidth || 320,
        }}
        href={`/model/${url}`}
        target="_blank"
      >
        {content}
      </Link>
    );
  }
  return (
    <div
      className={`${styles.img_wrap} ${styles.img_wrap_div} ${
        props.selected ? styles.selected : ""
      }`}
      style={{
        width: props.itemWidth || 320,
        height: props.itemWidth || 320,
      }}
      onClick={() => {
        if (props.needDetails) {
          if (detailsCache.current) {
            props.onSelect(detailsCache.current);
            return;
          }
          setLoading(true);
          getModelDetail(props.model.id, props.model)
            .then((details) => {
              if (details) {
                detailsCache.current = details;
                props.onSelect(details);
              }
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          props.onSelect(props.model);
        }
      }}
    >
      {loading && (
        <div className={styles.loading}>
          <Loader2 className={`${styles.loading_spin} w-4 h-4 animate-spin`} />
        </div>
      )}
      {content}
    </div>
  );
}
