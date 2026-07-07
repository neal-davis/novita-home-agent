import { render, screen, fireEvent, act } from "@testing-library/react";
import HFTokenIntegrationModal from "@/app/models-console/llm-dedicated-endpoints/components/HFTokenIntegrationModal";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

function setup(props: Record<string, unknown> = {}) {
  const onClose = jest.fn();
  const onTokenChange = jest.fn();
  render(
    <HFTokenIntegrationModal
      show
      onClose={onClose}
      onTokenChange={onTokenChange}
      {...props}
    />,
  );
  return { onClose, onTokenChange };
}

describe("HFTokenIntegrationModal", () => {
  beforeEach(() => jest.clearAllMocks());

  it("hidden when show false", () => {
    setup({ show: false });
    expect(screen.queryByText("Submit requirements")).not.toBeInTheDocument();
  });

  it("renders form with token input and link", () => {
    setup();
    expect(screen.getByText("Submit requirements")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Your Hugging Face access token"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "this link" })).toHaveAttribute(
      "href",
      "https://huggingface.co/settings/tokens",
    );
  });

  it("cancel triggers onClose", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("submitting saves the entered token and closes", async () => {
    const { onClose, onTokenChange } = setup();
    fireEvent.change(
      screen.getByPlaceholderText("Your Hugging Face access token"),
      { target: { value: "hf_abc" } },
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
    });
    expect(onTokenChange).toHaveBeenCalledWith("hf_abc");
    expect(onClose).toHaveBeenCalled();
  });
});
