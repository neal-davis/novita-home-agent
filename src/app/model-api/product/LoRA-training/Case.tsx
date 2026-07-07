"use client";

import commonStyle from "../style.module.scss";
import styles from "./Case.module.css";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try LoRA Training API</h2>
     <div className={`font-p text-center`}>
        Try LoRA training API in{" "}
        <a
          target="_blank"
          href={
            "https://colab.research.google.com/drive/1j_ii9TN67nuauvc3PiauwZnC2lT62tGF?usp=sharing"
          }
          style={{ textDecoration: "underline" }}
        >
          <strong>colab</strong>
        </a>
        . Join our{" "}
        <a
          target="_blank"
          href={"https://discord.com/invite/Fn3peMYMQf"}
          style={{ textDecoration: "underline" }}
        >
          <strong>discord server</strong>
        </a>{" "}
        to learn more.
      </div>
      <div className={commonStyle.demo_wrapper}>
        <div
          className={`${styles.demo_wrapper} ${styles.demo_in_product} scrollBar_container`}
        >
          <img
            className={styles.example_img}
            src={"/training/example1.png"}
            loading="lazy"
            alt="training"
          />
          <img
            className={styles.example_img}
            src={"/training/example2.png"}
            loading="lazy"
            alt="training"
          />
          <img
            className={styles.example_img}
            src={"/training/example3.png"}
            loading="lazy"
            alt="training"
          />
        </div>
      </div>
    </div>
  );
}
