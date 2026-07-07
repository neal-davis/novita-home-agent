import { fireEvent, render, screen } from "@testing-library/react";
import ChangeTemplateModal from "@/app/gpus-console/image/components/changeTemplate";

jest.mock("@/app/gpus-console/explore/components/changeNewTemplate", () => ({
  __esModule: true,
  default: ({ open, onClose, onConfirm }: any) =>
    open ? (
      <div role="dialog">
        <button onClick={onClose} type="button">
          close
        </button>
        <button onClick={() => onConfirm?.({ image: "img" })} type="button">
          confirm
        </button>
      </div>
    ) : null,
}));

describe("image ChangeTemplateModal", () => {
  it("forwards open/onClose/onConfirm to the underlying modal", () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    render(
      <ChangeTemplateModal open onClose={onClose} onConfirm={onConfirm} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    expect(onConfirm).toHaveBeenCalledWith({ image: "img" });

    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when closed", () => {
    render(<ChangeTemplateModal open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
