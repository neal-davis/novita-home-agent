import { render, screen, fireEvent } from "@testing-library/react";
import EndpointBaseInfo from "@/app/models-console/llm-dedicated-endpoints/components/EndpointBaseInfo";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn() },
}));

jest.mock("react-copy-to-clipboard", () => ({
  CopyToClipboard: ({
    children,
    onCopy,
  }: {
    children: React.ReactNode;
    onCopy: () => void;
  }) => <div onClick={onCopy}>{children}</div>,
}));

function setup(props: Record<string, unknown> = {}) {
  render(
    <EndpointBaseInfo
      healthy="healthy"
      endpointUrl="https://api.test/v1"
      endpointId="ep-1"
      modelName="meta/m"
      replica={3}
      readyReplica={2}
      {...props}
    />,
  );
}

describe("EndpointBaseInfo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders capitalized health, replica info, url, id and model", () => {
    setup();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("2 running out of 3")).toBeInTheDocument();
    expect(screen.getByText("https://api.test/v1")).toBeInTheDocument();
    expect(screen.getByText("ep-1")).toBeInTheDocument();
    expect(screen.getByText("meta/m")).toBeInTheDocument();
  });

  it("capitalizes non-healthy status too", () => {
    setup({ healthy: "degraded" });
    expect(screen.getByText("Degraded")).toBeInTheDocument();
  });

  it("copies url and shows toast", () => {
    setup();
    fireEvent.click(screen.getByText("https://api.test/v1"));
    expect(message.success).toHaveBeenCalledWith("Copied to clipboard!");
  });
});
