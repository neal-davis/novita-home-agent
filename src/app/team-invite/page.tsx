import Main from "./components/Main";
import { Logo } from "@/app/components/header/partials/Logo";
import styles from "./page.module.scss";

export default function Page() {
  return (
    <div className={styles.container}>
      <Logo />
      <div className={`${styles.page_main}`}>
        <Main />
      </div>
    </div>
  );
}
