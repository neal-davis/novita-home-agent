import { useState } from "react";
import { redeemVoucherCode } from "@/api/user";

export interface RedeemResult {
  templateId: string;
  amount: string; // divide by 10000 to display
  endTime: string; // unix timestamp
  businessTypes: string[]; // e.g. ["all"] | ["model_api"] | ["model_api", "gpu_instance"]
}

export function useVoucherRedeem() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<RedeemResult | null>(null);

  const redeemed = redeemResult !== null;

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (error) setError("");
  };

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError("Please enter a voucher code");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await redeemVoucherCode(code.trim());

      setRedeemResult(res as RedeemResult);
      setCode("");
    } catch (err: unknown) {
      const msg =
        typeof err === "string"
          ? err
          : (err as any)?.errInfo ||
            (err as any)?.message ||
            "Failed to redeem voucher code";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCode("");
    setError("");
    setRedeemResult(null);
  };

  return {
    code,
    error,
    loading,
    redeemed,
    redeemResult,
    handleCodeChange,
    handleRedeem,
    reset,
  };
}
