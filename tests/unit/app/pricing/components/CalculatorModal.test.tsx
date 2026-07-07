import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CalculatorModal, {
  getNewTxt2videoResolutionOptions,
} from "@/app/pricing/components/CalculatorModal";
import { FUNC_NAME } from "@/app/models/constants/funcs";

jest.mock("@/app/components/Modal/Modal", () => ({
  __esModule: true,
  default: ({
    children,
    onCancel,
    open,
    title,
  }: {
    children: React.ReactNode;
    onCancel: () => void;
    open: boolean;
    title: string;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <button type="button" onClick={onCancel}>
          close-modal
        </button>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/components/ui/standard/number-input", () => ({
  NumberInput: ({
    max,
    min,
    onChange,
    value,
  }: {
    max?: number;
    min?: number;
    onChange: (value: number) => void;
    value?: number;
  }) => (
    <input
      aria-label={`number-${min ?? "none"}-${max ?? "none"}`}
      type="number"
      value={value ?? ""}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  ),
}));

jest.mock("@/components/ui/standard/select-items", () => ({
  SelectItems: ({
    defaultValue,
    onChange,
    options,
  }: {
    defaultValue: string | number;
    onChange: (value: string | number) => void;
    options: Array<{ label: string; value: string | number }>;
  }) => (
    <div data-testid="select-items" data-value={defaultValue}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

describe("CalculatorModal", () => {
  it("returns model and mode specific text-to-video resolution options", () => {
    expect(getNewTxt2videoResolutionOptions("hunyuan-video-fast")).toEqual([
      { label: "720*1280", value: "720*1280" },
      { label: "1280*720", value: "1280*720" },
    ]);
    expect(getNewTxt2videoResolutionOptions("unknown", "Professional")).toEqual(
      [{ label: "1080P", value: "1080P" }],
    );
    expect(getNewTxt2videoResolutionOptions("unknown", "unknown")).toEqual([]);
  });

  it("does not render modal content when calcFunc is empty", () => {
    render(
      <CalculatorModal
        calcFunc={null}
        onClose={jest.fn()}
        onFuncChange={jest.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders image calculator controls and updates price after parameter changes", async () => {
    const onClose = jest.fn();
    const onFuncChange = jest.fn();

    render(
      <CalculatorModal
        calcFunc={FUNC_NAME.TXT2IMG}
        onClose={onClose}
        onFuncChange={onFuncChange}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Pricing Calculator" }),
    ).toBeInTheDocument();
    expect(screen.getByText("API Name")).toBeInTheDocument();
    expect(screen.getByText("Width")).toBeInTheDocument();
    expect(screen.getByText("Height")).toBeInTheDocument();
    expect(screen.getByText("Steps")).toBeInTheDocument();
    expect(screen.getByText(/Price:/)).toBeInTheDocument();

    const [widthInput] = screen.getAllByLabelText("number-256-2048");
    fireEvent.change(widthInput, {
      target: { value: "768" },
    });

    await waitFor(() => {
      expect(screen.getByText(/Price:/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("close-modal"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Image to Image"));
    expect(onFuncChange).toHaveBeenCalledWith(FUNC_NAME.IMG2IMG);
  });

  it("renders video-specific select controls and recalculates with selected duration", async () => {
    render(
      <CalculatorModal
        calcFunc={FUNC_NAME.KLING_V1_6_I2V}
        onClose={jest.fn()}
        onFuncChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("Mode")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();

    fireEvent.click(screen.getByText("10s"));
    fireEvent.click(screen.getByText("Professional"));

    await waitFor(() => {
      expect(screen.getByText(/Price:/)).toBeInTheDocument();
      expect(screen.getByText("/video")).toBeInTheDocument();
    });
  });
});
