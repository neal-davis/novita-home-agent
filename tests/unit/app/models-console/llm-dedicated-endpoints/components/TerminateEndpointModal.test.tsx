import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import TerminateEndpointModal from "@/app/models-console/llm-dedicated-endpoints/components/TerminateEndpointModal";
import { stopLLMDedicatedEndpoint } from "@/api/dedicated-endpoint";

jest.mock("@/api/dedicated-endpoint", () => ({
  stopLLMDedicatedEndpoint: jest.fn(),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockStop = stopLLMDedicatedEndpoint as jest.Mock;

function setup(props: Record<string, unknown> = {}) {
  const handleClose = jest.fn();
  const syncEndpointData = jest.fn().mockResolvedValue(undefined);
  render(
    <TerminateEndpointModal
      show
      endpointId="ep-1"
      handleClose={handleClose}
      syncEndpointData={syncEndpointData}
      {...props}
    />,
  );
  return { handleClose, syncEndpointData };
}

describe("TerminateEndpointModal", () => {
  beforeEach(() => jest.clearAllMocks());

  it("hidden when show false", () => {
    setup({ show: false });
    expect(screen.queryByText("Terminate endpoint")).not.toBeInTheDocument();
  });

  it("renders content and cancel triggers handleClose", () => {
    const { handleClose } = setup();
    expect(screen.getByText("Terminate endpoint")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(handleClose).toHaveBeenCalled();
  });

  it("confirm without force for normal status", async () => {
    mockStop.mockResolvedValue({});
    const { handleClose, syncEndpointData } = setup({
      endpointStatus: "running",
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    });
    await waitFor(() =>
      expect(mockStop).toHaveBeenCalledWith({ id: "ep-1", force: undefined }),
    );
    expect(syncEndpointData).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it("forces stop for rolling status", async () => {
    mockStop.mockResolvedValue({});
    setup({ endpointStatus: "rolling" });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    });
    await waitFor(() =>
      expect(mockStop).toHaveBeenCalledWith({ id: "ep-1", force: true }),
    );
  });

  it("forces stop for scaling status", async () => {
    mockStop.mockResolvedValue({});
    setup({ endpointStatus: "scaling" });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    });
    await waitFor(() =>
      expect(mockStop).toHaveBeenCalledWith({ id: "ep-1", force: true }),
    );
  });
});
