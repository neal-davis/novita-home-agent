import { render, screen, fireEvent } from "@testing-library/react";
import { DedicatedEndpointHeader } from "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointDetail/DedicatedEndpointHeader";

function makeData(over: Record<string, unknown> = {}) {
  return {
    id: "ep-1",
    name: "my-endpoint",
    url: "https://api.test/v1",
    resources: { gpu: { name: "A100", count: 2 } },
    createUserName: "alice",
    ...over,
  } as never;
}

function setup(over: Record<string, unknown> = {}) {
  const onBack = jest.fn();
  const onTerminate = jest.fn();
  const onDelete = jest.fn();
  render(
    <DedicatedEndpointHeader
      endpointData={makeData()}
      modelDisplayName="Meta M"
      formattedCreateTime="2h ago"
      primaryActions={[]}
      canTerminate
      canDelete={false}
      canPlayground={false}
      onBack={onBack}
      onTerminate={onTerminate}
      onDelete={onDelete}
      {...over}
    />,
  );
  return { onBack, onTerminate, onDelete };
}

describe("DedicatedEndpointHeader", () => {
  it("renders name, meta info (model, gpu, creator)", () => {
    setup();
    expect(screen.getByText("my-endpoint")).toBeInTheDocument();
    const metaRow = screen
      .getByText("Created:")
      .closest(".meta_row") as HTMLElement;
    expect(metaRow).toHaveTextContent(/Created:\s*2h ago/);
    expect(metaRow).toHaveTextContent(/Model:\s*Meta M/);
    expect(metaRow).toHaveTextContent(/GPU:\s*A100\s*×\s*2/);
    expect(metaRow).toHaveTextContent(/by\s*alice/);
  });

  it("shows Unknown creator when missing", () => {
    setup({ endpointData: makeData({ createUserName: "" }) });
    expect(screen.getByText("Created:").closest(".meta_row")).toHaveTextContent(
      /by\s*Unknown/,
    );
  });

  it("back button fires onBack", () => {
    const { onBack } = setup();
    fireEvent.click(screen.getByRole("button", { name: /Back to Endpoints/ }));
    expect(onBack).toHaveBeenCalled();
  });

  it("terminate button shown and fires onTerminate", () => {
    const { onTerminate } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Terminate" }));
    expect(onTerminate).toHaveBeenCalled();
  });

  it("delete button hidden when canDelete false, shown and fires when true", () => {
    const { onDelete } = setup({ canDelete: true, canTerminate: false });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders primary actions and fires their handlers", () => {
    const onClick = jest.fn();
    setup({ primaryActions: [{ key: "wake", label: "Wake Up", onClick }] });
    fireEvent.click(screen.getByRole("button", { name: "Wake Up" }));
    expect(onClick).toHaveBeenCalled();
  });

  it("renders Playground link when canPlayground", () => {
    setup({ canPlayground: true });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("/models/llm/ep-1"),
    );
  });
});
