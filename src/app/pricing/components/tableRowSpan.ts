/**
 * Compute rowSpan and skipped row indexes for consecutive rows that share the
 * same group key.
 */
export function computeRowSpanMaps<T>(
  tableData: T[],
  getGroupKey: (row: T) => string | null | undefined,
): {
  rowSpanMap: Record<number, number>;
  skipRows: Set<number>;
} {
  const rowSpanMap: Record<number, number> = {};
  const skipRows = new Set<number>();
  let currentKey: string | null = null;
  const groupIndices: number[] = [];

  const flushGroup = () => {
    if (groupIndices.length > 1) {
      rowSpanMap[groupIndices[0]] = groupIndices.length;
      for (let i = 1; i < groupIndices.length; i++) {
        skipRows.add(groupIndices[i]);
      }
    }
  };

  tableData.forEach((row, index) => {
    const key = getGroupKey(row);

    if (key) {
      if (currentKey === key) {
        groupIndices.push(index);
      } else {
        flushGroup();
        currentKey = key;
        groupIndices.length = 0;
        groupIndices.push(index);
      }
      return;
    }

    flushGroup();
    currentKey = null;
    groupIndices.length = 0;
  });

  flushGroup();

  return { rowSpanMap, skipRows };
}
