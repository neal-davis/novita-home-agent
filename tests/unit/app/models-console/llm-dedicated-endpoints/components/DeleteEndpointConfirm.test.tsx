import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import DeleteEndpointConfirm from "@/app/models-console/llm-dedicated-endpoints/components/DeleteEndpointConfirm";
import { deleteLLMDedicatedEndpoint } from "@/api/dedicated-endpoint";

jest.mock("@/api/dedicated-endpoint", () => ({
  deleteLLMDedicatedEndpoint: jest.fn(),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockDelete = deleteLLMDedicatedEndpoint as jest.Mock;

function setup(props: Record<string, unknown> = {}) {
  const handleClose = jest.fn();
  const goToListPage = jest.fn();
  render(
    <DeleteEndpointConfirm
      show
      endpointId="ep-1"
      endpointName="my-ep"
      canDelete
      handleClose={handleClose}
      goToListPage={goToListPage}
      {...props}
    />,
  );
  return { handleClose, goToListPage };
}

describe("DeleteEndpointConfirm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not render when closed", () => {
    setup({ show: false });
    expect(screen.queryByText("Delete endpoint")).not.toBeInTheDocument();
  });

  it("shows terminate-first message and Close when cannot delete", () => {
    const { handleClose } = setup({ canDelete: false });
    expect(
      screen.getByText("Please terminate the endpoint before deleting"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(handleClose).toHaveBeenCalled();
  });

  it("Delete button disabled until name typed exactly", () => {
    setup();
    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    expect(deleteBtn).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("Enter endpoint name"), {
      target: { value: "wrong" },
    });
    expect(deleteBtn).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("Enter endpoint name"), {
      target: { value: "my-ep" },
    });
    expect(deleteBtn).not.toBeDisabled();
  });

  it("confirms delete, calls API and closes", async () => {
    mockDelete.mockResolvedValue({});
    const { handleClose } = setup();
    fireEvent.change(screen.getByPlaceholderText("Enter endpoint name"), {
      target: { value: "my-ep" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    });
    await waitFor(() =>
      expect(mockDelete).toHaveBeenCalledWith({ id: "ep-1" }),
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it("cancel triggers handleClose", () => {
    const { handleClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(handleClose).toHaveBeenCalled();
  });

  it("navigates to list after successful delete (timer)", async () => {
    jest.useFakeTimers();
    mockDelete.mockResolvedValue({});
    const { goToListPage } = setup();
    fireEvent.change(screen.getByPlaceholderText("Enter endpoint name"), {
      target: { value: "my-ep" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(goToListPage).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
