import { fireEvent, render, screen } from "@testing-library/react";

const dispatch = jest.fn();
const push = jest.fn();
let mockInfoDialog: any = {
  title: "Heads up",
  description: "Please note this important thing",
  confirmRedirect: "",
  emphasisContent: "",
};

jest.mock("@/store", () => ({
  useAppDispatch: () => dispatch,
  useAppSelector: (sel: any) => sel({ config: { infoDialog: mockInfoDialog } }),
}));

jest.mock("@/store/slice/configSlice", () => ({
  closeInfoDialog: () => ({ type: "config/closeInfoDialog" }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import InfoDialog from "@/components/ui/standard/info-dialog";

beforeEach(() => {
  jest.clearAllMocks();
  mockInfoDialog = {
    title: "Heads up",
    description: "Please note this important thing",
    confirmRedirect: "",
    emphasisContent: "",
  };
});

describe("InfoDialog", () => {
  it("renders when both title and description are present", () => {
    render(<InfoDialog />);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(
      screen.getByText("Please note this important thing"),
    ).toBeInTheDocument();
  });

  it("does not open when description is missing", () => {
    mockInfoDialog = { ...mockInfoDialog, description: "" };
    render(<InfoDialog />);
    expect(screen.queryByText("Heads up")).not.toBeInTheDocument();
  });

  it("dispatches close on OK", () => {
    render(<InfoDialog />);
    fireEvent.click(screen.getByText("OK"));
    expect(dispatch).toHaveBeenCalledWith({ type: "config/closeInfoDialog" });
  });

  it("emphasizes the matching substring in bold", () => {
    mockInfoDialog = {
      title: "T",
      description: "before KEYWORD after",
      confirmRedirect: "",
      emphasisContent: "KEYWORD",
    };
    render(<InfoDialog />);
    const bold = screen.getByText("KEYWORD");
    expect(bold).toHaveClass("font-bold");
  });
});
