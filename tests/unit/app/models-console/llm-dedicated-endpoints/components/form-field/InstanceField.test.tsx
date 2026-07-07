import { fireEvent, render, screen } from "@testing-library/react";
import InstanceField from "@/app/models-console/llm-dedicated-endpoints/components/form-field/InstanceField";

jest.mock("@/lib/utils/money", () => ({
  dealMoneyWithPrecision: (v: number) => Math.round(v * 1000) / 1000,
}));

jest.mock("@/app/components/Tooltip", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const trackClick = jest.fn();
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: (...a: unknown[]) => trackClick(...a) },
}));
jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    MODELS_CONSOLE: { LLM_DE_SELECT_GPU_INSTANCE: "select-gpu" },
  },
}));

// RadioGroup: expose a button per item to trigger onValueChange
jest.mock("@/components/ui/radio-group", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");
  const Ctx = React.createContext((_: string) => {});
  return {
    RadioGroup: ({
      children,
      onValueChange,
    }: {
      children: React.ReactNode;
      onValueChange: (v: string) => void;
    }) => <Ctx.Provider value={onValueChange}>{children}</Ctx.Provider>,
    RadioGroupItem: ({ value }: { value: string }) => {
      const onValueChange = React.useContext(Ctx);
      return (
        <button type="button" onClick={() => onValueChange(value)}>
          {`pick-${value}`}
        </button>
      );
    },
  };
});

// Select: render a native select wired to onValueChange
jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <div data-testid="select" data-value={value}>
      <select
        aria-label="gpu-count"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

function inst(over: Record<string, unknown> = {}) {
  return {
    id: "a100",
    gpuName: "A100",
    displayName: "A100 80G",
    discount: 0.001,
    pricePrecision: 4,
    gpuNum: 1,
    gpuNums: [1, 2],
    ...over,
  } as never;
}

describe("InstanceField", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows empty message when no instances (create flow)", () => {
    render(
      <InstanceField
        selectedInstance={null}
        instanceList={[]}
        setInstanceList={jest.fn()}
        onChange={jest.fn()}
      />,
    );
    expect(
      screen.getByText(
        "Insufficient GPU resources. Please retry after some time.",
      ),
    ).toBeInTheDocument();
  });

  it("shows editing empty message when isEditing", () => {
    render(
      <InstanceField
        selectedInstance={null}
        instanceList={[]}
        setInstanceList={jest.fn()}
        onChange={jest.fn()}
        isEditing
      />,
    );
    expect(
      screen.getByText("There is currently no recommended GPU configuration."),
    ).toBeInTheDocument();
  });

  it("renders instance cards and selecting fires analytics + onChange", () => {
    const onChange = jest.fn();
    render(
      <InstanceField
        selectedInstance={null}
        instanceList={[inst()]}
        setInstanceList={jest.fn()}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("A100 80G")).toBeInTheDocument();
    fireEvent.click(screen.getByText("pick-a100"));
    expect(trackClick).toHaveBeenCalledWith("select-gpu", { gpuName: "A100" });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "a100" }),
    );
  });

  it("changing gpu count updates instance list and notifies for selected", () => {
    const onChange = jest.fn();
    const setInstanceList = jest.fn();
    render(
      <InstanceField
        selectedInstance={inst({ gpuNum: 1 })}
        instanceList={[inst({ gpuNum: 1 })]}
        setInstanceList={setInstanceList}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("gpu-count"), {
      target: { value: "2" },
    });
    expect(setInstanceList).toHaveBeenCalledWith([
      expect.objectContaining({ id: "a100", gpuNum: 2 }),
    ]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ gpuNum: 2 }),
    );
  });
});
