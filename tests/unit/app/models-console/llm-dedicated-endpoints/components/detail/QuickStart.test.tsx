import { fireEvent, render, screen } from "@testing-library/react";
import QuickStart from "@/app/models-console/llm-dedicated-endpoints/components/detail/QuickStart";

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}));
jest.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({ vs: {} }));

const copied: string[] = [];
jest.mock("@/components/ui/standard/code-copy-btn", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => {
    copied.push(content);
    return (
      <button type="button" data-content={content}>
        copy
      </button>
    );
  },
}));

jest.mock("@/components/ui/tabs", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  const Ctx = React.createContext({
    value: "",
    onValueChange: (_: string) => {},
  });
  return {
    Tabs: ({
      children,
      value,
      onValueChange,
    }: {
      children: React.ReactNode;
      value: string;
      onValueChange: (v: string) => void;
    }) => (
      <Ctx.Provider value={{ value, onValueChange }}>{children}</Ctx.Provider>
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
      const ctx = React.useContext(Ctx);
      return (
        <button type="button" onClick={() => ctx.onValueChange(value)}>
          {children}
        </button>
      );
    },
  };
});

describe("QuickStart", () => {
  beforeEach(() => {
    copied.length = 0;
  });

  it("renders endpoint url, manage keys link and default python example", () => {
    render(<QuickStart endpointUrl="https://api.test/v1" modelId="meta/m" />);
    expect(screen.getByText("Quick Start")).toBeInTheDocument();
    expect(screen.getByText("https://api.test/v1")).toBeInTheDocument();
    expect(screen.getByText("Manage API Keys")).toBeInTheDocument();
    // python example contains base_url with endpoint
    expect(screen.getByText(/from openai import OpenAI/)).toBeInTheDocument();
  });

  it("switches to Typescript example on tab click", () => {
    render(<QuickStart endpointUrl="https://api.test/v1" modelId="meta/m" />);
    fireEvent.click(screen.getByRole("button", { name: "Typescript" }));
    expect(screen.getByText(/import OpenAI from 'openai'/)).toBeInTheDocument();
  });

  it("switches to Shell example with curl", () => {
    render(<QuickStart endpointUrl="https://api.test/v1" modelId="meta/m" />);
    fireEvent.click(screen.getByRole("button", { name: "Shell" }));
    expect(screen.getByText(/curl -X POST/)).toBeInTheDocument();
  });

  it("embeds modelId in the example", () => {
    render(
      <QuickStart
        endpointUrl="https://api.test/v1"
        modelId="my-special-model"
      />,
    );
    expect(screen.getByText(/my-special-model/)).toBeInTheDocument();
  });
});
