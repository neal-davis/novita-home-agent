import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DedicatedEndpointDetail from "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointDetail";

const mockHandleUpdate = jest.fn();
const mockSetActiveTab = jest.fn();
const mockSetShowTerminateModal = jest.fn();
const mockSetShowDeleteConfirm = jest.fn();
const mockSuccess = jest.fn();
const mockError = jest.fn();

// Configurable hook return; mutated per-test before render.
const hookReturn: any = {
  activeTab: "overview",
  showTerminateModal: false,
  showDeleteConfirm: false,
  indicatorStyle: { left: 0, width: 0 },
  changeHistoryRecords: [],
  changeHistoryTotal: 0,
  isChangeHistoryLoading: false,
  isChangeHistoryLoadingMore: false,
  loadMoreChangeHistory: jest.fn(),
  modelDisplayName: "Llama",
  formattedCreateTime: "1 day ago",
  primaryActions: [],
  canTerminate: true,
  canDelete: false,
  canPlayground: true,
  tabsRef: { current: null },
  setActiveTab: mockSetActiveTab,
  setShowTerminateModal: mockSetShowTerminateModal,
  setShowDeleteConfirm: mockSetShowDeleteConfirm,
  handleUpdate: mockHandleUpdate,
};

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointDetail/useDedicatedEndpointDetail",
  () => ({
    useDedicatedEndpointDetail: () => hookReturn,
  }),
);

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    success: (...args: any[]) => mockSuccess(...args),
    error: (...args: any[]) => mockError(...args),
  },
}));

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointDetail/DedicatedEndpointHeader",
  () => ({
    DedicatedEndpointHeader: ({ onBack, onTerminate, onDelete }: any) => (
      <div>
        <span>header-{`modelDisplayName`}</span>
        <button onClick={onBack}>back</button>
        <button onClick={onTerminate}>terminate</button>
        <button onClick={onDelete}>delete</button>
      </div>
    ),
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail",
  () => ({
    OverviewTab: ({ onEditLora }: any) => (
      <div>
        <span>overview-tab</span>
        <button onClick={onEditLora}>overview-edit-lora</button>
      </div>
    ),
    MetricsTab: () => <div>metrics-tab</div>,
    SettingsTab: ({ onEditLora }: any) => (
      <div>
        <span>settings-tab</span>
        <button onClick={onEditLora}>settings-edit-lora</button>
      </div>
    ),
    DeployPipeline: ({ status }: any) => <div>pipeline-{status}</div>,
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/TerminateEndpointModal",
  () => ({
    __esModule: true,
    default: ({ show }: any) => (show ? <div>terminate-modal</div> : null),
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/DeleteEndpointConfirm",
  () => ({
    __esModule: true,
    default: ({ show }: any) => (show ? <div>delete-modal</div> : null),
  }),
);

let adapterSaveCb: ((items: any[]) => Promise<void>) | null = null;
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/AddAdapterModal",
  () => ({
    __esModule: true,
    default: ({ show, onClose, onAdapterSave, baseModel, provider }: any) => {
      adapterSaveCb = onAdapterSave;
      return show ? (
        <div>
          <span>adapter-modal-{provider}</span>
          <span>base-{baseModel}</span>
          <button onClick={onClose}>close-adapter</button>
        </div>
      ) : null;
    },
  }),
);

function makeEndpoint(overrides: Partial<LLMDedicatedEndpoint> = {}): any {
  return {
    id: "ep-1",
    name: "my-endpoint",
    status: "running",
    phase: "ready",
    createTime: "2024-01-01",
    baseModel: { modelId: "owner/base", provider: "huggingface" },
    loras: [],
    ...overrides,
  };
}

function resetHook() {
  hookReturn.activeTab = "overview";
  hookReturn.showTerminateModal = false;
  hookReturn.showDeleteConfirm = false;
  hookReturn.canTerminate = true;
  hookReturn.canDelete = false;
}

describe("DedicatedEndpointDetail", () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    resetHook();
    adapterSaveCb = null;
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => consoleErrorSpy.mockRestore());

  it("renders overview tab and basic chrome", () => {
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint()}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("overview-tab")).toBeInTheDocument();
    expect(screen.getByText("pipeline-running")).toBeInTheDocument();
    // three tab triggers
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Metrics")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders metrics tab when activeTab=metrics", () => {
    hookReturn.activeTab = "metrics";
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint()}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("metrics-tab")).toBeInTheDocument();
    expect(screen.queryByText("overview-tab")).not.toBeInTheDocument();
  });

  it("renders settings tab when activeTab=settings", () => {
    hookReturn.activeTab = "settings";
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint()}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("settings-tab")).toBeInTheDocument();
  });

  it("clicking a tab button calls setActiveTab", () => {
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint()}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByText("Metrics"));
    expect(mockSetActiveTab).toHaveBeenCalledWith("metrics");
  });

  it("header back / terminate / delete wire to handlers", () => {
    const goToListPage = jest.fn();
    render(
      <DedicatedEndpointDetail
        goToListPage={goToListPage}
        endpointData={makeEndpoint()}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByText("back"));
    expect(goToListPage).toHaveBeenCalled();
    fireEvent.click(screen.getByText("terminate"));
    expect(mockSetShowTerminateModal).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByText("delete"));
    expect(mockSetShowDeleteConfirm).toHaveBeenCalledWith(true);
  });

  it("shows terminate / delete modals when hook flags are set", () => {
    hookReturn.showTerminateModal = true;
    hookReturn.showDeleteConfirm = true;
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint()}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.getByText("terminate-modal")).toBeInTheDocument();
    expect(screen.getByText("delete-modal")).toBeInTheDocument();
  });

  it("opens the LoRA modal with huggingface provider for non-self_hosting base model", () => {
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint()}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    expect(screen.queryByText(/adapter-modal/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("overview-edit-lora"));
    expect(screen.getByText("adapter-modal-huggingface")).toBeInTheDocument();
    expect(screen.getByText("base-owner/base")).toBeInTheDocument();
    fireEvent.click(screen.getByText("close-adapter"));
    expect(screen.queryByText(/adapter-modal/)).not.toBeInTheDocument();
  });

  it("uses novita provider when base model provider is self_hosting", () => {
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint({
          baseModel: { modelId: "owner/base", provider: "self_hosting" } as any,
        })}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByText("overview-edit-lora"));
    expect(screen.getByText("adapter-modal-novita")).toBeInTheDocument();
  });

  it("saves LoRAs: preserves existing entries and creates new HF entries with token", async () => {
    mockHandleUpdate.mockResolvedValue({});
    const syncEndpointData = jest.fn().mockResolvedValue(undefined);
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint({
          baseModel: {
            modelId: "owner/base",
            provider: "huggingface",
            token: "hf-token",
          } as any,
          loras: [
            {
              modelId: "owner/existing",
              provider: "huggingface",
              name: "old-name",
              revision: "main",
              token: "ex-token",
            },
          ] as any,
        })}
        syncEndpointData={syncEndpointData}
      />,
    );
    fireEvent.click(screen.getByText("overview-edit-lora"));
    expect(adapterSaveCb).toBeTruthy();
    await adapterSaveCb!([
      { modelId: "owner/existing", modelAlias: "new-alias" },
      { modelId: "owner/brand-new", modelAlias: "fresh" },
    ]);
    await waitFor(() => expect(mockHandleUpdate).toHaveBeenCalled());
    const payload = mockHandleUpdate.mock.calls[0][0];
    // existing entry preserves provider/revision/token, name updated
    expect(payload.loras[0]).toEqual({
      modelId: "owner/existing",
      provider: "huggingface",
      name: "new-alias",
      revision: "main",
      token: "ex-token",
    });
    // new entry: hf provider + inherits base token + name
    expect(payload.loras[1]).toMatchObject({
      provider: "huggingface",
      modelId: "owner/brand-new",
      name: "fresh",
      token: "hf-token",
    });
    expect(syncEndpointData).toHaveBeenCalled();
    expect(mockSuccess).toHaveBeenCalledWith("LoRA adapters updated");
  });

  it("saves LoRAs for novita provider: new entries get self_hosting and no token", async () => {
    mockHandleUpdate.mockResolvedValue({});
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint({
          baseModel: {
            modelId: "owner/base",
            provider: "self_hosting",
          } as any,
          loras: [],
        })}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByText("overview-edit-lora"));
    await adapterSaveCb!([{ modelId: "owner/new", modelAlias: "" }]);
    await waitFor(() => expect(mockHandleUpdate).toHaveBeenCalled());
    const payload = mockHandleUpdate.mock.calls[0][0];
    expect(payload.loras[0]).toEqual({
      provider: "self_hosting",
      modelId: "owner/new",
    });
    expect(payload.loras[0].token).toBeUndefined();
  });

  it("surfaces an error when saving LoRAs fails", async () => {
    mockHandleUpdate.mockRejectedValue(new Error("boom"));
    render(
      <DedicatedEndpointDetail
        goToListPage={jest.fn()}
        endpointData={makeEndpoint()}
        syncEndpointData={jest.fn().mockResolvedValue(undefined)}
      />,
    );
    fireEvent.click(screen.getByText("overview-edit-lora"));
    await expect(
      adapterSaveCb!([{ modelId: "x", modelAlias: "" }]),
    ).rejects.toThrow("boom");
    expect(mockError).toHaveBeenCalledWith("Failed to update LoRA adapters");
  });
});
