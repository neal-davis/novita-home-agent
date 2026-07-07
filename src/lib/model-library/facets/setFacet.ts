export function matchesSet(
  modelValues: string[],
  selectedValues: string[],
  matchMode: "any" | "all" | "single",
): boolean {
  if (selectedValues.length === 0) {
    return true;
  }

  const modelValueSet = new Set(modelValues);
  if (matchMode === "all") {
    return selectedValues.every((value) => modelValueSet.has(value));
  }

  return selectedValues.some((value) => modelValueSet.has(value));
}
