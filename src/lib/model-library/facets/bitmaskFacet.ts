export function valuesToMask(
  values: string[],
  bitByValue: Map<string, number>,
): number {
  return values.reduce((mask, value) => mask | (bitByValue.get(value) ?? 0), 0);
}

export function matchesBitmask(
  modelMask: number,
  selectedMask: number,
  matchMode: "any" | "all" | "single",
): boolean {
  if (selectedMask === 0) {
    return true;
  }

  if (matchMode === "all") {
    return (modelMask & selectedMask) === selectedMask;
  }

  return (modelMask & selectedMask) !== 0;
}
