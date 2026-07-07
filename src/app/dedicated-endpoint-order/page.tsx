import Header from "@/app/components/header/Header";
import styles from "./page.module.scss";
import OrderInfo from "./components/OrderInfo";

export default function Page() {
  return (
    <div className={styles.page_container}>
      <Header position="relative" page="console" />
      <div className="max_width_container pt-[50px]">
        <div className="mx-web">
          <h1 className={styles.title}>
            Confirm Your <br /> Dedicated Endpoint Order
          </h1>
          <OrderInfo />
        </div>
      </div>
    </div>
  );
}
