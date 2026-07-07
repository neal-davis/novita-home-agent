import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CreateSavingsPlan from "@/app/gpus-console/instances/components/createSavingsPlan";
import { reqCreateSavingPlans } from "@/api/gpu-instance/savingsPlans";
import { reqGetSavingPlanTemplates } from "@/api/gpu-instance/explore";
import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import { reqMyWallet } from "@/api/gpu-instance/billing";
import { message } from "@/components/ui/standard/notify";

jest.mock("@/api/gpu-instance/savingsPlans", () => ({
  reqCreateSavingPlans: jest.fn(),
}));
jest.mock("@/api/gpu-instance/explore", () => ({
  reqGetSavingPlanTemplates: jest.fn(),
}));
jest.mock("@/api/gpu-instance/userInfo", () => ({
  reqUserInfo: jest.fn(),
}));
jest.mock("@/api/gpu-instance/billing", () => ({
  reqMyWallet: jest.fn(),
}));
jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <div>
      <button type="button" onClick={() => onValueChange("tpl-2")}>
        pick template 2
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
}));

const mockReqCreateSavingPlans = reqCreateSavingPlans as jest.Mock;
const mockReqGetSavingPlanTemplates = reqGetSavingPlanTemplates as jest.Mock;
const mockReqUserInfo = reqUserInfo as jest.Mock;
const mockReqMyWallet = reqMyWallet as jest.Mock;
const mockMessageSuccess = message.success as jest.Mock;

const instanceInfo = {
  id: "inst-1",
  productId: "prod-1",
  productName: "RTX 4090",
  gpuNum: 2,
  instancePrice: "100",
};

const templates = [
  { id: "tpl-1", name: "1 Month", price: "5000", days: 30 },
  { id: "tpl-2", name: "3 Month", price: "4000", days: 90 },
];

describe("CreateSavingsPlan modal", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockReqGetSavingPlanTemplates.mockResolvedValue({ data: templates });
    mockReqUserInfo.mockResolvedValue({ voucherBalance: 100 });
    mockReqMyWallet.mockResolvedValue({
      balance: 100000,
      price: 0,
      hours: 0,
    });
    mockReqCreateSavingPlans.mockResolvedValue({});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("loads templates and renders the plan summary on step 0", async () => {
    render(
      <CreateSavingsPlan instanceInfo={instanceInfo} finishForm={jest.fn()} />,
    );

    expect(screen.getByText("New Savings Plan")).toBeInTheDocument();
    expect(screen.getByText(/RTX 4090 x 2/)).toBeInTheDocument();
    expect(screen.getByText("What are savings plans?")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockReqGetSavingPlanTemplates).toHaveBeenCalledWith({
        productId: "prod-1",
      });
      expect(
        screen.getAllByText(/1 Month Savings Plan/).length,
      ).toBeGreaterThan(0);
    });
    expect(mockReqGetSavingPlanTemplates).toHaveBeenCalledTimes(1);
    expect(mockReqUserInfo).toHaveBeenCalledTimes(1);
    expect(mockReqMyWallet).toHaveBeenCalledTimes(1);
  });

  it("advances to step 1 and charges when the balance is sufficient", async () => {
    const finishForm = jest.fn();
    render(
      <CreateSavingsPlan instanceInfo={instanceInfo} finishForm={finishForm} />,
    );

    await waitFor(() =>
      expect(
        screen.getAllByText(/1 Month Savings Plan/).length,
      ).toBeGreaterThan(0),
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(
      screen.getByText(/Your account will instantly be charged/),
    ).toBeInTheDocument();

    const chargeBtn = screen.getByRole("button", { name: /Charge/ });
    fireEvent.click(chargeBtn);

    await waitFor(() => {
      expect(mockReqCreateSavingPlans).toHaveBeenCalledWith({
        instanceId: "inst-1",
        templateId: "tpl-1",
      });
      expect(mockMessageSuccess).toHaveBeenCalledWith("success");
      expect(finishForm).toHaveBeenCalled();
    });
  });

  it("warns and disables charge when the balance is insufficient", async () => {
    mockReqUserInfo.mockResolvedValue({ voucherBalance: 0 });
    mockReqMyWallet.mockResolvedValue({ balance: 0, price: 0, hours: 0 });

    render(
      <CreateSavingsPlan instanceInfo={instanceInfo} finishForm={jest.fn()} />,
    );

    await waitFor(() =>
      expect(
        screen.getAllByText(/1 Month Savings Plan/).length,
      ).toBeGreaterThan(0),
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(
      screen.getByText(
        "The cost of this Savings Plan is greater than your current balance",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Charge/ }));
    expect(mockReqCreateSavingPlans).not.toHaveBeenCalled();
  });

  it("navigates back from step 1 to step 0", async () => {
    render(
      <CreateSavingsPlan instanceInfo={instanceInfo} finishForm={jest.fn()} />,
    );

    await waitFor(() =>
      expect(
        screen.getAllByText(/1 Month Savings Plan/).length,
      ).toBeGreaterThan(0),
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("updates the selected template and recomputes the charge", async () => {
    render(
      <CreateSavingsPlan instanceInfo={instanceInfo} finishForm={jest.fn()} />,
    );

    await waitFor(() =>
      expect(
        screen.getAllByText(/1 Month Savings Plan/).length,
      ).toBeGreaterThan(0),
    );
    fireEvent.click(screen.getByRole("button", { name: "pick template 2" }));

    await waitFor(() => {
      expect(
        screen.getAllByText(/3 Month Savings Plan/).length,
      ).toBeGreaterThan(0);
    });
  });

  it("tolerates failed userInfo and wallet requests", async () => {
    mockReqUserInfo.mockRejectedValue(new Error("nope"));
    mockReqMyWallet.mockRejectedValue(new Error("nope"));

    render(
      <CreateSavingsPlan instanceInfo={instanceInfo} finishForm={jest.fn()} />,
    );

    await waitFor(() => {
      expect(mockReqUserInfo).toHaveBeenCalled();
      expect(mockReqMyWallet).toHaveBeenCalled();
    });
    expect(screen.getByText("New Savings Plan")).toBeInTheDocument();
  });
});
