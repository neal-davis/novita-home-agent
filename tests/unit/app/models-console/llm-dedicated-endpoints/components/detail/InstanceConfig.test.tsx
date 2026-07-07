import { render, screen, fireEvent } from "@testing-library/react";
import InstanceConfig from "@/app/models-console/llm-dedicated-endpoints/components/detail/InstanceConfig";

jest.mock("@/app/components/Tooltip", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  HoverCardTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  HoverCardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const baseModel = { modelId: "meta/m" } as never;
const resources = { gpu: { name: "A100", count: 2 } } as never;
const engine = { type: "vllm", version: "1.0" } as never;

describe("InstanceConfig", () => {
  it("renders model, gpu and engine", () => {
    render(
      <InstanceConfig
        baseModel={baseModel}
        resources={resources}
        engine={engine}
      />,
    );
    expect(screen.getByText("meta/m")).toBeInTheDocument();
    expect(screen.getByText("A100 ×2")).toBeInTheDocument();
    expect(screen.getByText("vllm 1.0")).toBeInTheDocument();
  });

  it("falls back to vLLM and dash when fields missing", () => {
    render(
      <InstanceConfig
        baseModel={{} as never}
        resources={{} as never}
        engine={{} as never}
      />,
    );
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("vLLM")).toBeInTheDocument();
  });

  it("shows engine type only when no version", () => {
    render(
      <InstanceConfig
        baseModel={baseModel}
        resources={resources}
        engine={{ type: "sglang" } as never}
      />,
    );
    expect(screen.getByText("sglang")).toBeInTheDocument();
  });

  it("renders LoRA badge and adapters list", () => {
    render(
      <InstanceConfig
        baseModel={baseModel}
        resources={resources}
        engine={engine}
        loras={
          [{ name: "r1", modelId: "owner/a" }, { modelId: "owner/b" }] as never
        }
      />,
    );
    expect(screen.getByText("+2 LoRA")).toBeInTheDocument();
    expect(screen.getByText("r1 (owner/a)")).toBeInTheDocument();
    expect(screen.getByText("owner/b")).toBeInTheDocument();
  });

  it("Edit LoRA button shown only when onEditLora given and fires", () => {
    const onEditLora = jest.fn();
    render(
      <InstanceConfig
        baseModel={baseModel}
        resources={resources}
        engine={engine}
        onEditLora={onEditLora}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Edit LoRA/ }));
    expect(onEditLora).toHaveBeenCalled();
  });

  it("Edit LoRA disabled when locked", () => {
    render(
      <InstanceConfig
        baseModel={baseModel}
        resources={resources}
        engine={engine}
        onEditLora={jest.fn()}
        isLocked
      />,
    );
    expect(screen.getByRole("button", { name: /Edit LoRA/ })).toBeDisabled();
  });
});
