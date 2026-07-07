import {
  buildDedicatedGpuPricingRows,
  formatDedicatedGpuPricePerHour,
  getDedicatedGpuPreset,
} from "@/hooks/useDedicatedGpuPricing";

describe("dedicated GPU pricing helpers", () => {
  it("matches RTX 5090 specs from displayName or gpuName", () => {
    expect(
      getDedicatedGpuPreset({
        displayName: "NVIDIA RTX 5090",
        gpuName: "",
      })?.key,
    ).toBe("RTX_5090");

    expect(
      getDedicatedGpuPreset({
        displayName: "",
        gpuName: "rtx-5090",
      })?.key,
    ).toBe("RTX_5090");
  });

  it("formats the GPU-hour price from API pricing fields", () => {
    expect(
      formatDedicatedGpuPricePerHour({
        discount: 2,
        price: 3,
        pricePrecision: 1,
      }),
    ).toBe("$0.72");

    expect(
      formatDedicatedGpuPricePerHour({
        discount: 0,
        price: 2.0278,
        pricePrecision: 1,
      }),
    ).toBe("$0.73");
  });

  it("builds preset-ordered rows with frontend VRAM config", () => {
    const rows = buildDedicatedGpuPricingRows([
      {
        id: "h200",
        gpuName: "H200",
        displayName: "NVIDIA H200",
        price: 8.3056,
        discount: 0,
        description: "",
        pricePrecision: 1,
      },
      {
        id: "5090",
        gpuName: "RTX_5090",
        displayName: "NVIDIA RTX 5090",
        price: 2.0278,
        discount: 0,
        description: "",
        pricePrecision: 1,
      },
      {
        id: "unknown",
        gpuName: "A100",
        displayName: "NVIDIA A100",
        price: 1,
        discount: 0,
        description: "",
        pricePrecision: 1,
      },
    ]);

    expect(rows).toEqual([
      {
        key: "RTX_5090",
        displayName: "NVIDIA RTX 5090",
        shortName: "RTX 5090",
        vram: "32 GB",
        pricePerHour: "$0.73",
        popular: false,
      },
      {
        key: "H200",
        displayName: "NVIDIA H200",
        shortName: "H200",
        vram: "141 GB",
        pricePerHour: "$2.99",
        popular: true,
      },
    ]);
  });
});
