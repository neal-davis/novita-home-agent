export function sortQuotaList(quotaList: Quota[]) {
  if (!quotaList || quotaList.length === 0) {
    return [];
  }

  const groupedQuotas = quotaList.reduce(
    (acc, quota) => {
      const key = quota.quotaObject;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(quota);
      return acc;
    },
    {} as Record<string, Quota[]>,
  );

  return Object.entries(groupedQuotas).flatMap(([, quotas]) => {
    if (quotas.length > 0) {
      quotas[0] = { ...quotas[0] };
    }
    return quotas;
  });
}

export function makeMergedRowsTableData(quotaList: Quota[], pageSize: number) {
  if (!quotaList || quotaList.length === 0) {
    return [];
  }

  const groups = new Map<string, Quota[]>();
  const orderedQuotaObjects: string[] = [];
  let count = 0;
  let pageIndex = 0;

  quotaList.forEach((quota) => {
    const groupKey = `${quota.quotaObject || "-"}${pageIndex}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
      orderedQuotaObjects.push(groupKey);
    }
    groups.get(groupKey)!.push(quota);
    count++;
    if (count % pageSize === 0) {
      count = 0;
      pageIndex++;
    }
  });

  const result = orderedQuotaObjects.flatMap((groupKey) => {
    const group = groups.get(groupKey)!;
    if (group.length > 0) {
      group[0] = { ...group[0], rowspan: group.length };
    }
    return group;
  });

  return result;
}
