jest.mock("@/constants/model-library-config", () => ({
  getAudioModelList: jest.fn(() => [
    { id: "voice_clone", path: "/v3/async/voice-clone" },
  ]),
  getImageModelList: jest.fn(() => [
    { id: "flux_1_dev", path: "/v3/async/flux-dev" },
    { id: "empty", path: "" },
  ]),
  getVideoModelList: jest.fn(() => [
    { id: "kling-o1-reference-to-video", path: "/v3/async/kling-o1-ref2v" },
  ]),
}));

import { getPathForStaticRow } from "@/lib/utils/static-row-path";

describe("static row path mapping", () => {
  it("maps direct path bases and normalized model ids to API paths", () => {
    expect(getPathForStaticRow({ func: "flux-dev" })).toBe(
      "/v3/async/flux-dev",
    );
    expect(getPathForStaticRow({ model: "flux_1_dev" })).toBe(
      "/v3/async/flux-dev",
    );
    expect(
      getPathForStaticRow({
        func: "kling-o1-reference-to-video-video-and-img",
      }),
    ).toBe("/v3/async/kling-o1-ref2v");
    expect(getPathForStaticRow({ func: "voice-clone" })).toBe(
      "/v3/async/voice-clone",
    );
  });

  it("returns undefined for missing identifiers or unknown paths", () => {
    expect(getPathForStaticRow({})).toBeUndefined();
    expect(getPathForStaticRow({ func: 123 })).toBeUndefined();
    expect(getPathForStaticRow({ func: "unknown" })).toBeUndefined();
  });
});
