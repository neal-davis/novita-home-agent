import { fireEvent, render, screen } from "@testing-library/react";
import ConfirmCreate from "@/app/gpus-console/explore/components/confirmCreate";

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

describe("ConfirmCreate", () => {
  it("shows the upfront fee and confirms with the instance payload", () => {
    const finishForm = jest.fn();
    const createInstanceInfo = {
      productId: "gpu-product",
      billingMode: "monthly",
    };

    render(
      <ConfirmCreate
        sumFee="123.456"
        finishForm={finishForm}
        createInstanceInfo={createInstanceInfo}
      />,
    );

    expect(screen.getByText("Confirm Create")).toBeInTheDocument();
    expect(screen.getByText("$123.456")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(finishForm).toHaveBeenCalledWith(true, createInstanceInfo);
  });

  it("cancels without passing stale instance data", () => {
    const finishForm = jest.fn();

    render(
      <ConfirmCreate
        sumFee="1.000"
        finishForm={finishForm}
        createInstanceInfo={{ productId: "gpu-product" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(finishForm).toHaveBeenCalledWith(false);
  });
});
