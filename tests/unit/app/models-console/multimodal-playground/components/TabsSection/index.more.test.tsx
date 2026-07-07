import { fireEvent, render, screen, act } from "@testing-library/react";
import { TabsSection } from "@/app/models-console/multimodal-playground/components/TabsSection";
import type { TaskState } from "@/app/models-console/multimodal-playground/hooks/useTaskExecution";

jest.mock(
  "@/app/models-console/multimodal-playground/components/ParametersPanel",
  () => ({ ParametersPanel: () => <div data-testid="params-panel" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ResultPanel/index",
  () => ({ ResultPanel: () => <div data-testid="result-panel" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ApiInfo",
  () => ({ ApiInfo: () => <div data-testid="api-info" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/ExamplesGallery",
  () => ({ ExamplesGallery: () => <div data-testid="examples-gallery" /> }),
);
jest.mock(
  "@/app/models-console/multimodal-playground/components/CopyButton",
  () => ({ CopyButton: () => <div data-testid="copy-button" /> }),
);
jest.mock("@/components/ui/standard/md-docs", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => (
    <div data-testid="md-docs">{content}</div>
  ),
}));

const baseTaskState: TaskState = {
  status: "idle",
  taskId: null,
  result: null,
  error: null,
  abortController: null,
};

function renderTabs(overrides: Record<string, any> = {}) {
  const onTabChange = jest.fn();
  const props = {
    activeTab: "playground",
    onTabChange,
    modelCategory: "image_gen" as const,
    modelDescription: "desc",
    requestSchema: {},
    requiredFields: [],
    formData: { prompt: "hi" },
    errors: {},
    onFieldChange: jest.fn(),
    onReset: jest.fn(),
    onRun: jest.fn(),
    taskState: baseTaskState,
    endpoint: "/v1/x",
    isAsyncTask: false,
    isLoggedIn: true,
    examples: [],
    markdown: "",
    onExampleSelect: jest.fn(),
    ...overrides,
  };
  return { onTabChange, ...render(<TabsSection {...props} />) };
}

describe("TabsSection (more branches)", () => {
  it("clears an existing scroll timeout when a tab is clicked again quickly", () => {
    jest.useFakeTimers();
    const { container, onTabChange } = renderTabs();
    Element.prototype.scrollTo = jest.fn();
    // make sections report an offsetTop so handleTabClick proceeds
    container.querySelectorAll("section").forEach((s) =>
      Object.defineProperty(s, "offsetTop", {
        configurable: true,
        value: 10,
      }),
    );
    const clearSpy = jest.spyOn(global, "clearTimeout");

    fireEvent.click(screen.getByRole("button", { name: "Request JSON" }));
    // Second click before the first timeout resolves -> clearTimeout branch
    fireEvent.click(screen.getByRole("button", { name: "API" }));
    expect(clearSpy).toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onTabChange).toHaveBeenLastCalledWith("bash");
    clearSpy.mockRestore();
    jest.useRealTimers();
  });

  it("does not change tab on scroll when no section is above the scroll position", () => {
    const onTabChange = jest.fn();
    const { container } = renderTabs({ onTabChange });
    const section = container.querySelector("section") as HTMLElement;
    const content = section.parentElement as HTMLElement;
    // all sections sit far below the scroll position -> findVisibleSection null
    container.querySelectorAll("section").forEach((s) =>
      Object.defineProperty(s, "offsetTop", {
        configurable: true,
        value: 99999,
      }),
    );
    Object.defineProperty(content, "scrollTop", {
      configurable: true,
      value: 0,
    });
    fireEvent.scroll(content);
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("does not call onTabChange while a programmatic scroll is in progress", () => {
    jest.useFakeTimers();
    const { container, onTabChange } = renderTabs();
    Element.prototype.scrollTo = jest.fn();
    const section = container.querySelector("section") as HTMLElement;
    const content = section.parentElement as HTMLElement;
    container.querySelectorAll("section").forEach((s) =>
      Object.defineProperty(s, "offsetTop", {
        configurable: true,
        value: s.id === "json" ? 0 : 10,
      }),
    );
    // start a programmatic scroll
    fireEvent.click(screen.getByRole("button", { name: "Request JSON" }));
    onTabChange.mockClear();
    Object.defineProperty(content, "scrollTop", {
      configurable: true,
      value: 100,
    });
    // scroll fired while isProgrammaticScrolling is true -> early return
    fireEvent.scroll(content);
    expect(onTabChange).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1000));
    jest.useRealTimers();
  });
});
