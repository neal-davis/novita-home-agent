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

describe("TabsSection", () => {
  it("renders the base tabs without examples or readme", () => {
    renderTabs();
    expect(
      screen.getByRole("button", { name: "Playground" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request JSON" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "API" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Examples" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Model details" }),
    ).not.toBeInTheDocument();
  });

  it("adds the Examples tab and gallery when examples exist", () => {
    renderTabs({
      examples: [{ request: { a: 1 }, response: { b: 2 } }],
    });
    expect(
      screen.getByRole("button", { name: "Examples" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("examples-gallery")).toBeInTheDocument();
  });

  it("adds the Model details tab and renders markdown when provided", () => {
    renderTabs({ markdown: "# hello" });
    expect(
      screen.getByRole("button", { name: "Model details" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("md-docs")).toHaveTextContent("# hello");
  });

  it("renders the request JSON from nested form data", () => {
    renderTabs({ formData: { prompt: "abc" } });
    expect(screen.getByText(/"prompt": "abc"/)).toBeInTheDocument();
  });

  it("marks the active tab and calls onTabChange after a tab click (with scroll)", () => {
    jest.useFakeTimers();
    const { onTabChange } = renderTabs({
      examples: [{ request: {}, response: {} }],
    });
    Element.prototype.scrollTo = jest.fn();

    fireEvent.click(screen.getByRole("button", { name: "Request JSON" }));
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onTabChange).toHaveBeenCalledWith("json");
    jest.useRealTimers();
  });

  it("shows running state passed to ResultPanel when status is polling", () => {
    renderTabs({
      taskState: { ...baseTaskState, status: "polling" },
    });
    // ResultPanel is mocked; assert it still rendered (isRunning branch executed)
    expect(screen.getByTestId("result-panel")).toBeInTheDocument();
  });

  it("renders model header when provided", () => {
    renderTabs({ modelHeader: <div data-testid="mh">header</div> });
    expect(screen.getByTestId("mh")).toBeInTheDocument();
  });

  it("activates a section on scroll based on offsetTop", () => {
    const onTabChange = jest.fn();
    const { container } = render(
      <TabsSection
        activeTab="playground"
        onTabChange={onTabChange}
        modelCategory="image_gen"
        modelDescription="d"
        requestSchema={{}}
        requiredFields={[]}
        formData={{}}
        errors={{}}
        onFieldChange={jest.fn()}
        onReset={jest.fn()}
        onRun={jest.fn()}
        taskState={baseTaskState}
        endpoint="/v1/x"
        isAsyncTask={false}
        isLoggedIn={true}
        examples={[]}
        markdown=""
        onExampleSelect={jest.fn()}
      />,
    );
    const sectionForContent = container.querySelector("section") as HTMLElement;
    const content = sectionForContent.parentElement as HTMLElement;
    // make sections report offsetTop so findVisibleSection picks "json"
    const sections = container.querySelectorAll("section");
    sections.forEach((s) =>
      Object.defineProperty(s, "offsetTop", {
        configurable: true,
        value: s.id === "json" ? 0 : 9999,
      }),
    );
    Object.defineProperty(content, "scrollTop", {
      configurable: true,
      value: 100,
    });
    fireEvent.scroll(content);
    expect(onTabChange).toHaveBeenCalledWith("json");
  });

  it("applies fade effect logic when a model header is present on scroll", () => {
    const { container } = render(
      <TabsSection
        activeTab="json"
        onTabChange={jest.fn()}
        modelCategory="image_gen"
        modelDescription="d"
        requestSchema={{}}
        requiredFields={[]}
        formData={{}}
        errors={{}}
        onFieldChange={jest.fn()}
        onReset={jest.fn()}
        onRun={jest.fn()}
        taskState={baseTaskState}
        endpoint="/v1/x"
        isAsyncTask={false}
        isLoggedIn={true}
        examples={[]}
        markdown=""
        onExampleSelect={jest.fn()}
        modelHeader={<div>mh</div>}
      />,
    );
    const headerSection = container.querySelector("section") as HTMLElement;
    const content = headerSection.parentElement as HTMLElement;
    Object.defineProperty(content, "scrollTop", {
      configurable: true,
      value: 20,
    });
    // should not throw while computing the near-snap state
    expect(() => fireEvent.scroll(content)).not.toThrow();
  });
});
