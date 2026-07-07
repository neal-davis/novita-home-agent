import {
  makeMergedRowsTableData,
  sortQuotaList,
} from "@/lib/utils/quota-limits";

function quota(quotaObject: string, quotaType: string): Quota {
  return {
    quotaObject,
    quotaType,
    currentQuota: 1,
    defaultQuota: 2,
    adjustable: true,
    productType: "model",
    quotaItems: [{ tier: "free", quota: 1 }],
  };
}

describe("quota limit utilities", () => {
  it("returns an empty array for missing quota lists", () => {
    expect(sortQuotaList([])).toEqual([]);
    expect(sortQuotaList(undefined as unknown as Quota[])).toEqual([]);
    expect(makeMergedRowsTableData([], 10)).toEqual([]);
  });

  it("groups quota rows by quota object without mutating source rows", () => {
    const first = quota("llm", "rpm");
    const rows = [first, quota("gpu", "count"), quota("llm", "tpm")];

    expect(sortQuotaList(rows)).toEqual([
      expect.objectContaining({ quotaObject: "llm", quotaType: "rpm" }),
      expect.objectContaining({ quotaObject: "llm", quotaType: "tpm" }),
      expect.objectContaining({ quotaObject: "gpu", quotaType: "count" }),
    ]);
    expect(sortQuotaList(rows)[0]).not.toBe(first);
    expect(first).not.toHaveProperty("rowspan");
  });

  it("adds row spans within page-sized quota groups", () => {
    const rows = [
      quota("llm", "rpm"),
      quota("llm", "tpm"),
      quota("gpu", "count"),
      quota("llm", "batch"),
    ];

    expect(makeMergedRowsTableData(rows, 2)).toEqual([
      expect.objectContaining({
        quotaObject: "llm",
        quotaType: "rpm",
        rowspan: 2,
      }),
      expect.objectContaining({ quotaObject: "llm", quotaType: "tpm" }),
      expect.objectContaining({
        quotaObject: "gpu",
        quotaType: "count",
        rowspan: 1,
      }),
      expect.objectContaining({
        quotaObject: "llm",
        quotaType: "batch",
        rowspan: 1,
      }),
    ]);
    expect(rows[0]).not.toHaveProperty("rowspan");
  });
});
