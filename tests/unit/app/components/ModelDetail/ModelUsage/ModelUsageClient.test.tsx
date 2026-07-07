import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ModelUsageClient from "@/app/components/ModelDetail/ModelUsage/ModelUsageClient";

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children, language }: { children: string; language: string }) => (
    <pre data-language={language}>{children}</pre>
  ),
}));

jest.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({
  vs: {},
}));

jest.mock("@/components/ui/standard/code-copy-btn", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => (
    <button type="button" data-testid="copy-button">
      {content}
    </button>
  ),
}));

jest.mock("@/components/ui/standard/md-docs", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => (
    <article data-testid="md-docs">{content}</article>
  ),
}));

jest.mock("@/components/ui/tabs", () => {
  const React = jest.requireActual("react");
  const TabsContext = React.createContext({
    onValueChange: (_value: string) => {},
  });

  return {
    Tabs: ({
      children,
      value,
      onValueChange,
    }: {
      children: React.ReactNode;
      value: string;
      onValueChange: (value: string) => void;
    }) => (
      <TabsContext.Provider value={{ onValueChange }}>
        <div data-testid={`tabs-${value}`} data-value={value}>
          {children}
        </div>
      </TabsContext.Provider>
    ),
    TabsList: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    TabsTrigger: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => {
      const { onValueChange } = React.useContext(TabsContext);
      return (
        <button type="button" onClick={() => onValueChange(value)}>
          {children}
        </button>
      );
    },
  };
});

describe("ModelUsageClient", () => {
  it("renders API code examples for serverless models and swaps language/mode", () => {
    render(
      <ModelUsageClient
        model={
          {
            id: "meta/llama-3",
            features: ["serverless"],
            isCompletion: true,
            max_output_tokens: 2048,
          } as any
        }
        initialContent={{
          "HOW_TO_USE_README_meta-llama-3": "Use this model for chat.",
          "MODEL_CARD_README_META-LLAMA-3": "Model card content.",
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "API Usage" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/model="meta\/llama-3"/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/max_tokens=2048/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Typescript" }));
    expect(
      screen.getAllByText(/model: 'meta\/llama-3'/).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/max_tokens: 1000/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Completion" }));
    expect(screen.getAllByText(/completions\.create/).length).toBeGreaterThan(
      0,
    );
  });

  it("hides API usage for non-serverless models and falls back to configured docs", async () => {
    render(
      <ModelUsageClient
        model={{ id: "private/model", features: [], isCompletion: true } as any}
        modelConfig={{
          howToUse: "Configured how-to text",
          modelCard: "Configured model card",
          promptingGuide: "Prompt tips",
          applicationsUseCases: "App examples",
        }}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Use the following code examples"),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "API Usage" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("md-docs")).toHaveTextContent(
      "Configured how-to text",
    );

    fireEvent.click(screen.getByRole("button", { name: "Model Card" }));
    expect(screen.getByTestId("md-docs")).toHaveTextContent(
      "Configured model card",
    );
  });
});
