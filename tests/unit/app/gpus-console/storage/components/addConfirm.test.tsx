import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AddConfirm from "@/app/gpus-console/storage/components/addConfirm";

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
}));
jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, onCancel, open, title }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <button type="button" onClick={onCancel}>
          modal cancel
        </button>
        {children}
      </div>
    ) : null,
}));

describe("AddConfirm", () => {
  it("renders the price and confirms creation", () => {
    const finishOper = jest.fn();
    render(<AddConfirm openDiag finishOper={finishOper} price="1.50" />);
    expect(screen.getByText(/\$1.50\/day/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Confirm"));
    expect(finishOper).toHaveBeenCalledWith(true);
  });

  it("closes via the cancel button", () => {
    const finishOper = jest.fn();
    render(<AddConfirm openDiag finishOper={finishOper} price="2" />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(finishOper).toHaveBeenCalledWith(false);
  });

  it("renders nothing when the dialog is closed", () => {
    const { container } = render(
      <AddConfirm openDiag={false} finishOper={jest.fn()} price="2" />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // mountContainerRef absent -> no portal div either
    expect(container.querySelector("div")).toBeNull();
  });

  it("renders the portal mount div when a container ref is provided", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AddConfirm
        openDiag
        finishOper={jest.fn()}
        price="3"
        mountContainerRef={ref}
      />,
    );
    expect(ref.current).not.toBeNull();
  });
});
