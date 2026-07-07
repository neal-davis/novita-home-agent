import { useEffect, useRef, useState, useMemo, CSSProperties } from "react";
import Link from "next/link";
import { FuncConstants } from "@/app/models/constants/funcs";
import styles from "./DemoWrapper.module.scss";

type DemoWrapperProps = {
  rootPage: "product" | "playground";
  funcInfo: FuncConstants;
  withTabs?: boolean;
  formContent: React.ReactNode;
  formHead?: React.ReactNode;
  formFoot?: React.ReactNode;
  resultContent: React.ReactNode;
  formWidth?: number;
  formHeightInProduct?: number;
  resultContentNoPadding?: boolean;
  hasStartedGenerate?: boolean;
  taskId?: string;
  wrapperClassName?: string;
  formClassName?: string;
  resultClassName?: string;
};

export default function DemoWrapper({
  rootPage,
  withTabs,
  funcInfo,
  formContent,
  formHead,
  formFoot,
  resultContent,
  formWidth,
  formHeightInProduct,
  resultContentNoPadding,
  wrapperClassName,
  formClassName,
  resultClassName,
}: DemoWrapperProps) {
  const [small, setSmall] = useState(false);
  const resultWrapper = useRef<HTMLDivElement>(null);

  const resultContentStyle: CSSProperties = useMemo(() => {
    if (resultContentNoPadding) {
      return { padding: 0 };
    }
    return {};
  }, [resultContentNoPadding]);

  useEffect(() => {
    if (resultWrapper.current) {
      const rObserver = new ResizeObserver(() => {
        if (!resultWrapper.current) {
          return;
        }
        if (resultWrapper.current.clientWidth < 750) {
          setSmall(true);
        } else {
          setSmall(false);
        }
      });
      rObserver.observe(resultWrapper.current);
      return () => {
        rObserver.disconnect();
      };
    }
  }, []);

  return (
    <div
      className={`${styles.demo_wrapper} ${
        rootPage === "product"
          ? styles.demo_in_product
          : styles.demo_in_playground
      } ${wrapperClassName}`}
    >
      <div
        className={`${styles.demo_form_wrapper} ${formClassName} ${
          withTabs ? styles.with_tabs : ""
        } ${formWidth ? styles.with_fixed_width : ""}`}
        style={formWidth ? { flexBasis: formWidth } : {}}
      >
        <div className={`${styles.demo_form_content} scrollBar_container`}>
          {rootPage === "playground" && funcInfo.getStartedUrl && (
            <div className={styles.start_link}>
              <Link target="_blank" href={funcInfo.getStartedUrl}>
                {`Integrate "${funcInfo.displayName}" API to your product>>`}
              </Link>
            </div>
          )}
          {formHead && <div className={styles.demo_form_head}>{formHead}</div>}
          <div
            className={`${styles.demo_form_body} scrollBar_container`}
            style={
              formHeightInProduct && rootPage === "product"
                ? { maxHeight: formHeightInProduct, overflowY: "auto" }
                : {}
            }
          >
            {formContent}
          </div>
          {formFoot && <div className={styles.demo_form_foot}>{formFoot}</div>}
        </div>
      </div>
      <div
        ref={resultWrapper}
        className={`${styles.demo_result_wrapper} ${
          small ? styles.result_small : ""
        } ${resultClassName} scrollBar_container`}
        style={resultContentStyle}
      >
        {resultContent}
      </div>
    </div>
  );
}
