import { render, screen, fireEvent } from "@testing-library/react";
import SettingsTab from "@/app/models-console/llm-dedicated-endpoints/components/detail/SettingsTab";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/InstanceConfig",
  () => ({
    __esModule: true,
    default: ({ isLocked }: { isLocked: boolean }) => (
      <div>instance-config locked:{String(isLocked)}</div>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/EngineInfo",
  () => ({
    __esModule: true,
    default: ({ isLocked }: { isLocked: boolean }) => (
      <div>engine-info locked:{String(isLocked)}</div>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/AutoscalingInfo",
  () => ({
    __esModule: true,
    default: ({ isLocked }: { isLocked: boolean }) => (
      <div>autoscaling-info locked:{String(isLocked)}</div>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/ChangeHistory",
  () => ({
    __esModule: true,
    default: ({ total }: { total: number }) => (
      <div>change-history total:{total}</div>
    ),
  }),
);

function makeData(over: Record<string, unknown> = {}) {
  return {
    status: LLM_DE_STATUS.RUNNING,
    baseModel: { modelId: "meta/m" },
    resources: { gpu: { name: "A100", count: 2 } },
    engine: { type: "vllm", version: "1.0" },
    scalingPolicy: { enable: true, minReplicas: 1, maxReplicas: 4 },
    isSuffixDecodingEnable: false,
    name: "ep",
    loras: [],
    ...over,
  } as never;
}

function setup(over: Record<string, unknown> = {}) {
  render(
    <SettingsTab
      endpointData={makeData(over)}
      handleUpdate={jest.fn().mockResolvedValue(undefined)}
      syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      changeHistoryRecords={[]}
      changeHistoryTotal={7}
      isChangeHistoryLoading={false}
      isChangeHistoryLoadingMore={false}
      loadMoreChangeHistory={jest.fn().mockResolvedValue(undefined)}
    />,
  );
}

describe("SettingsTab", () => {
  it("renders all config sections unlocked when running", () => {
    setup();
    expect(
      screen.getByText("instance-config locked:false"),
    ).toBeInTheDocument();
    expect(screen.getByText("engine-info locked:false")).toBeInTheDocument();
    expect(
      screen.getByText("autoscaling-info locked:false"),
    ).toBeInTheDocument();
    expect(screen.getByText("change-history total:7")).toBeInTheDocument();
    // no lock warning when running
    expect(
      screen.queryByText(/Most settings are locked/),
    ).not.toBeInTheDocument();
  });

  it("shows lock warning and locks editors in transitioning state", () => {
    setup({ status: LLM_DE_STATUS.DEPLOYING });
    expect(screen.getByText(/Most settings are locked/)).toBeInTheDocument();
    expect(screen.getByText("engine-info locked:true")).toBeInTheDocument();
    expect(
      screen.getByText("autoscaling-info locked:true"),
    ).toBeInTheDocument();
  });

  it("terminated state: general locked but LoRA editable", () => {
    setup({ status: LLM_DE_STATUS.TERMINATED });
    // instance config uses LoRA-lock which is false for terminated
    expect(
      screen.getByText("instance-config locked:false"),
    ).toBeInTheDocument();
    expect(screen.getByText("engine-info locked:true")).toBeInTheDocument();
  });
});
