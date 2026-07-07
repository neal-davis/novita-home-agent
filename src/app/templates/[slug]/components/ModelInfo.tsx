import Link from "next/link";
import { ArrowUp as ArrowUpOutlined } from "lucide-react";
import GPUCard from "./GPUCard";
import styles from "./ModelInfo.module.scss";
export default function ModelInfo({
  data,
  copy,
}: {
  data: LangdingPageTemplateSchema;
  copy?: unknown;
}) {
  const tags = data.tag.split(",");
  return (
    <div className={`${styles.wrap} flex flex-row flex-wrap`}>
      <div className={`flex-1 ${styles.model_info}`}>
        <h2 className={styles.title}>{data.modelName}</h2>
        <p className={styles.slogan}>{data.slogan}</p>
        <div className={`${styles.tags} flex flex-row flex-wrap`}>
          {tags.map((tag, index) => {
            return (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            );
          })}
        </div>
        <div className={`${styles.info_list} flex flex-row flex-wrap`}>
          <span>
            <label>{`${"Original Author"} : `}</label>
            {data.author}
          </span>
          <span>
            <label>{`${"Update Time"} : `}</label>
            {data.updateTime}
          </span>
          {data.linkUrl && data.linkText && (
            <Link className={styles.link} target="_blank" href={data.linkUrl}>
              <span className={styles.link_text}>{data.linkText}</span>
              <ArrowUpOutlined
                style={{ fontSize: 15, transform: "rotate(45deg)" }}
              />
            </Link>
          )}
        </div>
      </div>
      <GPUCard templateId={data.templateId} copy={copy} />
    </div>
  );
}
