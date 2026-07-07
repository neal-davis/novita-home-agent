"use client";

import styles from "./QAndA.module.css";
import { useI18nSubscription } from "@/i18n/provider";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getData() {
  return [
    {
      title: "WHAT IS A TTS API?",
      content:
        "A TTS API, or Text-to-Speech Application Programming Interface, is a software interface that allows developers to integrate text-to-speech functionality into their applications, websites, or services.",
    },
    {
      title: "WHAT ARE THE ADVANTAGES OF USING TEXT TO SPEECH?",
      content:
        "There are numerous advantages to using Text to Speech technology for creating voiceovers to use in chatbots ,videos, presentations, audiobooks, etc. AI Text to Speech sounds incredibly realistic and can provide an engaging listening experience. The time it takes to synthesize text into speech is almost instantaneous.",
    },
  ];
}

export default function QAndA() {
  useI18nSubscription();
  const data = getData();
  return (
    <div className={styles.page_container}>
      <h2 className={"font-h3 text-center mb-[56px]"}>Question and Answer</h2>
      <div className={styles.list}>
        {data.map((one) => (
          <div key={one.title} className={styles.item}>
            <div className="font-h4">{one.title}</div>
            <div
              className="font-body"
              dangerouslySetInnerHTML={{
                __html: one.content,
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
