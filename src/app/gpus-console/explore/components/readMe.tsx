"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "./readMe.module.scss";
import { Button } from "@/components/ui/button";

const ScrollableMdEditor = dynamic(
  () => import("md-editor-rt").then((mod) => mod.MdEditor),
  { ssr: false },
);

export default function ReadMe({
  finishForm,
  readMe,
}: {
  finishForm: any;
  readMe: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const editorId = useRef(`readme-editor-${Date.now()}`).current;

  useEffect(() => {
    const setupPreviewWrapper = () => {
      const editorElement = editorRef.current;
      if (!editorElement) {
        requestAnimationFrame(setupPreviewWrapper);
        return;
      }

      const previewWrapper = editorElement.querySelector(
        ".md-editor-preview-wrapper",
      ) as HTMLElement;

      if (!previewWrapper) {
        requestAnimationFrame(setupPreviewWrapper);
        return;
      }

      previewWrapper.style.setProperty("overflow-y", "visible", "important");
      previewWrapper.style.setProperty("overflow-x", "visible", "important");
      previewWrapper.style.setProperty("height", "auto", "important");
      previewWrapper.style.setProperty("max-height", "none", "important");
      previewWrapper.style.setProperty("position", "relative", "important");

      const preview = previewWrapper.querySelector(
        ".md-editor-preview",
      ) as HTMLElement;
      if (preview) {
        preview.style.setProperty("height", "auto", "important");
        preview.style.setProperty("min-height", "auto", "important");
        preview.style.setProperty("overflow", "visible", "important");
      }
    };

    setupPreviewWrapper();
  }, [readMe]);

  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "71px",
          borderBottom: "1px solid var(--gray-2)",
          width: "100%",
          height: "1px",
        }}
      ></div>
      <div className={styles.section}>
        <h1 className={styles.title}>README</h1>
        <div>
          <div
            ref={editorRef}
            className={styles.editorWrapper}
            style={{
              marginTop: "41px",
              height: "200px",
              maxWidth: "940px",
              padding: "6.5px 8px",
              borderRadius: "10px",
              position: "relative",
            }}
          >
            <div
              ref={scrollContainerRef}
              style={{
                height: "200px",
                overflowY: "auto",
                overflowX: "auto",
                borderRadius: "var(--radius-input)",
              }}
            >
              <ScrollableMdEditor
                {...{
                  key: editorId,
                  editorId: editorId,
                  noIconfont: true,
                  noUploadImg: true,
                  toolbars: [],
                  footers: [],
                  inputBoxWitdh: "0",
                  style: {
                    float: "left",
                    height: "auto",
                    minHeight: "200px",
                    borderRadius: "var(--radius-input)",
                  },
                  modelValue: readMe,
                  htmlPreview: true,
                }}
              ></ScrollableMdEditor>
            </div>
          </div>
          <div
            style={{
              marginTop: "32px",
              marginBottom: "32px",
              paddingRight: "8px",
            }}
          >
            <Button
              onClick={() => finishForm()}
              className={styles.closeBtn}
              variant="default"
            >
              <span className={styles.closeBtnText}>{"Close"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
