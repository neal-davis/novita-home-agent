import { useContext, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { KeyContext } from "../../../lib/context";
import styles from "./Nav.module.css";
import {
  FUNC_TYPE,
  FUNC_TYPE_NAME,
  FuncConstants,
} from "@/app/models/constants/funcs";
import { funcFilter } from "@/app/models/lib/funcs";

export default function Nav({ selected }: { selected?: string }) {
  const { allFuncs, setFunc } = useContext(KeyContext);
  const navContentRef = useRef<HTMLDivElement>(null);

  const navFuncs = useMemo(() => {
    const funcs: { name: string; funcs: FuncConstants[] }[] = [];
    const funcTypes = Object.values(FUNC_TYPE).filter(
      (t) => t !== FUNC_TYPE.TRAINING && t !== FUNC_TYPE.IMG,
    );
    funcTypes.forEach((t) => {
      const fs = Object.values(allFuncs).filter(
        (f) => funcFilter(f.info, "playground") && f.info.type === t,
      );
      if (fs.length > 0) {
        funcs.push({
          name: FUNC_TYPE_NAME[t],
          funcs: fs.map((f) => f.info),
        });
      }
    });
    return funcs;
  }, [allFuncs]);

  useEffect(() => {
    if (!navContentRef.current || !selected) {
      return;
    }
    const selectedEl: HTMLAnchorElement | null =
      navContentRef.current.querySelector(
        `.nav_item_${selected.replace(/\./g, "_")}`,
      );
    if (!selectedEl) {
      return;
    }
    const elTop = selectedEl.offsetTop;
    if (
      elTop - navContentRef.current.scrollTop > 0 &&
      elTop - navContentRef.current.scrollTop <
        navContentRef.current.offsetHeight
    ) {
      return;
    }
    navContentRef.current.scrollTo({
      top: elTop - 104, // 第一个元素的 offsetTop 不是 0？？？
      behavior: "instant",
    });
  }, [selected]);

  return (
    <nav className={styles.playground_nav}>
      <div ref={navContentRef} className={styles.nav_content}>
        {navFuncs.map((funcGroup) => {
          return funcGroup.funcs.map((func) => (
            <a
              key={func.name}
              href={`#${func.name}`}
              className={`${styles.nav_item} ${`nav_item_${func.name.replace(
                /\./g,
                "_",
              )}`} ${selected === func.name ? styles.selected : ""}`}
              onClick={() => {
                setFunc(func.name);
              }}
            >
              <div className={styles.nav_icon}>
                <Image
                  src={`/playground/api-icon_${func.name}.png`}
                  width={23}
                  height={23}
                  alt=""
                />
              </div>
              <span className={styles.nav_label}>{func.name}</span>
            </a>
          ));
        })}
      </div>
    </nav>
  );
}
