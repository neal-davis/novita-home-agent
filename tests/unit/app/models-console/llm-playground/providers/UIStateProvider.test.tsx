import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import {
  UIStateProvider,
  useUIState,
} from "@/app/models-console/llm-playground/providers/UIStateProvider";
import { ChatWidth } from "@/app/models-console/llm-playground/constants";

function Consumer() {
  const {
    codeDrawerOpen,
    setCodeDrawerOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    chatWidth,
    setChatWidth,
  } = useUIState();
  return (
    <div>
      <span data-testid="drawer">{String(codeDrawerOpen)}</span>
      <span data-testid="sidebar">{String(sidebarCollapsed)}</span>
      <span data-testid="width">{chatWidth}</span>
      <button onClick={() => setCodeDrawerOpen(true)}>open-drawer</button>
      <button onClick={() => setSidebarCollapsed(true)}>collapse</button>
      <button onClick={() => setChatWidth(800)}>set-width</button>
    </div>
  );
}

describe("UIStateProvider", () => {
  it("provides sensible defaults", () => {
    render(
      <UIStateProvider>
        <Consumer />
      </UIStateProvider>,
    );
    expect(screen.getByTestId("drawer")).toHaveTextContent("false");
    expect(screen.getByTestId("sidebar")).toHaveTextContent("false");
    expect(screen.getByTestId("width")).toHaveTextContent(
      String(ChatWidth.NoLimit),
    );
  });

  it("updates state via the provided setters", () => {
    render(
      <UIStateProvider>
        <Consumer />
      </UIStateProvider>,
    );
    fireEvent.click(screen.getByText("open-drawer"));
    fireEvent.click(screen.getByText("collapse"));
    fireEvent.click(screen.getByText("set-width"));
    expect(screen.getByTestId("drawer")).toHaveTextContent("true");
    expect(screen.getByTestId("sidebar")).toHaveTextContent("true");
    expect(screen.getByTestId("width")).toHaveTextContent("800");
  });

  it("syncs chatWidth from the chatContainerWidth prop", () => {
    const { rerender } = render(
      <UIStateProvider chatContainerWidth={500}>
        <Consumer />
      </UIStateProvider>,
    );
    expect(screen.getByTestId("width")).toHaveTextContent("500");

    rerender(
      <UIStateProvider chatContainerWidth={640}>
        <Consumer />
      </UIStateProvider>,
    );
    expect(screen.getByTestId("width")).toHaveTextContent("640");
  });

  it("throws when useUIState is used outside the provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useUIState())).toThrow(
      "useUIState must be used within UIStateProvider",
    );
    spy.mockRestore();
  });
});
