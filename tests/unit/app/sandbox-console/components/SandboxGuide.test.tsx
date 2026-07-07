import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: React.ReactNode }) => (
    <pre data-testid="code">{children}</pre>
  ),
}));

jest.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({
  oneLight: {},
}));

import SandboxGuide from "@/app/sandbox-console/components/SandboxGuide";

describe("SandboxGuide", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders hero, steps, and the default Python code block", () => {
    render(<SandboxGuide />);
    expect(
      screen.getByText("Build Stateful Agents with Novita Sandbox"),
    ).toBeInTheDocument();
    expect(screen.getByText("Create API KEY")).toBeInTheDocument();
    expect(screen.getByText("Install SDK")).toBeInTheDocument();
    // Default active tab is Python install
    expect(screen.getByText("pip install novita-sandbox")).toBeInTheDocument();
  });

  it("opens docs and CLI links in a new tab", () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation();
    render(<SandboxGuide />);

    fireEvent.click(screen.getByText("Docs"));
    expect(openSpy).toHaveBeenCalledWith(
      "https://novita.ai/docs/guides/sandbox-overview",
      "_blank",
    );
    fireEvent.click(screen.getByText("CLI Reference"));
    expect(openSpy).toHaveBeenCalledWith(
      "https://novita.ai/docs/guides/sandbox-cli",
      "_blank",
    );
    openSpy.mockRestore();
  });

  it("navigates to key management from step actions", () => {
    render(<SandboxGuide />);
    fireEvent.click(screen.getByText("Go to Key Management"));
    expect(mockPush).toHaveBeenCalledWith("/settings/key-management");
    fireEvent.click(screen.getByText("Add API Key"));
    expect(mockPush).toHaveBeenCalledWith(
      "/settings/key-management?action=add",
    );
  });

  it("switches the shared code tab to JavaScript", () => {
    render(<SandboxGuide />);
    // The install tab "JavaScript & TypeScript SDK" toggles globalActiveTab
    fireEvent.click(screen.getByText("JavaScript & TypeScript SDK"));
    expect(screen.getByText("npm install novita-sandbox")).toBeInTheDocument();
  });

  it("copies the active code block to the clipboard", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<SandboxGuide />);
    const copyButtons = screen.getAllByTitle("Copy code");
    fireEvent.click(copyButtons[0]);
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("pip install novita-sandbox"),
    );
  });
});
