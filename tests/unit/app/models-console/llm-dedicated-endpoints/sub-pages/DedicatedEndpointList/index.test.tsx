import { render, screen, fireEvent } from "@testing-library/react";
import DedicatedEndpointList from "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointList";

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/GetStarted",
  () => ({
    __esModule: true,
    default: ({ goToCreateEndpoint }: { goToCreateEndpoint: () => void }) => (
      <button type="button" onClick={goToCreateEndpoint}>
        get-started
      </button>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/DEModelCard",
  () => ({
    __esModule: true,
    default: ({
      data,
      onClick,
    }: {
      data: { name: string };
      onClick: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        card:{data.name}
      </button>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/TerminateEndpointModal",
  () => ({
    __esModule: true,
    default: ({ show }: { show: boolean }) =>
      show ? <div>terminate-modal</div> : null,
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/DeleteEndpointConfirm",
  () => ({
    __esModule: true,
    default: ({ show }: { show: boolean }) =>
      show ? <div>delete-modal</div> : null,
  }),
);
jest.mock("@/components/ui/standard/no-data", () => ({
  NoData: ({ title }: { title: string }) => <div>nodata:{title}</div>,
}));
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));
jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: { MODELS_CONSOLE: { LLM_DE_CREATE_ENDPOINT_ENTRY: "x" } },
}));
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointList/ListSkeleton",
  () => ({
    ListSkeleton: () => <div>skeleton</div>,
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointList/ListToolbar",
  () => ({
    ListToolbar: ({ onCreateEndpoint }: { onCreateEndpoint: () => void }) => (
      <button type="button" onClick={onCreateEndpoint}>
        toolbar-create
      </button>
    ),
  }),
);

// Control hook state per test
const hookReturn: Record<string, unknown> = {};
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointList/useDedicatedEndpointList",
  () => ({
    useDedicatedEndpointList: () => hookReturn,
  }),
);

function baseHook(over: Record<string, unknown> = {}) {
  Object.assign(hookReturn, {
    isInitialLoad: false,
    isShowGetStarted: false,
    showTerminateModal: false,
    showDeleteConfirm: false,
    targetEndpoint: null,
    handleCreateEndpoint: jest.fn(),
    handleRedeploy: jest.fn(),
    handleDelete: jest.fn(),
    handleTerminate: jest.fn(),
    handleWake: jest.fn(),
    closeTerminateModal: jest.fn(),
    closeDeleteConfirm: jest.fn(),
    ...over,
  });
}

function setup(props: Record<string, unknown> = {}) {
  return render(
    <DedicatedEndpointList
      goToCreateEndpoint={jest.fn()}
      goToDetail={jest.fn()}
      dedicatedEndpointList={[{ id: "1", name: "ep1" }] as never}
      totalCount={1}
      loading={false}
      filterStatus=""
      filterEndpointName=""
      onStatusChange={jest.fn()}
      onEndpointNameChange={jest.fn()}
      refreshList={jest.fn()}
      {...props}
    />,
  );
}

describe("DedicatedEndpointList", () => {
  beforeEach(() => {
    for (const k of Object.keys(hookReturn)) delete hookReturn[k];
  });

  it("shows skeleton on initial load", () => {
    baseHook({ isInitialLoad: true });
    setup();
    expect(screen.getByText("skeleton")).toBeInTheDocument();
  });

  it("shows GetStarted for new users", () => {
    baseHook({ isShowGetStarted: true });
    setup();
    expect(screen.getByText("get-started")).toBeInTheDocument();
  });

  it("renders card list when endpoints exist", () => {
    baseHook();
    setup();
    expect(screen.getByText("card:ep1")).toBeInTheDocument();
    expect(screen.getByText("toolbar-create")).toBeInTheDocument();
  });

  it("clicking card navigates to detail", () => {
    baseHook();
    const goToDetail = jest.fn();
    setup({ goToDetail });
    fireEvent.click(screen.getByText("card:ep1"));
    expect(goToDetail).toHaveBeenCalledWith({ id: "1", name: "ep1" });
  });

  it("shows NoData when list empty but not get-started", () => {
    baseHook();
    setup({ dedicatedEndpointList: [] });
    expect(
      screen.getByText("nodata:No endpoints match your filters"),
    ).toBeInTheDocument();
  });

  it("renders terminate modal when target set and show true", () => {
    baseHook({
      targetEndpoint: { id: "1", name: "ep1", status: "running" },
      showTerminateModal: true,
    });
    setup();
    expect(screen.getByText("terminate-modal")).toBeInTheDocument();
  });

  it("renders delete modal when target set and show true", () => {
    baseHook({
      targetEndpoint: { id: "1", name: "ep1", status: "terminated" },
      showDeleteConfirm: true,
    });
    setup();
    expect(screen.getByText("delete-modal")).toBeInTheDocument();
  });
});
