import { CSSProperties } from "react";
import styles from "./index.module.scss";

export default function GrayBoxList({
  data,
  cols = 3,
  noMobile = false,
  className,
  listStyles,
  itemStyles,
}: {
  data: { title: string; desc: string }[];
  cols?: number;
  noMobile?: boolean;
  className?: string;
  listStyles?: CSSProperties;
  itemStyles?: CSSProperties;
}) {
  return (
    <ul
      className={`grid ${
        noMobile ? `grid-cols-${cols}` : `grid-cols-1 md:grid-cols-${cols}`
      } gap-x-[24px] gap-y-[20px] ${className}`}
      style={listStyles}
    >
      {data.map((one, index) => (
        <li
          key={one.title}
          className={`${styles.li} relative flex flex-col`}
          style={itemStyles}
        >
          <span className={`text-primary font-h5 mb-8 ${styles.li_index}`}>
            {(index + 1).toString().padStart(2, "0")}
          </span>
          <div className="font-h5 mb-4">{one.title.toUpperCase()}</div>
          <div className="font-subtle">{one.desc}</div>
        </li>
      ))}
    </ul>
  );
}
