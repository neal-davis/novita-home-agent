import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import EndpointOperateBox from "@/app/models-console/llm-dedicated-endpoints/components/EndpointOperateBox";
import { restartLLMDedicatedEndpoint } from "@/api/dedicated-endpoint";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

jest.mock("@/api/dedicated-endpoint", () => ({
  restartLLMDedicatedEndpoint: jest.fn(),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/TerminateEndpointModal",
  () => ({
    __esModule: true,
    default: ({ show }: { show: boolean }) =>
      show ? <div>terminate-modal-open</div> : null,
  }),
);

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/DeleteEndpointConfirm",
  () => ({
    __esModule: true,
    default: ({ show, canDelete }: { show: boolean; canDelete: boolean }) =>
      show ? <div>delete-modal canDelete:{String(canDelete)}</div> : null,
  }),
);

const mockRestart = restartLLMDedicatedEndpoint as jest.Mock;

function setup(props: Record<string, unknown> = {}) {
  const syncEndpointData = jest.fn().mockResolvedValue(undefined);
  const goToListPage = jest.fn();
  render(
    <EndpointOperateBox
      endpointId="ep-1"
      endpointName="my-ep"
      endpointStatus={LLM_DE_STATUS.RUNNING}
      syncEndpointData={syncEndpointData}
      goToListPage={goToListPage}
      {...props}
    />,
  );
  return { syncEndpointData, goToListPage };
}

describe("EndpointOperateBox", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows Terminate button for running endpoint and opens modal", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    expect(screen.getByText("terminate-modal-open")).toBeInTheDocument();
  });

  it("shows Restart for terminated endpoint and calls API", async () => {
    mockRestart.mockResolvedValue({});
    const { syncEndpointData } = setup({
      endpointStatus: LLM_DE_STATUS.TERMINATED,
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    });
    await waitFor(() =>
      expect(mockRestart).toHaveBeenCalledWith({ id: "ep-1" }),
    );
    expect(syncEndpointData).toHaveBeenCalled();
  });

  it("opens delete confirm with canDelete reflecting terminated status", () => {
    setup({ endpointStatus: LLM_DE_STATUS.TERMINATED });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("delete-modal canDelete:true")).toBeInTheDocument();
  });

  it("delete confirm canDelete false for running endpoint", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      screen.getByText("delete-modal canDelete:false"),
    ).toBeInTheDocument();
  });
});
