import Link from "next/link";
import { Button, ButtonArrow } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./Recommend.module.scss";
export default function Recommend({
  copy,
  data,
}: {
  copy?: unknown;
  data: LangdingPageTemplateSchema[];
}) {
  return (
    <div className={`${styles.wrap} max_width_container`}>
      <div className="px-web">
        <h2 className={styles.title}>{"Other Recommended Templates"}</h2>
        <div
          className={`flex flex-row justify-center flex-wrap ${styles.card_wrap}`}
        >
          {data.map((item, index) => {
            return (
              <div
                key={index}
                className={`${styles.card} flex flex-col justify-between gap-6`}
              >
                <div>
                  <h3>{item.modelName}</h3>
                  <p>{item.slogan}</p>
                </div>
                <div>
                  <Button asChild variant="outline" className={styles.more_btn}>
                    <Link
                      href={`${NOVITA_URL.LANDING_PAGE_TEMPLATES}/${item.slug}`}
                    >
                      {"View more"}
                      <ButtonArrow />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
