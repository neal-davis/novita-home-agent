export const GPU_SCROLL_CONTAINER_CLASS_NAME = "gpu-container-content";
export const GPU_SCROLL_CONTAINER_SELECTOR = `.${GPU_SCROLL_CONTAINER_CLASS_NAME}`;

export function getGpuScrollContainer() {
  return document.querySelector<HTMLElement>(GPU_SCROLL_CONTAINER_SELECTOR);
}

export function scrollGpuConsoleToBottomAfterCommit(
  scrollTarget: HTMLElement | null,
) {
  const scrollContainer = getGpuScrollContainer();
  if (!scrollContainer) return;

  const scrollToBottom = () => {
    if (scrollTarget) {
      scrollTarget.scrollIntoView({ block: "end", behavior: "smooth" });
      return;
    }
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  };

  scrollToBottom();

  if (typeof ResizeObserver === "undefined") {
    return;
  }

  let settled = false;
  let cleanupTimer: number | null = null;
  const cleanup = () => {
    if (settled) return;
    settled = true;
    observer.disconnect();
    if (cleanupTimer) {
      window.clearTimeout(cleanupTimer);
    }
    scrollToBottom();
  };
  const observer = new ResizeObserver(() => {
    if (settled) return;
    scrollToBottom();
  });

  observer.observe(scrollTarget || scrollContainer);
  cleanupTimer = window.setTimeout(cleanup, 250);
}
