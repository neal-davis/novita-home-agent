import Button from "@/app/components/button/Button";
import styles from "./NotFound.module.css";

export default function ModelNotFound({ version_id }: { version_id: number }) {
  console.log("model not found", version_id);
  return (
    <div>
      <div className={styles.title}>
        <div className={styles.text}>Model Not Found</div>
        <div className={styles.notfound}></div>
        <Button renderTag="link" link="/model">
          View Model List
        </Button>
      </div>
    </div>
  );
}
