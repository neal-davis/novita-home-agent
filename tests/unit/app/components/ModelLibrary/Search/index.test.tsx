import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ModelSearch from "@/app/components/ModelLibrary/Search/index";

const mockModelLogo = jest.fn();

jest.mock("@lobehub/icons", () => {
  const Icon = () => null;
  return {
    Baichuan: { Color: Icon },
    Exa: { Color: Icon },
    Hunyuan: { Color: Icon },
    Microsoft: { Color: Icon },
    Mistral: { Color: Icon },
    Moonshot: Icon,
    OpenAI: Icon,
    Wenxin: { Color: Icon },
  };
});

jest.mock("next/navigation", () => ({
  usePathname: () => "/models",
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (path: string) => path,
  getPathnameWithoutLocale: (path: string) => path,
}));

jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: ({
    modelName,
    vendorName,
  }: {
    modelName: string;
    vendorName?: string;
  }) => {
    mockModelLogo({ modelName, vendorName });
    return <div data-testid="model-logo">{modelName}</div>;
  },
}));

jest.mock("@/components/ui/input", () => ({
  SearchInput: React.forwardRef<
    HTMLInputElement,
    {
      value: string;
      onSearch: (value: string) => void;
      onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
      placeholder?: string;
    }
  >(function MockSearchInput({ value, onSearch, onKeyDown, placeholder }, ref) {
    return (
      <input
        ref={ref}
        aria-label={placeholder || "Search"}
        value={value}
        onChange={(event) => onSearch(event.target.value)}
        onKeyDown={onKeyDown}
      />
    );
  }),
}));

describe("ModelSearch", () => {
  beforeEach(() => {
    mockModelLogo.mockClear();
  });

  it("passes displayName as modelName and series as vendorName in search suggestions", async () => {
    render(
      <ModelSearch
        models={[
          {
            id: "nex-n2-pro",
            name: "N2-Pro",
            displayName: "Nex-N2-Pro",
            series: "Other",
            type: "Chat",
            tags: [],
            infos: {
              inputPricing: "$0.1/Mt",
              contextSize: "128K",
              maxOutputTokens: "8K",
            },
          } as any,
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Search Model"), {
      target: { value: "nex" },
    });

    await waitFor(() => {
      expect(screen.getAllByText("Nex-N2-Pro").length).toBeGreaterThan(0);
    });

    expect(mockModelLogo).toHaveBeenCalledWith({
      modelName: "Nex-N2-Pro",
      vendorName: "Other",
    });
  });
});
