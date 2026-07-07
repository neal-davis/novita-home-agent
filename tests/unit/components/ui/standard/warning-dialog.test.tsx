import { fireEvent, render, screen } from "@testing-library/react";
import { WarningDialog } from "@/components/ui/standard/warning-dialog";

describe("WarningDialog", () => {
  it("renders the title and description when open", () => {
    render(
      <WarningDialog
        open
        title="Watch out"
        description="Something happened"
        onOpenChange={jest.fn()}
      />,
    );
    expect(screen.getByText("Watch out")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("does not render content when closed", () => {
    render(
      <WarningDialog open={false} title="Hidden" onOpenChange={jest.fn()} />,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("closes via the OK button", () => {
    const onOpenChange = jest.fn();
    render(<WarningDialog open title="T" onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText("OK"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
