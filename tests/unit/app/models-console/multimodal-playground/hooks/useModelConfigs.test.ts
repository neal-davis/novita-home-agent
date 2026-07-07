import { renderHook, act } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { useModelConfigs } from "@/app/models-console/multimodal-playground/hooks/useModelConfigs";

let mockState: any;
jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

jest.mock(
  "@/app/models-console/multimodal-playground/utils/schemaParser",
  () => ({
    parseRawListItem: (item: any) =>
      item ? { name: item.fusionConfig.name } : null,
  }),
);

const makeConfig = (name: string) => ({ fusionConfig: { name } });

beforeEach(() => {
  mockState = {
    multimodal: { configs: [], loading: false, error: null },
  };
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
});

describe("useModelConfigs", () => {
  it("exposes loading/error/list straight from the store", () => {
    mockState.multimodal = {
      configs: [],
      loading: true,
      error: "boom",
    };
    const { result } = renderHook(() => useModelConfigs());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe("boom");
    expect(result.current.modelList).toEqual([]);
    expect(result.current.selectedModel).toBeNull();
  });

  it("auto-selects the first model when no model param is set", () => {
    mockState.multimodal.configs = [makeConfig("m1"), makeConfig("m2")];
    const { result } = renderHook(() => useModelConfigs());
    expect(result.current.selectedModel).toEqual({ name: "m1" });
  });

  it("selects the model matching the model query param", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("model=m2"),
    );
    mockState.multimodal.configs = [makeConfig("m1"), makeConfig("m2")];
    const { result } = renderHook(() => useModelConfigs());
    expect(result.current.selectedModel).toEqual({ name: "m2" });
  });

  it("falls back to the first model when the param does not match", () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("model=nope"),
    );
    mockState.multimodal.configs = [makeConfig("m1")];
    const { result } = renderHook(() => useModelConfigs());
    expect(result.current.selectedModel).toEqual({ name: "m1" });
  });

  it("allows manually overriding the selected model", () => {
    mockState.multimodal.configs = [makeConfig("m1")];
    const { result } = renderHook(() => useModelConfigs());
    act(() => result.current.setSelectedModel({ name: "custom" } as any));
    expect(result.current.selectedModel).toEqual({ name: "custom" });
  });
});
