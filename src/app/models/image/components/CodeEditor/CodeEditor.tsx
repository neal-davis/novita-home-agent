"use client";
import { useContext, useState, useMemo, useEffect } from "react";
import { message } from "@/components/ui/standard/notify";
import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { ChevronLeft as LeftOutlined } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { KeyContext } from "../../../lib/context";
import Tabs from "../Tabs/Tabs";
import { genSampleCode } from "../../sample-codes/code";
import styles from "./CodeEditor.module.scss";
import { ChevronRight, Copy } from "lucide-react";
export default function CodeEditor() {
  const { params, activeCodeLine, codeType, setCodeType, allFuncs, func } =
    useContext(KeyContext);
  const [code, setCode] = useState("");
  const [nocode, setNocode] = useState(true);
  const [tabs, setTabs] = useState<
    {
      label: string;
      key: string;
    }[]
  >([]);
  const [showEditor, setShowEditor] = useState(false);
  useMemo(() => {
    const curFunc = allFuncs.find((f) => f.info.name === func);
    if (curFunc) {
      const curSample = curFunc.sampleCode?.find((c) => c.lang === codeType);
      if (curSample) {
        const codeSample = genSampleCode(
          curSample.code,
          curSample.lang,
          params,
        );
        setNocode(false);
        setCode(codeSample);
      } else {
        setNocode(true);
        setCode("");
      }
    }
  }, [func, allFuncs, codeType, params]);
  useEffect(() => {
    const curFunc = allFuncs.find((f) => f.info.name === func);
    if (!curFunc || !curFunc.sampleCode) {
      setTabs([]);
      return;
    }
    const tabs = curFunc.sampleCode
      .filter((c) => {
        return c.code !== "";
      })
      .map((c) => ({
        label: `${c.lang[0].toUpperCase()}${c.lang.slice(1)}`,
        key: c.lang,
      }));
    setTabs(tabs);
    const availableCodeTypes: string[] = tabs.map((item) => item.key);
    if (!availableCodeTypes.includes(codeType)) {
      setCodeType(availableCodeTypes[0]);
    }
  }, [allFuncs, func, codeType, setCodeType]);
  const highlightLine = (
    lineNumber: number,
    markLines: number[],
    color: string = "#e7ad1c7e",
  ): React.HTMLProps<HTMLElement> => {
    // only works when showLineNumbers and wrapLines are both enabled
    const style: React.CSSProperties = {
      display: "block",
      width: "fit-content",
    };
    if (markLines.includes(lineNumber)) {
      style.backgroundColor = color;
    }
    return { style };
  };
  return (
    <>
      {!showEditor && !nocode && (
        <Button
          // ghost
          className={`${styles.editor_show_trigger}`}
          onClick={() => setShowEditor(true)}
          icon={<LeftOutlined />}
        >
          <span>{"Sample code"}</span>
        </Button>
      )}
      <div
        style={{ display: !showEditor || nocode ? "none" : "flex" }}
        className={`${styles.editor_wrap} scrollBar_container`}
      >
        {nocode && (
          <div className={styles.unavailable}>{"Code not available"}</div>
        )}
        {!nocode && (
          <>
            <div className={styles.editor_opt}>
              <div
                className={`${styles.editor_hide_trigger}`}
                onClick={() => setShowEditor(false)}
              >
                <ChevronRight size={20} />
              </div>
              <Tabs
                options={tabs}
                curOption={codeType}
                onTabSelect={(val) => {
                  setCodeType(val);
                }}
              />
              <div>
                <CopyToClipboard
                  text={code}
                  onCopy={() => {
                    message.success("Copied success");
                  }}
                >
                  <Copy
                    className="mr-2 cursor-pointer hover:text-[var(--brand-0)]"
                    size={14}
                  />
                </CopyToClipboard>
              </div>
            </div>
            <div
              className={`${styles.markdown_container} font-subtle scrollBar_container`}
            >
              <SyntaxHighlighter
                language={codeType}
                style={vs}
                codeTagProps={{
                  className: "!tt-mono",
                }}
                showLineNumbers
                wrapLines={true}
                lineProps={(line: number) =>
                  highlightLine(line, activeCodeLine)
                }
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </>
        )}
      </div>
    </>
  );
}
