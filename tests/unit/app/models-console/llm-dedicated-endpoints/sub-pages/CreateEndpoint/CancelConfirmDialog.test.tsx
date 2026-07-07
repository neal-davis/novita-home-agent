import { render, screen, fireEvent } from "@testing-library/react";
import { CancelConfirmDialog } from "@/app/models-console/llm-dedicated-endpoints/sub-pages/CreateEndpoint/CancelConfirmDialog";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("CancelConfirmDialog", () => {
  it("hidden when closed", () => {
    render(
      <CancelConfirmDialog
        open={false}
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(
      <CancelConfirmDialog
        open
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    expect(screen.getByText("Discard changes?")).toBeInTheDocument();
  });

  it("Continue editing closes dialog", () => {
    const onOpenChange = jest.fn();
    render(
      <CancelConfirmDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue editing" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Discard fires onConfirm", () => {
    const onConfirm = jest.fn();
    render(
      <CancelConfirmDialog
        open
        onOpenChange={jest.fn()}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
