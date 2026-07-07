import React from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import { vs } from "react-syntax-highlighter/dist/cjs/styles/prism";
import CopyBtn from "./code-copy-btn";
import styles from "./md-docs.module.scss";

interface MDDocsProps {
  content: string;
  className?: string;
}

export default function MDDocs({ content, className }: MDDocsProps) {
  return (
    <Markdown
      className={`${styles.md_docs} ${className}`}
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }: any) {
          if (!children && children !== 0) return null;

          const match = /language-(\w+)/.exec(className || "");
          const inline =
            typeof children.indexOf === "function"
              ? children.indexOf("\n") === -1
              : true;
          return !inline || match ? (
            <div className={styles.code_box}>
              <SyntaxHighlighter
                showLineNumbers={true}
                style={vs}
                language={match?.[1]?.toLowerCase() || "bash"}
                PreTag="div"
                codeTagProps={{
                  className: "!tt-mono",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
              <CopyBtn
                className={styles.copy_btn}
                content={String(children).replace(/\n$/, "")}
              />
            </div>
          ) : (
            <code className={`${className} ${styles.inline_code}`} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}
