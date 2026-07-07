import { render, screen, fireEvent } from "@testing-library/react";
import GPUExceedModal from "@/app/models-console/llm-dedicated-endpoints/components/GPUExceedModal";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("GPUExceedModal", () => {
  it("hidden when show false", () => {
    render(
      <GPUExceedModal
        show={false}
        handleClose={jest.fn()}
        userDEInfo={{ currentGpuCount: 8 } as never}
      />,
    );
    expect(
      screen.queryByText(/exceeded your GPU quota/),
    ).not.toBeInTheDocument();
  });

  it("renders current gpu count and contact link", () => {
    render(
      <GPUExceedModal
        show
        handleClose={jest.fn()}
        userDEInfo={{ currentGpuCount: 8 } as never}
      />,
    );
    expect(
      screen.getByText("You've exceeded your GPU quota."),
    ).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  it("close button triggers handleClose", () => {
    const handleClose = jest.fn();
    render(
      <GPUExceedModal
        show
        handleClose={handleClose}
        userDEInfo={{ currentGpuCount: 8 } as never}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClose).toHaveBeenCalled();
  });
});
