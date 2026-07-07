import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ConfirmDialog } from "@/components/ui/standard/confirm-dialog";

describe("ConfirmDialog", () => {
  it("renders title, description, and default button labels when open", () => {
    render(
      <ConfirmDialog
        open
        title="Are you sure?"
        description="This cannot be undone"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders custom button labels", () => {
    render(
      <ConfirmDialog
        open
        title="T"
        confirmText="Delete"
        cancelText="Keep"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Keep")).toBeInTheDocument();
  });

  it("calls onConfirm then closes when confirming", async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();
    render(
      <ConfirmDialog
        open
        title="T"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalled();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("applies destructive styling on the confirm button", () => {
    render(
      <ConfirmDialog
        open
        title="T"
        variant="destructive"
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    expect(screen.getByText("Confirm")).toHaveClass("text-white");
  });
});
