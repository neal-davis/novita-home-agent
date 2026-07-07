import Link from "next/link";
import styles from "./Footer.module.scss";

export default function SocialIcon({
  name,
  url,
  id,
}: {
  name: string;
  url: string;
  id?: string;
}) {
  return (
    <Link id={id} href={url} className={styles.social_icon} target="_blank">
      <span className={`iconfont icon-${name} text-[23px]`}></span>
    </Link>
  );
}
