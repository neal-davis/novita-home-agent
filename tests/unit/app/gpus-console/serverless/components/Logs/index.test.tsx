import { fireEvent, render, screen } from "@testing-library/react";
import Logs from "@/app/gpus-console/serverless/components/Logs/index";

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
}));
jest.mock("@/app/gpus-console/components/InstanceLog", () => ({
  __esModule: true,
  default: ({ address }: any) => <div>instance log {address}</div>,
}));
jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({ children, open, onCancel }: any) =>
    open ? (
      <div role="dialog">
        <button onClick={onCancel} type="button">
          mask-close
        </button>
        {children}
      </div>
    ) : null,
}));

describe("serverless Logs modal", () => {
  it("does not render when showModal is false", () => {
    render(
      <Logs
        finishForm={jest.fn()}
        instanceLogAddress="addr-1"
        showModal={false}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the log address and closes via the Close button", () => {
    const finishForm = jest.fn();
    render(
      <Logs finishForm={finishForm} instanceLogAddress="addr-1" showModal />,
    );
    expect(screen.getByText("instance log addr-1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(finishForm).toHaveBeenCalled();
  });

  it("closes via the modal mask handler", () => {
    const finishForm = jest.fn();
    render(
      <Logs finishForm={finishForm} instanceLogAddress="addr-2" showModal />,
    );
    fireEvent.click(screen.getByRole("button", { name: "mask-close" }));
    expect(finishForm).toHaveBeenCalled();
  });
});
