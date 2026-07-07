import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ExpansionInstance from "@/app/gpus-console/instances/components/expansionInstance";
import { reqGetProductExpandAmount } from "@/api/gpu-instance/explore";

jest.mock("@/api/gpu-instance/explore", () => ({
  reqGetProductExpandAmount: jest.fn(),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  ),
  TableBody: ({ children }: any) => <>{children}</>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
  TableCell: ({ children }: any) => <td>{children}</td>,
}));

const mockAmount = reqGetProductExpandAmount as jest.Mock;

describe("ExpansionInstance modal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAmount.mockResolvedValue({
      remainDays: 5,
      amount: "30000",
      currentSize: "100",
      freeSize: "50",
    });
  });

  it("loads the expansion amount and renders the settlement details", async () => {
    render(
      <ExpansionInstance
        instanceInfoObj={{ id: "i-1", endTime: "1771113600" }}
        finishForm={jest.fn()}
        expandSize={40}
      />,
    );
    await waitFor(() =>
      expect(mockAmount).toHaveBeenCalledWith({
        instanceId: "i-1",
        expandSize: 40,
      }),
    );
    expect(await screen.findByText(/5 days/)).toBeInTheDocument();
    expect(screen.getByText("40 GB")).toBeInTheDocument();
    expect(screen.getByText("$ 3.00")).toBeInTheDocument();
  });

  it("confirms the expansion", async () => {
    const finishForm = jest.fn();
    render(
      <ExpansionInstance
        instanceInfoObj={{ id: "i-1", endTime: "0" }}
        finishForm={finishForm}
        expandSize={10}
      />,
    );
    await waitFor(() => expect(mockAmount).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(finishForm).toHaveBeenCalledWith(true);
  });

  it("cancels the expansion", async () => {
    const finishForm = jest.fn();
    render(
      <ExpansionInstance
        instanceInfoObj={{ id: "i-1", endTime: "0" }}
        finishForm={finishForm}
        expandSize={10}
      />,
    );
    await waitFor(() => expect(mockAmount).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(finishForm).toHaveBeenCalledWith(false);
  });
});
