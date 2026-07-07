import Footer from "@/app/components/footer/Footer";
import Header from "@/app/components/header/Header";
import styles from "./page.module.css";
import PrivateModel from "../components/privateModel/privateModel";
import { Suspense } from "react";
export default function ModelUpload() {
  return (
    <div className={styles.page_container}>
      <h1 className={styles.c_title}>
        {"Welcome to Novita AI model upload page"}
      </h1>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <div className="page_wrap">
        <div className={styles.title}>{"Manage your private models"}</div>
        <Suspense fallback={null}>
          <PrivateModel />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
