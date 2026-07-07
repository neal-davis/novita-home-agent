import Link from "next/link";
import Image from "next/image";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./index.module.scss";

export default function CatalogueItemList({
  data,
}: {
  data: LangdingPageTemplateSchema[];
}) {
  return (
    <ul className={`${styles.func_group} grid grid-cols-3 gap-x-4 gap-y-6`}>
      {data.map((item) => {
        return (
          <li key={item.templateId} className={styles.func_link_item}>
            <Link
              href={`${NOVITA_URL.LANDING_PAGE_TEMPLATES}/${item.slug}`}
              className={`${styles.func_link} flex flex-row justify-start items-center text-base`}
            >
              {item.logo && (
                <Image
                  src={item.logo}
                  alt={item.modelName}
                  width={32}
                  height={32}
                  className="mr-4"
                />
              )}
              <span className={styles.func_text}>{item.modelName}</span>
              <span
                className={`${styles.func_right_icon} iconfont icon-right text-xs ml-auto`}
              ></span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
