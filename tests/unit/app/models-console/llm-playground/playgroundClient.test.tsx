import { render, screen } from "@testing-library/react";
import PlaygroundClient from "@/app/models-console/llm-playground/playgroundClient";

let mockModel: any;

jest.mock(
  "@/app/models-console/llm-playground/providers/CombinedProvider",
  () => ({
    CombinedProvider: ({ children }: any) => <div>{children}</div>,
  }),
);
jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => mockModel }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/layout/PlaygroundSidebar",
  () => ({ PlaygroundSidebar: () => <div data-testid="sidebar" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/layout/PlaygroundMainContent",
  () => ({ PlaygroundMainContent: () => <div data-testid="main" /> }),
);
jest.mock(
  "@/app/models-console/llm-playground/components/layout/PlaygroundHeader",
  () => ({ PlaygroundHeader: () => <div data-testid="header" /> }),
);

beforeEach(() => {
  mockModel = { isLoadingModels: false };
});

describe("PlaygroundClient", () => {
  it("renders default header, sidebar, and main content when loaded", () => {
    render(<PlaygroundClient />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
  });

  it("shows the default loading fallback while models load", () => {
    mockModel.isLoadingModels = true;
    render(<PlaygroundClient />);
    expect(screen.getByText("Loading models...")).toBeInTheDocument();
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  it("uses a custom loading fallback slot", () => {
    mockModel.isLoadingModels = true;
    render(
      <PlaygroundClient
        slots={{ loadingFallback: <div data-testid="custom-loading" /> }}
      />,
    );
    expect(screen.getByTestId("custom-loading")).toBeInTheDocument();
  });

  it("renders custom slot components when provided", () => {
    render(
      <PlaygroundClient
        slots={{
          header: <div data-testid="custom-header" />,
          sidebar: <div data-testid="custom-sidebar" />,
          mainContent: <div data-testid="custom-main" />,
        }}
      />,
    );
    expect(screen.getByTestId("custom-header")).toBeInTheDocument();
    expect(screen.getByTestId("custom-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("custom-main")).toBeInTheDocument();
    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });
});
