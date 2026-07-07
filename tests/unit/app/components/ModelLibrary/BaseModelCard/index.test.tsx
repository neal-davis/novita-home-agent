import * as React from "react";
import { render } from "@testing-library/react";

import BaseModelCard from "@/app/components/ModelLibrary/BaseModelCard";

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
    return <div data-testid="model-logo" />;
  },
}));

describe("BaseModelCard", () => {
  beforeEach(() => {
    mockModelLogo.mockClear();
  });

  it("passes displayName as modelName and series as vendorName to ModelLogo", () => {
    render(
      <BaseModelCard
        modelName="nex-t2"
        displayName="NEX TTS"
        series="Other"
        tags={[]}
        infos={[["$0.1"], ["128K"]]}
      />,
    );

    expect(mockModelLogo).toHaveBeenCalledWith({
      modelName: "NEX TTS",
      vendorName: "Other",
    });
  });
});
