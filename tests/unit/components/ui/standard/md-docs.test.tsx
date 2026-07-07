import { render, screen } from "@testing-library/react";
import MDDocs from "@/components/ui/standard/md-docs";

// Drive the custom `code` renderer directly by capturing the components map
// react-markdown receives, instead of running the full markdown pipeline.
let capturedComponents: any = {};
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ components, children, className }: any) => {
    capturedComponents = components;
    return (
      <div data-testid="md" className={className}>
        {children}
      </div>
    );
  },
}));
jest.mock("remark-gfm", () => ({ __esModule: true, default: () => {} }));
jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: any) => <pre data-testid="hl">{children}</pre>,
}));
jest.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({
  vs: {},
}));
jest.mock("@/components/ui/standard/code-copy-btn", () => ({
  __esModule: true,
  default: ({ content }: any) => <button data-testid="copy">{content}</button>,
}));

beforeEach(() => {
  capturedComponents = {};
});

describe("MDDocs", () => {
  it("renders the markdown content and merges className", () => {
    render(<MDDocs content="# Hello" className="md-x" />);
    const md = screen.getByTestId("md");
    expect(md).toHaveTextContent("# Hello");
    expect(md.className).toContain("md-x");
  });

  it("renders a code block with highlighter and copy button for fenced code", () => {
    render(<MDDocs content="x" />);
    const Code = capturedComponents.code;
    render(<Code className="language-ts">{"const a = 1;\nconst b = 2;"}</Code>);
    expect(screen.getByTestId("hl")).toBeInTheDocument();
    expect(screen.getByTestId("copy")).toBeInTheDocument();
  });

  it("renders inline code without a highlighter", () => {
    render(<MDDocs content="x" />);
    const Code = capturedComponents.code;
    const { container } = render(<Code>{"inlineToken"}</Code>);
    expect(container.querySelector("code")).toBeInTheDocument();
    expect(screen.queryByTestId("hl")).not.toBeInTheDocument();
  });

  it("returns null for empty code children", () => {
    render(<MDDocs content="x" />);
    const Code = capturedComponents.code;
    const { container } = render(<Code>{undefined}</Code>);
    expect(container.firstChild).toBeNull();
  });
});
