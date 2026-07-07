"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";

interface InterProps {
  updateOutputStatus?: () => void;
  codeContent: any;
  codeType: string;
}

const lineList = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
];
export const ServerCodeAnimation = ({
  updateOutputStatus,
  codeContent,
  codeType,
}: InterProps) => {
  const textRef = useRef<any>();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeId = setTimeout(() => {
      if (index >= codeContent.length) {
        updateOutputStatus && updateOutputStatus();
        clearTimeout(timeId);
      } else {
        textRef.current.innerHTML += `<span class="${styles[codeContent[index].cssName]}">${codeContent[index].text}</span>`;
        setIndex(index + 1);
      }
    }, 100);

    return () => {
      clearTimeout(timeId);
    };
  }, [codeContent, index, updateOutputStatus]);
  useEffect(() => {
    textRef.current.innerHTML = "";
    setIndex(0);
  }, [codeType]);

  return (
    <pre className={styles.serverCodeWrap}>
      <div className={styles.lineWrap}>
        {lineList.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      <div className={`${styles.outputCode}`} ref={textRef}></div>
    </pre>
  );
};
const output = [
  {
    line: "01",
    text: "{",
  },
  {
    line: "02",
    cssName: "kongGe",
    text: '"instances": [{',
  },
  {
    line: "03",
    cssName: "kongG2",
    text: '"id": "12948885700ef8e3",',
  },
  {
    line: "04",
    cssName: "kongG2",
    text: '"memory": "63",',
  },
  {
    line: "05",
    cssName: "kongG2",
    text: '"gpuNum": "1",',
  },
  {
    line: "06",
    cssName: "kongG2",
    text: '"productId": "1",',
  },
  {
    line: "07",
    cssName: "kongG2",
    text: '"productName": "RTX 4090 24GB",',
  },
  {
    line: "08",
    cssName: "kongG2",
    text: '"instancePrice": "35000",',
  },
  {
    line: "09",
    cssName: "kongGe",
    text: "}]",
  },
  {
    line: "10",
    cssName: "kongGe",
    text: '"total": "1",',
  },
  {
    line: "11",
    text: "}",
  },
];
export const OutputCodeAnimation = () => {
  return (
    <div className={`${styles.outputWrap}`}>
      <div className={styles.outputHeader}>
        <div className={styles.header1}>
          <span>Body</span>
        </div>
        <div className={styles.header2}>
          <div>
            Status: <span className={styles.headerNum}>200 OK</span>
          </div>
          <div>
            Time: <span className={styles.headerNum}>160 ms</span>
          </div>
          <div>
            Size: <span className={styles.headerNum}>2 KB</span>
          </div>
        </div>
      </div>
      <pre style={{ padding: "24px", overflow: "hidden" }}>
        {output.map((o) => (
          <div key={o.line} className={styles.putWrap}>
            <span className={styles.outLine}>{o.line}</span>
            <span className={`${o.cssName ? styles[o.cssName] : ""}`}>
              {o.text}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
};
