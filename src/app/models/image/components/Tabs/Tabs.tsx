import { CSSProperties, useEffect, useState, useRef } from "react";
import styles from "./Tabs.module.scss";

type TabsProps = {
  options: { label: string; key: string; disabled?: boolean }[];
  curOption: string;
  onTabSelect: (val: string) => void;
  style?: CSSProperties;
};

export default function Tabs(props: TabsProps) {
  const [showAll, setShowAll] = useState(false);
  const [showExpand, setShowExpand] = useState(false);

  const tabContentRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabContentRef.current && tabRef.current) {
      if (tabContentRef.current.clientWidth > tabRef.current.clientWidth) {
        setShowExpand(true);
      }
    }
  }, [props.options]);

  return (
    <div
      ref={tabRef}
      className={`${styles.tabs} ${showAll ? styles.tabs_showall : ""}`}
    >
      <div
        ref={tabContentRef}
        style={props.style}
        className={`${styles.tabs_container} ${
          showExpand ? styles.tabs_container_showexpand : ""
        } ${showAll ? styles.tabs_container_showall : ""}`}
      >
        {props.options.map((item) => (
          <div
            className={`${styles.item} ${
              item.key === props.curOption ? styles.item_active : ""
            } ${item.disabled ? styles.item_disabled : ""}`}
            title={item.disabled ? "Coming soon" : ""}
            key={item.key}
            onClick={() => {
              if (item.disabled === true) {
                return;
              }
              setShowAll(false);
              props.onTabSelect(item.key);
            }}
          >
            {item.label}
          </div>
        ))}
        {showAll && (
          <div
            className={`${styles.item} ${styles.showall_btn}`}
            onClick={() => setShowAll(false)}
          >
            Hide
          </div>
        )}
      </div>
      {showExpand && !showAll && (
        <div
          className={`${styles.item} ${styles.showall_btn}`}
          onClick={() => setShowAll(true)}
        >
          More...
        </div>
      )}
    </div>
  );
}
