import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import EngineInfo from "@/app/models-console/llm-dedicated-endpoints/components/EngineInfo";

const onChangeRef: { fn?: (v: unknown) => void } = {};
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/EngineConfig",
  () => ({
    __esModule: true,
    default: ({
      value,
      onChange,
    }: {
      value: { engineType: string; maxNumSeqs?: number };
      onChange: (v: unknown) => void;
    }) => {
      onChangeRef.fn = onChange;
      return (
        <div>
          <span>engine-config:{value.engineType}</span>
          <button
            type="button"
            onClick={() =>
              onChange({
                engineType: "sglang",
                engineVersion: "2.0",
                maxNumSeqs: 256,
                isSuffixDecodingEnable: true,
              })
            }
          >
            change-engine
          </button>
        </div>
      );
    },
  }),
);

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div>{children}</div> : null),
  AlertDialogAction: ({
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
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const engine = {
  type: "vllm",
  version: "1.0",
  config: { maxNumSeqs: 128 },
} as never;

function setup(props: Record<string, unknown> = {}) {
  const handleUpdate = jest.fn().mockResolvedValue(undefined);
  const syncEndpointData = jest.fn().mockResolvedValue(undefined);
  render(
    <EngineInfo
      engine={engine}
      isSuffixDecodingEnable={false}
      handleUpdate={handleUpdate}
      syncEndpointData={syncEndpointData}
      {...props}
    />,
  );
  return { handleUpdate, syncEndpointData };
}

describe("EngineInfo", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders read-only view with engine config values", () => {
    setup();
    expect(screen.getByText("Engine Configuration")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument(); // suffix decoding off
  });

  it("shows On when suffix decoding enabled", () => {
    setup({ isSuffixDecodingEnable: true });
    expect(screen.getByText("On")).toBeInTheDocument();
  });

  it("shows dash when maxNumSeqs missing", () => {
    setup({ engine: { type: "vllm", version: "1.0", config: {} } });
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("Edit disabled when locked", () => {
    setup({ isLocked: true });
    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();
  });

  it("enters edit mode and shows warning + EngineConfig", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      screen.getByText(
        "Saving changes will trigger a rolling restart of the engine",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("engine-config:vllm")).toBeInTheDocument();
  });

  it("Cancel exits edit mode", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("Save shows confirm dialog; confirming calls handleUpdate with edited engine", async () => {
    const { handleUpdate, syncEndpointData } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "change-engine" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Save & Restart Engine" }),
    );
    expect(screen.getByText("Restart Engine?")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Confirm & Restart" }),
      );
    });
    await waitFor(() =>
      expect(handleUpdate).toHaveBeenCalledWith({
        engine: expect.objectContaining({ type: "sglang", version: "2.0" }),
        isSuffixDecodingEnable: true,
      }),
    );
    expect(syncEndpointData).toHaveBeenCalled();
  });
});
