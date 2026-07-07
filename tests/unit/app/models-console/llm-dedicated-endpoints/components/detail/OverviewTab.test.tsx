import { render, screen, fireEvent } from "@testing-library/react";
import OverviewTab from "@/app/models-console/llm-dedicated-endpoints/components/detail/OverviewTab";

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/HealthStatus",
  () => ({
    __esModule: true,
    default: ({ status }: { status: string }) => <div>health:{status}</div>,
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/ReplicasInfo",
  () => ({
    __esModule: true,
    default: ({
      minReplicas,
      maxReplicas,
    }: {
      minReplicas: number;
      maxReplicas: number;
    }) => (
      <div>
        replicas:{minReplicas}-{maxReplicas}
      </div>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/KeyMetrics",
  () => ({
    __esModule: true,
    default: ({ onViewAll }: { onViewAll?: () => void }) => (
      <button type="button" onClick={onViewAll} disabled={!onViewAll}>
        key-metrics
      </button>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/QuickStart",
  () => ({
    __esModule: true,
    default: ({
      endpointUrl,
      modelId,
    }: {
      endpointUrl: string;
      modelId: string;
    }) => (
      <div>
        quickstart:{endpointUrl}:{modelId}
      </div>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/EngineConfigOverview",
  () => ({
    __esModule: true,
    default: ({
      onEditAutoscaling,
      onEditLora,
    }: {
      onEditAutoscaling?: () => void;
      onEditLora?: () => void;
    }) => (
      <div>
        <button type="button" onClick={onEditAutoscaling}>
          edit-autoscaling
        </button>
        <button type="button" onClick={onEditLora}>
          edit-lora
        </button>
      </div>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/RecentActivity",
  () => ({
    __esModule: true,
    default: ({ records }: { records: unknown[] }) => (
      <div>recent:{records.length}</div>
    ),
  }),
);

function makeData(over: Record<string, unknown> = {}) {
  return {
    id: "ep-1",
    status: "running",
    phase: "",
    url: "https://api.test/v1",
    baseModel: { modelId: "meta/m" },
    replica: 2,
    readyReplica: 2,
    scalingPolicy: { minReplicas: 1, maxReplicas: 4 },
    ...over,
  } as never;
}

describe("OverviewTab", () => {
  it("renders all sections with endpoint data", () => {
    render(
      <OverviewTab
        endpointData={makeData()}
        changeHistoryRecords={
          [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }] as never
        }
        isChangeHistoryLoading={false}
      />,
    );
    expect(screen.getByText("health:running")).toBeInTheDocument();
    expect(screen.getByText("replicas:1-4")).toBeInTheDocument();
    expect(
      screen.getByText("quickstart:https://api.test/v1:meta/m"),
    ).toBeInTheDocument();
    // recent activity sliced to 3
    expect(screen.getByText("recent:3")).toBeInTheDocument();
  });

  it("edit autoscaling switches to settings tab", () => {
    const onSwitchTab = jest.fn();
    render(
      <OverviewTab
        endpointData={makeData()}
        onSwitchTab={onSwitchTab}
        changeHistoryRecords={[]}
        isChangeHistoryLoading={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "edit-autoscaling" }));
    expect(onSwitchTab).toHaveBeenCalledWith("settings");
  });

  it("key metrics view-all switches to metrics tab", () => {
    const onSwitchTab = jest.fn();
    render(
      <OverviewTab
        endpointData={makeData()}
        onSwitchTab={onSwitchTab}
        changeHistoryRecords={[]}
        isChangeHistoryLoading={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "key-metrics" }));
    expect(onSwitchTab).toHaveBeenCalledWith("metrics");
  });

  it("uses fallback replica range when no scaling policy", () => {
    render(
      <OverviewTab
        endpointData={makeData({ scalingPolicy: undefined })}
        changeHistoryRecords={[]}
        isChangeHistoryLoading={false}
      />,
    );
    expect(screen.getByText("replicas:1-1")).toBeInTheDocument();
  });
});
