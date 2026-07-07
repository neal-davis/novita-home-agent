interface Quota {
  quotaObject: string;
  rowspan?: number;
  quotaType: string;
  currentQuota: number;
  defaultQuota: number;
  adjustable: boolean;
  productType: string;
  quotaItems: {
    tier: string;
    quota: number;
  }[];
}
