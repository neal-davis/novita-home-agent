import { fireEvent, render, screen } from "@testing-library/react";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewConsole,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from "@/components/ai-elements/web-preview";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

describe("WebPreview", () => {
  it("renders the url input seeded with the default url", () => {
    render(
      <WebPreview defaultUrl="https://start.com">
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
      </WebPreview>,
    );
    expect(screen.getByDisplayValue("https://start.com")).toBeInTheDocument();
  });

  it("commits the url on Enter and reports it through onUrlChange", () => {
    const onUrlChange = jest.fn();
    render(
      <WebPreview onUrlChange={onUrlChange}>
        <WebPreviewBody />
        <WebPreviewUrl />
      </WebPreview>,
    );
    const input = screen.getByPlaceholderText("Enter URL...");
    fireEvent.change(input, { target: { value: "https://new.com" } });
    fireEvent.keyDown(input, {
      key: "Enter",
      target: { value: "https://new.com" },
    });
    expect(onUrlChange).toHaveBeenCalledWith("https://new.com");
  });

  it("renders the iframe body with the context url", () => {
    render(
      <WebPreview defaultUrl="https://body.com">
        <WebPreviewBody />
      </WebPreview>,
    );
    expect(screen.getByTitle("Preview")).toHaveAttribute(
      "src",
      "https://body.com",
    );
  });

  it("navigation button renders its children", () => {
    render(
      <WebPreview>
        <WebPreviewNavigation>
          <WebPreviewNavigationButton tooltip="Back">
            <span>back-icon</span>
          </WebPreviewNavigationButton>
        </WebPreviewNavigation>
      </WebPreview>,
    );
    expect(screen.getByText("back-icon")).toBeInTheDocument();
  });

  it("console shows 'No console output' when empty", () => {
    render(
      <WebPreview>
        <WebPreviewConsole logs={[]} />
      </WebPreview>,
    );
    fireEvent.click(screen.getByText("Console"));
    expect(screen.getByText("No console output")).toBeInTheDocument();
  });

  it("console renders log messages when expanded", () => {
    render(
      <WebPreview>
        <WebPreviewConsole
          logs={[{ level: "error", message: "boom", timestamp: new Date() }]}
        />
      </WebPreview>,
    );
    fireEvent.click(screen.getByText("Console"));
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});
