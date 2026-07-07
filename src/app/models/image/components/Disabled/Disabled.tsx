import Link from "next/link";
import styles from "./Disabled.module.css";
import baseStyles from "../base.module.css";
import mainStyles from "../Main/Main.module.css";
import { FuncConstants } from "@/app/models/constants/funcs";

export default function Disabled(props: { func?: FuncConstants }) {
  return (
    <div className={styles.disabled_wrapper}>
      {props.func?.getStartedUrl && (
        <div className={`${baseStyles.start_link} ${mainStyles.start_link}`}>
          <Link target="_blank" href={props.func.getStartedUrl}>
            Integrate {props.func.displayName} API to your product{` >>`}
          </Link>
        </div>
      )}
      <div className={styles.disabled_content}>
        <img src={"/playground/developing.png"} alt="developing" />
        <p>
          The <strong>{props.func?.displayName}</strong> case is still under
          development, please stay tuned.
        </p>
      </div>
    </div>
  );
}
