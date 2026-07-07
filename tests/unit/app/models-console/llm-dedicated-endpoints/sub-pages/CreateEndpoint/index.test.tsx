import { render, screen, fireEvent } from "@testing-library/react";
import CreateEndpoint from "@/app/models-console/llm-dedicated-endpoints/sub-pages/CreateEndpoint";

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/ModelField",
  () => ({
    __esModule: true,
    default: () => <div>model-field</div>,
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/GPUTileSelector",
  () => ({
    __esModule: true,
    default: () => <div>gpu-selector</div>,
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/AutoscalingConfig",
  () => ({
    __esModule: true,
    default: () => <div>autoscaling-config</div>,
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/EngineConfig",
  () => ({
    __esModule: true,
    default: () => <div>engine-config</div>,
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/PricePreviewPanel",
  () => ({
    __esModule: true,
    default: ({
      onSubmit,
      isLoading,
    }: {
      onSubmit: () => void;
      isLoading: boolean;
    }) => (
      <button type="button" onClick={onSubmit} disabled={isLoading}>
        price-submit
      </button>
    ),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/validation",
  () => ({
    createEndpointNameSchema: () => ({}),
    createAutoscalingSchema: () => ({}),
    createEngineSchema: () => ({}),
  }),
);
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/CreateEndpoint/CancelConfirmDialog",
  () => ({
    CancelConfirmDialog: ({
      open,
      onConfirm,
    }: {
      open: boolean;
      onConfirm: () => void;
    }) =>
      open ? (
        <div>
          cancel-dialog
          <button type="button" onClick={onConfirm}>
            confirm-discard
          </button>
        </div>
      ) : null,
  }),
);

const formState: Record<string, unknown> = {};
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/sub-pages/CreateEndpoint/useCreateEndpointForm",
  () => ({
    useCreateEndpointForm: () => formState,
  }),
);

function baseForm(over: Record<string, unknown> = {}) {
  Object.assign(formState, {
    endpointName: "",
    modelValue: { modelId: "" },
    instanceInfo: null,
    instanceList: null,
    autoscalingInfo: { enabled: true, minReplicas: 1, maxReplicas: 4 },
    engineValue: {},
    recommendedSpec: { engineType: "vllm", engineVersion: "1.0" },
    maxReplicasLimit: 8,
    modelCheckStatus: null,
    validationErrors: {},
    isInitializingModel: false,
    isLoading: false,
    refs: {
      nameFieldRef: { current: null },
      modelFieldRef: { current: null },
      instanceFieldRef: { current: null },
      autoscalingFieldRef: { current: null },
      engineFieldRef: { current: null },
    },
    setEndpointName: jest.fn(),
    clearValidationError: jest.fn(),
    validateField: jest.fn(),
    checkEndpointNameExists: jest.fn(),
    setModelValue: jest.fn(),
    setModelCheckStatus: jest.fn(),
    setInstanceList: jest.fn(),
    setInstanceInfo: jest.fn(),
    setAutoscalingInfo: jest.fn(),
    setEngineValue: jest.fn(),
    handleSubmit: jest.fn(),
    ...over,
  });
}

function setup(props: Record<string, unknown> = {}) {
  const goToListPage = jest.fn();
  const goToDetail = jest.fn();
  const utils = render(
    <CreateEndpoint
      goToListPage={goToListPage}
      goToDetail={goToDetail}
      {...props}
    />,
  );
  return { goToListPage, goToDetail, ...utils };
}

describe("CreateEndpoint", () => {
  beforeEach(() => {
    for (const k of Object.keys(formState)) delete formState[k];
  });

  it("renders all 5 steps", () => {
    baseForm();
    setup();
    expect(screen.getByText("Endpoint Name")).toBeInTheDocument();
    expect(screen.getByText("model-field")).toBeInTheDocument();
    // GPU step shows placeholder when no model / instanceList null
    expect(
      screen.getByText(
        "Please select a model first to see available GPU options.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("autoscaling-config")).toBeInTheDocument();
    expect(screen.getByText("engine-config")).toBeInTheDocument();
  });

  it("shows GPU skeleton when model chosen but instanceList not ready", () => {
    baseForm({ modelValue: { modelId: "meta/m" }, instanceList: null });
    const { container } = setup();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows GPU selector once instanceList available", () => {
    baseForm({ instanceList: [] });
    setup();
    expect(screen.getByText("gpu-selector")).toBeInTheDocument();
  });

  it("back with no content goes directly to list", () => {
    baseForm();
    const { goToListPage } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Back to Endpoints/ }));
    expect(goToListPage).toHaveBeenCalled();
  });

  it("back with content opens cancel dialog; confirm navigates", () => {
    baseForm({ endpointName: "draft" });
    const { goToListPage } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Back to Endpoints/ }));
    expect(screen.getByText("cancel-dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "confirm-discard" }));
    expect(goToListPage).toHaveBeenCalled();
  });

  it("submit button calls form.handleSubmit", () => {
    const handleSubmit = jest.fn();
    baseForm({ handleSubmit });
    setup();
    fireEvent.click(screen.getAllByRole("button", { name: "price-submit" })[0]);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("typing endpoint name updates state and validates; checks existence when long", () => {
    const setEndpointName = jest.fn();
    const checkEndpointNameExists = jest.fn();
    baseForm({ setEndpointName, checkEndpointNameExists });
    setup();
    fireEvent.change(
      screen.getByPlaceholderText("Please enter the endpoint name..."),
      { target: { value: "abcd" } },
    );
    expect(setEndpointName).toHaveBeenCalledWith("abcd");
    expect(checkEndpointNameExists).toHaveBeenCalledWith("abcd");
  });
});
