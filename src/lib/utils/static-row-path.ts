/**
 * Map static pricing row identifier (func/model) to API path for deduplication.
 * When a dynamic model from the API has the same path as a static row,
 * we prefer the dynamic one and exclude the static row.
 */

import {
  getImageModelList,
  getAudioModelList,
  getVideoModelList,
} from "@/constants/model-library-config";

/**
 * Build path -> path mapping from model-library (path is the key for dedup).
 * Also build id/base -> path for func matching.
 */
function buildPathMappings(): {
  pathToPath: Set<string>;
  baseToPath: Map<string, string>;
} {
  const pathToPath = new Set<string>();
  const baseToPath = new Map<string, string>();

  const allModels = [
    ...getImageModelList(),
    ...getAudioModelList(),
    ...getVideoModelList(),
  ];

  (allModels as Array<{ path?: string; id?: string }>).forEach((model) => {
    const path = model.path;
    if (!path || typeof path !== "string" || path.trim() === "") return;

    pathToPath.add(path);
    const segments = path.split("/").filter(Boolean);
    const base = segments[segments.length - 1];
    if (base) {
      baseToPath.set(base, path);
    }
    // Map model id to path so static rows with func like "kling-o1-reference-to-video-video-and-img"
    // can match path "/v3/async/kling-o1-ref2v" when model.id is "kling-o1-reference-to-video"
    const id = model.id;
    if (id && typeof id === "string" && id.trim() !== "") {
      const normalizedId = id.trim().toLowerCase().replace(/_/g, "-");
      baseToPath.set(normalizedId, path);
    }
  });

  return { pathToPath, baseToPath };
}

let cachedBaseToPath: Map<string, string> | null = null;

function getBaseToPathMap(): Map<string, string> {
  if (!cachedBaseToPath) {
    const { baseToPath } = buildPathMappings();
    cachedBaseToPath = baseToPath;
  }
  return cachedBaseToPath;
}

/**
 * Get API path for a static pricing row.
 * Uses func (or model for video rows with sku) to find the matching path.
 * Returns undefined if no mapping exists (row stays, no dedup).
 */
export function getPathForStaticRow(
  row: Record<string, any>,
): string | undefined {
  const func = row.func;
  const model = row.model;

  const identifier = (typeof model === "string" && model ? model : func) as
    | string
    | undefined;
  if (!identifier || typeof identifier !== "string") return undefined;

  const baseToPath = getBaseToPathMap();
  const idLower = identifier.toLowerCase().replace(/_/g, "-");

  const bases = Array.from(baseToPath.keys()).sort(
    (a, b) => b.length - a.length,
  );
  for (const base of bases) {
    if (idLower === base || idLower.startsWith(base + "-")) {
      return baseToPath.get(base);
    }
  }

  const directPath = baseToPath.get(idLower);
  if (directPath) return directPath;

  return undefined;
}
