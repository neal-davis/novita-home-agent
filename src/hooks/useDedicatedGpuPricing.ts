"use client";

import { useEffect, useState } from "react";
import Big from "big.js";
import { getLLMDedicatedSpec } from "@/api/dedicated-endpoint";

const DEDICATED_GPU_PRESET_KEYS = [
  "RTX_4090",
  "RTX_5090",
  "H100",
  "H200",
] as const;

export type DedicatedGpuPresetKey = (typeof DEDICATED_GPU_PRESET_KEYS)[number];

export type DedicatedGpuPricingRow = {
  key: DedicatedGpuPresetKey;
  displayName: string;
  shortName: string;
  vram: string;
  pricePerHour: string;
  popular: boolean;
};

type DedicatedGpuPreset = {
  key: DedicatedGpuPresetKey;
  shortName: string;
  displayName: string;
  vram: string;
  popular: boolean;
  match: (gpuName: string) => boolean;
};

export const DEDICATED_GPU_PRESETS: DedicatedGpuPreset[] = [
  {
    key: "RTX_4090",
    shortName: "RTX 4090",
    displayName: "NVIDIA RTX 4090",
    vram: "24 GB",
    popular: false,
    match: (gpuName) => gpuName.includes("4090"),
  },
  {
    key: "RTX_5090",
    shortName: "RTX 5090",
    displayName: "NVIDIA RTX 5090",
    vram: "32 GB",
    popular: false,
    match: (gpuName) => gpuName.includes("5090"),
  },
  {
    key: "H100",
    shortName: "H100",
    displayName: "NVIDIA H100",
    vram: "80 GB",
    popular: false,
    match: (gpuName) => gpuName.includes("h100"),
  },
  {
    key: "H200",
    shortName: "H200",
    displayName: "NVIDIA H200",
    vram: "141 GB",
    popular: true,
    match: (gpuName) => gpuName.includes("h200"),
  },
];

export function getDedicatedGpuPreset(
  item: Pick<LLMDedicatedSpec, "displayName" | "gpuName">,
) {
  const gpuName =
    `${item.displayName || ""} ${item.gpuName || ""}`.toLowerCase();

  return DEDICATED_GPU_PRESETS.find((preset) => preset.match(gpuName)) || null;
}

export function formatDedicatedGpuPricePerHour(
  item: Pick<LLMDedicatedSpec, "discount" | "price" | "pricePrecision">,
) {
  const pricePerHour = Big(item.discount || item.price)
    .div(10000)
    .div(Number(item.pricePrecision || 1))
    .mul(3600);

  return `$${pricePerHour.toFixed(2)}`;
}

export function buildDedicatedGpuPricingRows(specs: LLMDedicatedSpec[]) {
  const rowsByKey = specs.reduce<
    Partial<Record<DedicatedGpuPresetKey, DedicatedGpuPricingRow>>
  >((rows, item) => {
    const preset = getDedicatedGpuPreset(item);
    if (!preset || rows[preset.key]) return rows;

    rows[preset.key] = {
      key: preset.key,
      displayName: item.displayName || preset.displayName,
      shortName: preset.shortName,
      vram: preset.vram,
      pricePerHour: formatDedicatedGpuPricePerHour(item),
      popular: preset.popular,
    };

    return rows;
  }, {});

  return DEDICATED_GPU_PRESET_KEYS.map((key) => rowsByKey[key]).filter(
    (row): row is DedicatedGpuPricingRow => Boolean(row),
  );
}

export function useDedicatedGpuPricing() {
  const [rows, setRows] = useState<DedicatedGpuPricingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getLLMDedicatedSpec({})
      .then((res) => {
        if (!mounted) return;

        setRows(
          Array.isArray(res.specs)
            ? buildDedicatedGpuPricingRows(res.specs)
            : [],
        );
      })
      .catch(() => {
        if (mounted) {
          setRows([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    rows,
    loading,
    loadingKeys: DEDICATED_GPU_PRESET_KEYS,
  };
}
