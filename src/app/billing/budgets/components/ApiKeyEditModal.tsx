"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import {
  budgetAmountToMinor,
  formatBudgetAmountFromMinor,
  normalizeBudgetAmountInput,
} from "@/lib/utils/money";
import { ApiKey, BUDGET_TYPES } from "./mockData";

interface BudgetUpdateData {
  budgetType: string;
  budgetAmount: number;
  apiKeyId: string;
}

interface ApiKeyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyData: ApiKey | null;
  onSave: (data: BudgetUpdateData) => Promise<void>;
}

export default function ApiKeyEditModal({
  isOpen,
  onClose,
  apiKeyData,
  onSave,
}: ApiKeyEditModalProps) {
  const initialValues = useMemo(
    () => getApiKeyBudgetValues(apiKeyData),
    [apiKeyData],
  );
  const formKey = isOpen
    ? `${apiKeyData?.id ?? "empty"}:${initialValues.budgetType}:${initialValues.budgetLimit}`
    : "closed";

  return (
    <ApiKeyEditForm
      key={formKey}
      isOpen={isOpen}
      onClose={onClose}
      apiKeyData={apiKeyData}
      onSave={onSave}
      initialValues={initialValues}
    />
  );
}

interface ApiKeyBudgetValues {
  budgetType: string;
  budgetLimit: string;
}

function getApiKeyBudgetValues(apiKeyData: ApiKey | null): ApiKeyBudgetValues {
  if (!apiKeyData) {
    return {
      budgetType: BUDGET_TYPES.UNLIMITED,
      budgetLimit: "",
    };
  }

  const budgetType = apiKeyData.budget_type || BUDGET_TYPES.UNLIMITED;
  let budgetLimit = budgetType === BUDGET_TYPES.UNLIMITED ? "0" : "";
  if (apiKeyData.budget > 0 && budgetType !== BUDGET_TYPES.UNLIMITED) {
    budgetLimit = formatBudgetAmountFromMinor(apiKeyData.budget);
  }

  return {
    budgetType,
    budgetLimit,
  };
}

interface ApiKeyEditFormProps extends ApiKeyEditModalProps {
  initialValues: ApiKeyBudgetValues;
}

function ApiKeyEditForm({
  isOpen,
  onClose,
  apiKeyData,
  onSave,
  initialValues,
}: ApiKeyEditFormProps) {
  const [budgetType, setBudgetType] = useState(initialValues.budgetType);
  const [budgetLimit, setBudgetLimit] = useState(initialValues.budgetLimit);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if any values have changed
  const hasChanges =
    budgetType !== initialValues.budgetType ||
    budgetLimit !== initialValues.budgetLimit;

  // When budget type changes to Unlimited, set limit to 0
  const handleBudgetTypeChange = (value: string) => {
    setBudgetType(value);
    if (value === BUDGET_TYPES.UNLIMITED) {
      setBudgetLimit("0");
    }
  };

  const handleSave = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
  };

  const handleConfirm = async () => {
    setSaving(true);

    try {
      const budgetLimitValue = budgetLimit
        ? budgetAmountToMinor(budgetLimit)
        : 0;
      await onSave({
        budgetType,
        budgetAmount: budgetLimitValue,
        apiKeyId: apiKeyData?.id || "",
      });

      setShowConfirmation(false);
      onClose();

      setTimeout(() => {
        message.success("API Key budget saved successfully");
      }, 100);
    } catch (error) {
      console.error("Failed to save API Key budget:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* API Key Edit Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[420px] pt-3 px-4 [&>button]:top-3">
          <DialogHeader className="pb-0">
            <DialogTitle className="text-left text-base">
              API Key Budget Settings
            </DialogTitle>
          </DialogHeader>

          <div className="h-px w-[calc(100%+32px)] ml-[-16px] bg-[var(--gray-2)]"></div>

          <div className="space-y-2">
            {/* API Key Name */}
            <div className="flex justify-between items-center py-2">
              <span className="font-subtle-medium text-[var(--dark-1)]">
                API Key
              </span>
              <span className="font-subtle-medium text-[var(--black)] truncate max-w-[220px]">
                {apiKeyData?.name || "-"}
              </span>
            </div>

            {/* Budget Type */}
            <div className="flex justify-between items-center py-2">
              <span className="font-subtle-medium text-[var(--dark-1)]">
                Budget Type
              </span>
              <Select value={budgetType} onValueChange={handleBudgetTypeChange}>
                <SelectTrigger className="w-[220px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BUDGET_TYPES.UNLIMITED}>
                    {BUDGET_TYPES.UNLIMITED}
                  </SelectItem>
                  <SelectItem value={BUDGET_TYPES.FIXED}>
                    {BUDGET_TYPES.FIXED}
                  </SelectItem>
                  <SelectItem value={BUDGET_TYPES.MONTHLY}>
                    {BUDGET_TYPES.MONTHLY}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Limit */}
            <div className="flex justify-between items-center py-2">
              <span className="font-subtle-medium text-[var(--dark-1)]">
                Budget Limit
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-[var(--dark-2)]">$</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={budgetLimit}
                  onChange={(e) =>
                    setBudgetLimit(normalizeBudgetAmountInput(e.target.value))
                  }
                  className={`w-[200px] h-8 ${
                    budgetType === BUDGET_TYPES.UNLIMITED
                      ? "bg-[var(--gray-3)] border-[var(--gray-1)]"
                      : "border-[var(--gray-2)]"
                  }`}
                  disabled={budgetType === BUDGET_TYPES.UNLIMITED}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <p className="text-xs leading-4 text-[var(--dark-3)] w-[220px]">
                If the key budget exceeds the member budget, the member budget
                will take precedence.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-9 font-subtle-medium border-1 border-[var(--gray-2)]"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1 h-9 font-subtle-medium"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="w-[420px] pt-3 px-4 [&>button]:top-3">
          <DialogHeader className="pb-0">
            <DialogTitle className="text-left text-base">
              Confirm API Key Budget
            </DialogTitle>
          </DialogHeader>

          <div className="h-px w-[calc(100%+32px)] ml-[-16px] bg-[var(--gray-2)]"></div>

          <div className="space-y-2">
            <p className="text-sm font-medium leading-[20px] text-[var(--black)] mb-4">
              Apply the following budget settings?
            </p>

            <div className="flex justify-between items-center py-2">
              <span className="font-subtle-medium text-[var(--dark-1)]">
                API Key
              </span>
              <span className="font-subtle-medium text-[var(--black)]">
                {apiKeyData?.name || "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="font-subtle-medium text-[var(--dark-1)]">
                Budget Type
              </span>
              <span className="font-subtle-medium text-[var(--black)]">
                {budgetType}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="font-subtle-medium text-[var(--dark-1)]">
                Budget Limit
              </span>
              <span className="font-subtle-medium text-[var(--black)]">
                {budgetType === BUDGET_TYPES.UNLIMITED
                  ? "Unlimited"
                  : `$${budgetLimit || "0"}`}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleConfirmCancel}
              className="flex-1 h-9 font-subtle-medium border-1 border-[var(--gray-2)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={saving}
              variant="default"
              className="flex-1 h-9 font-subtle-medium"
            >
              {saving ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
