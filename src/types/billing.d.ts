type IBusinessType = "all" | "gpu_instance" | "model_api" | "serverless";

type balanceResultSchema = {
  userBalance: number;
  voucherBalance: number;
  totalBalance: number;
};

type voucherNumSchema = {
  num: number;
};

type BalanceDetailType = {
  availableBalance: string;
  cashBalance: string;
  creditLimit: string;
  pendingCharges: string;
  outstandingInvoices: string;
};

type MonthlyBillType = {
  billId: string;
  userId: string;
  startTime: string;
  endTime: string;
  billingMonth: string;
  totalAmount: string;
  originTotalAmount: string;
  voucherPayAmount: string;
  cashPayAmount: string;
  taxAmount: string;
  grossAmount: string;
  debtAmount: string;
  repaidAmount: string;
  status: string;
  invoiceUrl: string;
};
