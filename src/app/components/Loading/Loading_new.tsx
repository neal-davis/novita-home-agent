import { CSSProperties } from "react";
import { Loader2 } from "lucide-react";
import styles from "./Loading_new.module.scss";

export default function Loading({
  text,
  desc,
  extra,
  style,
}: {
  text?: string;
  desc?: string;
  extra?: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={styles.loading_wrapper} style={style}>
      <div style={{ textAlign: "center" }}>
        <Loader2 className="h-10 w-10 animate-spin" />
        {text && (
          <p
            style={{
              marginTop: 20,
              fontWeight: "bold",
            }}
          >
            {text}
          </p>
        )}
        {desc && (
          <p
            style={{
              marginTop: 10,
            }}
          >
            {desc}
          </p>
        )}
        {extra}
      </div>
    </div>
  );
}
