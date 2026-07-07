import { getModelLogoFromConfig } from "@/app/components/ModelLibrary/ModelLogo/modelLogoConfig";

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

describe("getModelLogoFromConfig", () => {
  it("matches nex logo from productized display names", () => {
    expect(getModelLogoFromConfig("NEX TTS")).toMatchObject({
      logoPath: "/models/logo/svg/nex-logo.svg",
    });
  });

  it("matches locally configured vendor logos", () => {
    expect(getModelLogoFromConfig("MOSS TTS v1.5")).toMatchObject({
      logoPath: "/models/logo/svg/mosi-logo.svg",
    });
    expect(getModelLogoFromConfig("XiaomiMiMo/MiMo-V2.5-Pro")).toMatchObject({
      logoPath: "/models/logo/svg/xiaomi-logo.svg",
    });
    expect(getModelLogoFromConfig("Tavily Search")).toMatchObject({
      logoPath: "/models/logo/svg/tavily-logo.svg",
    });
    expect(getModelLogoFromConfig("heygen-video-translate")).toMatchObject({
      logoPath: "/models/logo/svg/heygen-logo.svg",
    });
  });

  it("does not match unrelated names with broad logo keywords", () => {
    expect(getModelLogoFromConfig("VertexAI")).toEqual({});
    expect(getModelLogoFromConfig("mixtral")).not.toMatchObject({
      logoPath: "/models/logo/svg/xiaomi-logo.svg",
    });
  });

  it("returns empty result for unknown model name", () => {
    expect(getModelLogoFromConfig("totally-unknown-model")).toEqual({});
  });
});
