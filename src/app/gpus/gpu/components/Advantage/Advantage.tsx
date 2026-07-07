import styles from "./Advantage.module.scss";
import GrayBoxList from "@/app/components/pageComponents/GrayBoxList";
import { type GpuLandingPageContent } from "../gpuLandingPageData";

export default function FirstPage({
  content,
}: {
  content: GpuLandingPageContent;
}) {
  const advantages = content.advantage.items.map((item) => ({
    title: item.title,
    desc: item.description,
  }));

  return (
    <div className={`max_width_container ${styles.container}`}>
      <div className="px-web">
        <h2 className={styles.title}>{content.advantage.title}</h2>
        <p className={styles.desc}>{content.advantage.description}</p>
        <div className={styles.content}>
          <GrayBoxList cols={2} data={advantages} />
        </div>
      </div>
    </div>
  );
}
