import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getBalanceDetail, queryBillingInfo } from "@/api/billing";
import Big from "big.js";

export enum BillingState {
  success = "success",
  error = "error",
  loading = "loading",
  initializing = "initializing",
}

interface BillingStateType {
  balanceDetail: {
    status: null | "success" | "error";
    availableCredit: string;
    accountBalance: string;
    pendingCharges: string;
    creditLimit: string;
    outstandingInvoices: string;
  };
  billingInfo: null | Record<string, string | number | boolean>;
}

export const fetchBalanceDetail = createAsyncThunk(
  "billing/fetchBalanceDetail",
  async () => {
    const response = await getBalanceDetail();
    const balanceFormat = (v: number | string) =>
      new Big(v).div(10000).toFixed(4);
    return {
      availableCredit: balanceFormat(response.availableBalance),
      accountBalance: balanceFormat(response.cashBalance),
      pendingCharges: balanceFormat(response.pendingCharges),
      creditLimit: balanceFormat(response.creditLimit),
      outstandingInvoices: balanceFormat(response.outstandingInvoices),
    };
  },
);

export const fetchBillingInfo = createAsyncThunk(
  "billing/fetchBillingInfo",
  async () => {
    const response = await queryBillingInfo();
    return response;
  },
);

export const billingSlice = createSlice({
  name: "billing",
  initialState: {
    balanceDetail: {
      status: null,
      availableCredit: "0",
      accountBalance: "0",
      pendingCharges: "0",
      creditLimit: "0",
      outstandingInvoices: "0",
    },
    billingInfo: null,
  } as BillingStateType,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchBalanceDetail.fulfilled, (state, action) => {
      state.balanceDetail = {
        ...action.payload,
        status: "success",
      };
    });
    builder.addCase(fetchBalanceDetail.rejected, (state) => {
      state.balanceDetail.status = "error";
    });
    builder.addCase(fetchBillingInfo.fulfilled, (state, action) => {
      if (!state.billingInfo) {
        state.billingInfo = {};
      }
      state.billingInfo.isEnterprise = action.payload.isEnterprise;
    });
  },
});

export default billingSlice.reducer;
