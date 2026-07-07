"use client";

import Markdown from "react-markdown";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import styles from "./page.module.scss";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { useState } from "react";
import DataEmpty from "@/app/gpus-console/components/DataEmpty";
// import { FileText } from "lucide-react";

export function DetailsTab({ templateInfo }: { templateInfo: any }) {
  const [activeTab, setActiveTab] = useState("README");
  return (
    <div className={styles.detailsContainer}>
      <div className={styles.titleTab}>
        {(templateInfo.image
          ? [
              {
                title: "README",
                iconName: "README",
              },
              {
                title: "Configuration",
                iconName: "Configuration",
              },
            ]
          : [
              {
                title: "README",
                iconName: "README",
              },
            ]
        ).map((item, index) => (
          <div
            onClick={() => {
              setActiveTab(item.iconName);
            }}
            className={`${styles.tabItem} ${
              activeTab === item.iconName ? styles.active : styles.notActive
            }`}
            key={index}
          >
            <span
              className={
                activeTab === item.iconName
                  ? styles.tabTitleActive
                  : styles.tabTitle
              }
            >
              {item.title}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 px-8 py-6 border-[1px] border-[var(--gray-2)] rounded-[12px]">
        {activeTab === "README" ? (
          templateInfo.readme ? (
            <div className={styles.readmeContent}>
              <Markdown
                components={{
                  code({ className, children = "", ...props }: any) {
                    if (!children && children !== 0) return null;

                    const match = /language-(\w+)/.exec(className || "");
                    const inline =
                      typeof children.indexOf === "function"
                        ? children.indexOf("\n") === -1
                        : true;
                    return !inline || match ? (
                      <SyntaxHighlighter
                        showLineNumbers={true}
                        style={vscDarkPlus}
                        language={match?.[1] || "bash"}
                        PreTag="div"
                        codeTagProps={{
                          className: "!tt-mono",
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={`${className} ${styles.inline_code}`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {templateInfo.readme}
              </Markdown>
            </div>
          ) : (
            <DataEmpty
              title="No results found"
              description="Updates coming soon! Try exploring for something else"
            />
          )
        ) : (
          <div className="flex flex-col gap-4">
            <div className="font-h6 text-[var(--dark-1)]">
              Configuration information
            </div>
            <div className="font-subtle-medium text-[var(--dark-1)]">
              Container Image : {templateInfo.image}
            </div>
            <div className="font-subtle-medium text-[var(--dark-1)]">
              Container Start Command : {templateInfo.startCommand}
            </div>
            <div className="font-subtle-medium text-[var(--dark-1)]">
              Container Entrypoint : {templateInfo.entrypoint}
            </div>
            <div className="font-subtle-medium text-[var(--dark-1)]">
              Container Disk : {templateInfo.rootfsSize}GB
            </div>
            <div className="font-subtle-medium text-[var(--dark-1)]">
              <div>
                Local Mount :{" "}
                {templateInfo?.volumes?.find(
                  (item: any) => item.type === "local",
                )
                  ? "Yes"
                  : "No"}
              </div>
              {templateInfo?.volumes?.find(
                (item: any) => item.type === "local",
              ) && (
                <div className="ml-2 mt-3">
                  <div className="flex font-subtle text-[var(--dark-1)] mb-[10px]">
                    <span className="mr-1 text-[24px]">·</span> Volume Disk :
                    {templateInfo?.volumes?.find(
                      (item: any) => item.type === "local",
                    )?.size || "\\"}
                    GB
                  </div>
                  <div className="flex font-subtle text-[var(--dark-1)]">
                    <span className="mr-1 text-[24px]">·</span> Volume Mount
                    Path :
                    {templateInfo?.volumes?.find(
                      (item: any) => item.type === "local",
                    )?.mountPath || "\\"}
                  </div>
                </div>
              )}
            </div>
            <div className="font-subtle-medium text-[var(--dark-1)]">
              Expose HTTP Ports :{" "}
              {templateInfo?.ports
                ?.find((item: any) => item.type === "http")
                ?.ports?.join(",") || "\\"}
            </div>
            <div className="font-subtle-medium text-[var(--dark-1)]">
              Expose TCP Ports :{" "}
              {templateInfo?.ports
                ?.find((item: any) => item.type === "tcp")
                ?.ports?.join(",") || "\\"}
            </div>
            <div className="font-subtle-medium text-[var(--dark-1)]">
              <div className="mb-2">Environment Variables：</div>
              <div>
                <Table
                  className="border border-solid border-[var(--border)]]"
                  style={{
                    minHeight: "none",
                    minWidth: "200px",
                    maxWidth: "800px",
                  }}
                >
                  <TableHeader>
                    <TableRow>
                      <TableCell
                        className="font-subtle text-center px-12 border-r border-solid border-[var(--border)]"
                        style={{ color: "var(--dark-1)" }}
                      >
                        {"Key"}
                      </TableCell>
                      <TableCell
                        className="font-subtle text-center px-12"
                        style={{ color: "var(--dark-1)" }}
                      >
                        {"Value"}
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(templateInfo?.envs || []).map(
                      (item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell
                            className="font-subtle text-left border-r border-solid border-[var(--border)]"
                            style={{ color: "var(--dark-1)" }}
                          >
                            {item.key}
                          </TableCell>
                          <TableCell
                            className="font-subtle text-left p-2"
                            style={{ color: "var(--dark-1)" }}
                          >
                            {item.value}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
