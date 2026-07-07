"use client";
import Link from "next/link";
import Code from "./Code";
import styles from "./UsageExample.module.scss";
import { Button } from "@/components/ui/button";
import { DOCS_URL } from "@/constants/urls";
import Clock from "@/lib/icons/Clock";
import Safari from "@/lib/icons/Safari";
import Chart from "@/lib/icons/Chart";
import { useI18nSubscription } from "@/i18n/provider";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getData() {
  return [
    {
      title: "Low latency",
      desc: "Can generate speech in <300ms.",
      img: <Clock color={"var(--black)"} />,
    },
    {
      title: "Ease of use",
      desc: "Novita AI brings the most compelling, rich and hyper-realistic voices to developers in just a few lines of code.",
      img: <Safari color={"var(--black)"} />,
    },
    {
      title: "Discord Community",
      desc: "Get all the help you need through our expert community.",
      img: <Chart color={"var(--black)"} />,
    },
  ];
}

export default function UsageExample() {
  useI18nSubscription();
  const data = getData();
  return (
    <div className={styles.page_wrap}>
      <div className={`max_width_container`}>
        <div className={`${styles.content} px-web`}>
          <div className={styles.info}>
            <h3 className="font-h3 text-[var(--dark-1)]">
              How to use text to speech API
            </h3>
            <div className="font-body text-[var(--dark-1)]">
              From character voicing and audiobook narration to educational
              tools and interactive experiences, the Novita AI Voice Library
              offers a wide selection of voices tailored to your specific needs.
            </div>
            <ul className="flex flex-col items-stretch gap-[8px]">
              {data.map((one) => (
                <li key={one.title} className={styles.item}>
                  <div className="font-h6">{one.title}</div>
                  <div className="font-body">{one.desc}</div>
                </li>
              ))}
            </ul>
            <Button style={{ width: 234 }} asChild>
              <Link href={DOCS_URL.TXT2SPEECH} target="_blank">
                <span>Explore Documentation</span>
              </Link>
            </Button>
          </div>
          <div className={styles.code_wrap}>
            <Code />
          </div>
        </div>
      </div>
    </div>
  );
}
