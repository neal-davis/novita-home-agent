const mockCalcPrice = jest.fn();
jest.mock("@/lib/utils/pricing", () => ({
  calcPrice: (...a: unknown[]) => mockCalcPrice(...a),
}));

import {
  getAudioModelPrice,
  getAudioModelUnit,
  getImageModelPrice,
  getMediaModelById,
  getMediaModelsByIds,
  getVideoModelPrice,
} from "@/constants/model-library-config";
import { FUNC_NAME } from "@/app/models/constants/funcs";

describe("model-library-config price helpers", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getAudioModelUnit", () => {
    it("returns the mapped unit for a known func", () => {
      expect(getAudioModelUnit(FUNC_NAME.MINIMAX_VOICE_CLONING)).toBe("voice");
      expect(getAudioModelUnit(FUNC_NAME.GLM_TTS)).toBe("10K characters");
    });
    it("defaults to 1M characters for an unmapped func", () => {
      expect(getAudioModelUnit("unknown" as FUNC_NAME)).toBe("1M characters");
    });
  });

  describe("getImageModelPrice", () => {
    it('returns ["-"] when discountPrice is a dash', () => {
      mockCalcPrice.mockReturnValue({ discountPrice: "-", originalPrice: "-" });
      expect(getImageModelPrice(FUNC_NAME.TXT2SPEECH)).toEqual(["-"]);
    });
    it("returns both prices when discounted", () => {
      mockCalcPrice.mockReturnValue({ discountPrice: 1, originalPrice: 2 });
      expect(getImageModelPrice(FUNC_NAME.TXT2SPEECH)).toEqual([
        "$1/image",
        "$2/image",
      ]);
    });
    it("returns a single price when not discounted", () => {
      mockCalcPrice.mockReturnValue({ discountPrice: 3, originalPrice: 3 });
      expect(getImageModelPrice(FUNC_NAME.TXT2SPEECH)).toEqual(["$3/image"]);
    });
  });

  describe("getAudioModelPrice", () => {
    it("formats with the resolved unit", () => {
      mockCalcPrice.mockReturnValue({ discountPrice: 5, originalPrice: 5 });
      expect(getAudioModelPrice(FUNC_NAME.GLM_TTS)).toEqual([
        "$5 / 10K characters",
      ]);
    });
  });

  describe("getVideoModelPrice", () => {
    it("formats per video by default", () => {
      mockCalcPrice.mockReturnValue({ discountPrice: 7, originalPrice: 9 });
      expect(getVideoModelPrice("some-video", {})).toEqual([
        "$7/video",
        "$9/video",
      ]);
    });
  });

  describe("getMediaModelById / getMediaModelsByIds", () => {
    it("returns undefined for an unknown id", () => {
      expect(getMediaModelById("does-not-exist")).toBeUndefined();
    });
    it("filters out unknown ids in the bulk lookup", () => {
      expect(getMediaModelsByIds(["does-not-exist"])).toEqual([]);
    });
  });
});
