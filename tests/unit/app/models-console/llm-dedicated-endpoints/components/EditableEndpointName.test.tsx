import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import EditableEndpointName from "@/app/models-console/llm-dedicated-endpoints/components/EditableEndpointName";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

function setup(props: Record<string, unknown> = {}) {
  const onSave = jest.fn().mockResolvedValue(undefined);
  const syncEndpointData = jest.fn().mockResolvedValue(undefined);
  render(
    <EditableEndpointName
      endpointName="ep-1"
      onSave={onSave}
      syncEndpointData={syncEndpointData}
      {...props}
    />,
  );
  return { onSave, syncEndpointData };
}

describe("EditableEndpointName", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows display name and edit affordance", () => {
    setup();
    expect(screen.getByText("ep-1")).toBeInTheDocument();
    expect(screen.getByTitle("Edit name")).toBeInTheDocument();
  });

  it("enters edit mode showing input prefilled", () => {
    setup();
    fireEvent.click(screen.getByTitle("Edit name"));
    expect(screen.getByDisplayValue("ep-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("saves a new name, calls onSave + sync, and shows the new name", async () => {
    const { onSave, syncEndpointData } = setup();
    fireEvent.click(screen.getByTitle("Edit name"));
    fireEvent.change(screen.getByDisplayValue("ep-1"), {
      target: { value: "ep-2" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("ep-2"));
    expect(syncEndpointData).toHaveBeenCalled();
    expect(screen.getByText("ep-2")).toBeInTheDocument();
  });

  it("does nothing when value unchanged, just exits edit", async () => {
    const { onSave } = setup();
    fireEvent.click(screen.getByTitle("Edit name"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("ep-1")).toBeInTheDocument();
  });

  it("reverts name and shows error toast when save fails", async () => {
    const onSave = jest.fn().mockRejectedValue(new Error("fail"));
    render(
      <EditableEndpointName
        endpointName="ep-1"
        onSave={onSave}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByTitle("Edit name"));
    fireEvent.change(screen.getByDisplayValue("ep-1"), {
      target: { value: "ep-bad" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "Save failed, please try again",
      ),
    );
    // Reverts to original value in input (still editing)
    expect(screen.getByDisplayValue("ep-1")).toBeInTheDocument();
  });

  it("Enter key triggers save", async () => {
    const { onSave } = setup();
    fireEvent.click(screen.getByTitle("Edit name"));
    const input = screen.getByDisplayValue("ep-1");
    fireEvent.change(input, { target: { value: "ep-enter" } });
    await act(async () => {
      fireEvent.keyDown(input, { key: "Enter" });
    });
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("ep-enter"));
  });

  it("Escape key cancels editing", () => {
    setup();
    fireEvent.click(screen.getByTitle("Edit name"));
    const input = screen.getByDisplayValue("ep-1");
    fireEvent.change(input, { target: { value: "discarded" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.getByText("ep-1")).toBeInTheDocument();
  });

  it("Save button disabled when input is whitespace only", () => {
    setup();
    fireEvent.click(screen.getByTitle("Edit name"));
    fireEvent.change(screen.getByDisplayValue("ep-1"), {
      target: { value: "   " },
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});
