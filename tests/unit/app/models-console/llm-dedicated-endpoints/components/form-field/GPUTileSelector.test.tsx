import { fireEvent, render, screen } from "@testing-library/react";
import GPUTileSelector from "@/app/models-console/llm-dedicated-endpoints/components/form-field/GPUTileSelector";

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
  default: { trackClick: (...args: unknown[]) => trackClick(...args) },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    MODELS_CONSOLE: { LLM_DE_SELECT_GPU_INSTANCE: "select-gpu" },
  },
}));

function inst(over: Record<string, unknown> = {}) {
  return {
    id: "a100",
    gpuName: "A100",
    displayName: "A100 80G",
    discount: 0.001,
    pricePrecision: 4,
    gpuNum: 1,
    gpuNums: [1, 2, 4],
    ...over,
  } as never;
}

describe("GPUTileSelector", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows empty message (create flow) when list empty", () => {
    render(
      <GPUTileSelector
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

  it("shows editing-specific empty message when isEditing", () => {
    render(
      <GPUTileSelector
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

  it("renders tiles with price and selecting a tile fires analytics + onChange", () => {
    const onChange = jest.fn();
    render(
      <GPUTileSelector
        selectedInstance={null}
        instanceList={[inst()]}
        setInstanceList={jest.fn()}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("A100 80G")).toBeInTheDocument();
    // 0.001*3600=3.6 -> $3.600
    expect(screen.getByText("$3.600")).toBeInTheDocument();
    fireEvent.click(screen.getByText("A100 80G"));
    expect(trackClick).toHaveBeenCalledWith("select-gpu", { gpuName: "A100" });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: "a100" }),
    );
  });

  it("shows count selector for selected instance and updates gpuNum", () => {
    const onChange = jest.fn();
    const setInstanceList = jest.fn();
    render(
      <GPUTileSelector
        selectedInstance={inst({ gpuNum: 1 })}
        instanceList={[inst({ gpuNum: 1 })]}
        setInstanceList={setInstanceList}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("GPU Count:")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(setInstanceList).toHaveBeenCalledWith([
      expect.objectContaining({ id: "a100", gpuNum: 2 }),
    ]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ gpuNum: 2 }),
    );
  });

  it("does not render count selector when no instance selected", () => {
    render(
      <GPUTileSelector
        selectedInstance={null}
        instanceList={[inst()]}
        setInstanceList={jest.fn()}
        onChange={jest.fn()}
      />,
    );
    expect(screen.queryByText("GPU Count:")).not.toBeInTheDocument();
  });
});
