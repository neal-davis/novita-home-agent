import { useEffect, useRef, useState } from "react";
import styles from "../index.module.scss";

interface InterProps {
  updateOutputStatus?: () => void;
  codeContent: any;
  codeType: string;
}

const lineList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
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
    line: "1",
    text: "{",
  },
  {
    line: "2",
    cssName: "kongGe",
    text: '"instances": [{',
  },
  {
    line: "3",
    cssName: "kongG2",
    text: '"id": "12948885700ef8e3",',
  },
  {
    line: "4",
    cssName: "kongG2",
    text: '"memory": "63",',
  },
  {
    line: "5",
    cssName: "kongG2",
    text: '"gpuNum": "1",',
  },
  {
    line: "6",
    cssName: "kongG2",
    text: '"productId": "1",',
  },
  {
    line: "7",
    cssName: "kongG2",
    text: '"productName": "RTX 4090 24GB",',
  },
  {
    line: "8",
    cssName: "kongG2",
    text: '"instancePrice": "269100",',
  },
  {
    line: "9",
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
    <div className={`${styles.outputWrap} ${styles.thinFont}`}>
      <div className={styles.outputHeader}>
        <div className={styles.header1}>
          <span style={{ borderBottom: "1px solid var(--yellow-5)" }}>
            Body
          </span>
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
      <pre style={{ padding: "14px 0 0 0", overflow: "auto" }}>
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
