"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
// import ReactScrollToShowCb from "react-scroll-to-show-cb";
import React from "react";
import { requestText } from "@/api/api";

const MAX_DISPLAY_LOG_LINES = 1000;
/** When buffer grows this large, flush synchronously (rAF can be throttled in background tabs). */
const MESSAGE_BUFFER_SOFT_MAX = 5000;

/**
 * Append `batch` to `prev` and keep at most `maxLines` newest entries.
 * Updates `displayLineStartRef` when lines are dropped from the head (for line numbers).
 * Avoids allocating `[...prev, ...batch]` when the combined length far exceeds `maxLines`.
 */
function appendAndTrimLogLines(
  prev: string[],
  batch: string[],
  maxLines: number,
  displayLineStartRef: { current: number },
): string[] {
  const pl = prev.length;
  const bl = batch.length;
  if (bl === 0) {
    return prev;
  }
  const total = pl + bl;
  if (total <= maxLines) {
    return pl ? [...prev, ...batch] : batch.slice();
  }
  const excess = total - maxLines;
  displayLineStartRef.current += excess;
  if (bl >= maxLines) {
    return batch.slice(bl - maxLines);
  }
  const fromPrev = maxLines - bl;
  return [...prev.slice(Math.max(0, pl - fromPrev)), ...batch];
}

export default React.memo(function InstanceLog({
  outHeight,
  address,
  downloadableLog = true,
  tailCount = 200,
}: {
  outHeight?: any;
  address: string;
  downloadableLog?: boolean;
  tailCount?: number;
}) {
  const [logInfos, setLogInfos] = useState<string[]>([]);
  const scrollShowRef = useRef<HTMLDivElement | null>(null);
  const isAutoScroll = useRef(true);
  const autoScrolling = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 1-based line number of `logInfos[0]` in the full stream (for display only). */
  const displayLineStartRef = useRef(1);

  const buildSSEUrl = useCallback(() => {
    const url =
      address.indexOf("?") < 0
        ? address + `?follow=1&sse=1&timestamps=1&tail=${tailCount}`
        : address + `&follow=1&sse=1&timestamps=1&tail=${tailCount}`;
    return url;
  }, [address, tailCount]);

  useEffect(() => {
    if (!address) {
      return;
    }

    setLogInfos([]);
    displayLineStartRef.current = 1;
    isAutoScroll.current = true;
    let hasOpened = false;
    let isDisposed = false;
    const messageBuffer: string[] = [];
    let flushRafId: number | null = null;
    let scrollTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearScrollTimeout = () => {
      if (scrollTimeoutId == null) {
        return;
      }
      clearTimeout(scrollTimeoutId);
      scrollTimeoutId = null;
    };

    const clearFlushRaf = () => {
      if (flushRafId == null) {
        return;
      }
      cancelAnimationFrame(flushRafId);
      flushRafId = null;
    };

    const scheduleScrollToBottom = () => {
      if (!scrollShowRef.current || !isAutoScroll.current || isDisposed) {
        return;
      }
      if (scrollTimeoutId != null) {
        return;
      }
      scrollTimeoutId = setTimeout(() => {
        scrollTimeoutId = null;
        const scrollArea = scrollShowRef.current;
        if (!scrollArea || !isAutoScroll.current || isDisposed) {
          return;
        }
        autoScrolling.current = true;
        scrollArea.scrollTop =
          scrollArea.scrollHeight - scrollArea.clientHeight;
      }, 0);
    };

    const drainMessageBuffer = () => {
      if (isDisposed || messageBuffer.length === 0) {
        return;
      }
      const batch = messageBuffer.splice(0);
      startTransition(() => {
        setLogInfos((prev) =>
          appendAndTrimLogLines(
            prev,
            batch,
            MAX_DISPLAY_LOG_LINES,
            displayLineStartRef,
          ),
        );
      });
      scheduleScrollToBottom();
    };

    const flushMessageBufferFromRaf = () => {
      flushRafId = null;
      drainMessageBuffer();
    };

    const flushMessageBufferImmediate = () => {
      if (flushRafId != null) {
        cancelAnimationFrame(flushRafId);
        flushRafId = null;
      }
      drainMessageBuffer();
    };

    const scheduleMessageFlush = () => {
      if (flushRafId != null) {
        return;
      }
      flushRafId = requestAnimationFrame(flushMessageBufferFromRaf);
    };

    const clearRetryTimeout = () => {
      if (!retryTimeoutRef.current) {
        return;
      }
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    };

    const closeEventSource = (eventSource: EventSource | null) => {
      if (!eventSource) {
        return;
      }
      eventSource.onopen = null;
      eventSource.onmessage = null;
      eventSource.onerror = null;
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };

    const connectSSE = () => {
      if (isDisposed || eventSourceRef.current) {
        return;
      }

      const eventSource = new EventSource(buildSSEUrl());
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        hasOpened = true;
        clearRetryTimeout();
      };

      eventSource.onmessage = (e: MessageEvent<string>) => {
        messageBuffer.push(e.data);
        if (messageBuffer.length >= MESSAGE_BUFFER_SOFT_MAX) {
          flushMessageBufferImmediate();
          return;
        }
        scheduleMessageFlush();
      };

      eventSource.onerror = () => {
        closeEventSource(eventSource);
        if (isDisposed || hasOpened || retryTimeoutRef.current) {
          return;
        }

        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          connectSSE();
        }, 5000);
      };
    };

    connectSSE();

    return () => {
      isDisposed = true;
      clearRetryTimeout();
      clearFlushRaf();
      clearScrollTimeout();
      closeEventSource(eventSourceRef.current);
    };
  }, [address, buildSSEUrl, tailCount]);
  function handleScroll() {
    if (!scrollShowRef?.current) {
      return;
    }
    if (autoScrolling.current) {
      autoScrolling.current = false;
      return;
    }
    if (isAutoScroll?.current) {
      isAutoScroll.current = false;
    }
  }
  function saveToFile(content: string, filename: string) {
    try {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {}
  }
  function downloadLog() {
    requestText({
      url:
        address && address.indexOf("?") < 0
          ? address + "?timestamps=1"
          : address + "&timestamps=1",
      base_url: "",
      headers: { "Content-Type": "text/plain" },
    })
      .then((response: any) => {
        saveToFile(response, "log.txt");
      })
      .catch((error: any) => {
        console.error("Error:", error);
      });
  }

  return (
    <div className="relative">
      <div
        onScroll={handleScroll}
        ref={scrollShowRef}
        className="scrollShow"
        style={{
          height: outHeight || "150px",
          userSelect: "text",
          overflow: "auto",
          overflowY: "scroll",
          backgroundColor: "#000",
          color: "var(--dark-3)",
          padding: "8px 24px 0",
          borderRadius: "var(--radius-form) !important",
          fontSize: "12px",
          position: "relative",
        }}
      >
        {/* <ReactScrollToShowCb> */}
        <>
          {logInfos && logInfos.length
            ? logInfos.map((item: any, index: number) => {
                const lineNo = displayLineStartRef.current + index;
                return (
                  <div key={lineNo} className="flex items-start">
                    <span
                      style={{
                        marginRight: "25px",
                        fontWeight: 400,
                        fontSize: "12px",
                        color: "#808191",
                        lineHeight: "18px",
                        textAlign: "right",
                        fontStyle: "normal",
                        minWidth: "30px",
                        display: "inline-block",
                      }}
                    >
                      {lineNo}
                    </span>
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: "12px",
                        color: "var(--dark-3)",
                        lineHeight: "18px",
                        textAlign: "left",
                        fontStyle: "normal",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                );
              })
            : ""}
        </>
        {/* </ReactScrollToShowCb> */}
      </div>
      {downloadableLog && (
        <span
          className={`iconfont icon-arrow-down-to-line ${styles.arrowIcon} cursor-pointer
          absolute right-[32px] bottom-[16px] h-[32px] w-[32px] flex items-center justify-center`}
          style={{
            borderRadius: "50%",
            backgroundColor: "#333",
            color: "#fff",
            fontSize: "20px",
          }}
          onClick={() => {
            downloadLog();
          }}
        />
      )}
    </div>
  );
});
