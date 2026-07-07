"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { message } from "@/components/ui/standard/notify";
import { checkLoraAdapters } from "@/api/dedicated-endpoint";
import { Plus, ExternalLink, Loader2, AlertCircle, Info } from "lucide-react";
import Tooltip from "@/app/components/Tooltip";
import Link from "next/link";
import debounce from "lodash.debounce";
import { cn } from "@/lib/utils";
import {
  getDuplicateLoraRouteIndexes,
  LORA_ROUTE_DUPLICATE_ERROR_MESSAGE,
  type LoraAdapterItem,
} from "./form-field/validation";
import styles from "./AddAdapterModal.module.scss";

interface AddAdapterModalProps {
  show: boolean;
  onClose: () => void;
  onAdapterSave: (adapters: LoraAdapterItem[]) => void | Promise<void>;
  token?: string;
  baseModel: string;
  loraAdapters: LoraAdapterItem[];
  provider?: "huggingface" | "novita";
  /** Title shown in the modal header. Defaults to "Add adapter". */
  title?: string;
  /** Whether to show the parent-driven loading state on the save button. */
  saving?: boolean;
}

export default function AddAdapterModal({
  show,
  onClose,
  onAdapterSave,
  token = "",
  baseModel,
  loraAdapters,
  provider = "huggingface",
  title = "Add adapter",
  saving = false,
}: AddAdapterModalProps) {
  const [adapters, setAdapters] = useState<LoraAdapterItem[]>(loraAdapters);
  const [inputValue, setInputValue] = useState("");
  const [checkStatus, setCheckStatus] = useState<
    "success" | "error" | "loading" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const wasOpenRef = useRef(show);
  const duplicateRouteIndexes = getDuplicateLoraRouteIndexes(adapters);
  const hasDuplicateRoute = duplicateRouteIndexes.size > 0;

  // Initialize from props only when the modal opens. While open, local edits must
  // not be overwritten by parent refreshes that pass a new loraAdapters array.
  useEffect(() => {
    if (show && !wasOpenRef.current) {
      setAdapters(loraAdapters);
    }
    wasOpenRef.current = show;
  }, [show, loraAdapters]);

  const debouncedCheckAdapter = useMemo(
    () =>
      debounce(async (adapterName: string) => {
        if (!adapterName.trim()) {
          setCheckStatus(null);
          setErrorMessage("");
          return;
        }

        try {
          setCheckStatus("loading");
          setErrorMessage("");
          const response = await checkLoraAdapters({
            baseModel,
            hfToken: token || undefined,
            loraAdapters: [adapterName.trim()],
          });
          const result = response.results?.[0];
          if (result?.isValid) {
            setCheckStatus("success");
          } else {
            setCheckStatus("error");
            setErrorMessage(
              result?.errorMsg ||
                "The LoRA adapter is incompatible with the base model.",
            );
          }
        } catch (error) {
          setCheckStatus("error");
          setErrorMessage("Failed to validate adapter. Please try again.");
        }
      }, 500),
    [token, baseModel],
  );

  useEffect(() => {
    debouncedCheckAdapter(inputValue);
    return () => {
      debouncedCheckAdapter.cancel();
    };
  }, [inputValue, debouncedCheckAdapter]);

  useEffect(() => {
    return () => {
      debouncedCheckAdapter.cancel();
    };
  }, [debouncedCheckAdapter]);

  const handleAddAdapter = () => {
    const name = inputValue.trim();
    if (adapters.some((a) => a.modelId === name)) {
      message.error("Adapter already exists");
      return;
    }
    if (
      adapters.some(
        (adapter) =>
          ((adapter.modelAlias || "").trim() || adapter.modelId) === name,
      )
    ) {
      message.error(LORA_ROUTE_DUPLICATE_ERROR_MESSAGE);
      return;
    }
    setAdapters([...adapters, { modelId: name }]);
    setInputValue("");
    setCheckStatus(null);
    setErrorMessage("");
  };

  const handleRemoveAdapter = (index: number) => {
    setAdapters(adapters.filter((_, i) => i !== index));
  };

  const handleAliasChange = (index: number, alias: string) => {
    setAdapters((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, modelAlias: alias } : item,
      ),
    );
  };

  const handleSubmit = async () => {
    if (hasDuplicateRoute) {
      message.error(LORA_ROUTE_DUPLICATE_ERROR_MESSAGE);
      return;
    }

    // Persist by sending alias only when non-empty.
    const cleaned = adapters.map((a) => {
      const alias = (a.modelAlias || "").trim();
      return alias
        ? { modelId: a.modelId, modelAlias: alias }
        : { modelId: a.modelId };
    });
    await onAdapterSave(cleaned);
    onClose();
    setInputValue("");
    setCheckStatus(null);
    setErrorMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent
        className={styles.modal}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.content_wrapper}>
          <div className="mb-4">
            <div className="flex gap-2 items-center justify-between">
              <Input
                placeholder={
                  provider === "novita"
                    ? "Enter adapter's repository name"
                    : "Enter Hugging Face adapter's repository name"
                }
                className={cn(
                  "h-[32px] flex-1",
                  checkStatus === "error" && styles.input_error,
                )}
                containerClassName="w-full"
                value={inputValue}
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-[32px] w-[32px] p-0"
                disabled={checkStatus !== "success" || !inputValue.trim()}
                onClick={handleAddAdapter}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {checkStatus === "loading" && (
              <div className="flex items-center gap-1 mt-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs text-muted-foreground">
                  Gathering adapter information...
                </span>
              </div>
            )}
            {checkStatus === "success" && (
              <div className="flex items-center gap-1 mt-2">
                <img src="/circle-checked.svg" alt="" width={12} height={12} />
                <span className="text-xs text-green-600">
                  {provider === "novita"
                    ? "Adapter ready to add."
                    : "LoRA adapter successfully matched with the base model."}
                </span>
              </div>
            )}
            {checkStatus === "error" && (
              <div className="flex items-center gap-1 mt-2">
                <AlertCircle className="w-3 h-3" color="var(--red-1)" />
                <span className="text-xs text-red-600">{errorMessage}</span>
              </div>
            )}
          </div>

          {adapters.length === 0 ? (
            <div className="text-center py-6">
              <p className={styles.no_adapter_title}>No adapter added</p>
              <p className={styles.no_adapter_desc}>
                {provider === "novita"
                  ? "Click the button above to add adapters."
                  : "Click the button above to add Hugging Face adapters."}
              </p>
            </div>
          ) : (
            <div>
              <div className={styles.list_header}>
                <div className={styles.col_route}>
                  Route
                  <Tooltip
                    placement="right"
                    maxWidth={260}
                    // i18n-disable-next-line
                    contentClassName="w-[260px] whitespace-normal"
                    content={
                      <span>
                        Optional route for this adapter. Leave empty to fall
                        back to the adapter name. Route must be unique within
                        the endpoint.
                      </span>
                    }
                  >
                    <Info className="w-3 h-3 text-[var(--dark-3)]" />
                  </Tooltip>
                </div>
                <div className={styles.col_adapter}>Adapter name</div>
              </div>
              <div className="space-y-2">
                {adapters.map((adapter, index) => (
                  <div key={index} className={styles.adapter_item}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-[160px] shrink-0">
                        <Input
                          placeholder={adapter.modelId}
                          className={cn(
                            "h-[28px] w-full",
                            styles.alias_input,
                            duplicateRouteIndexes.has(index) &&
                              styles.alias_input_error,
                          )}
                          value={adapter.modelAlias || ""}
                          onChange={(e) =>
                            handleAliasChange(index, e.target.value)
                          }
                        />
                      </div>
                      <span
                        className={cn(
                          styles.adapter_name,
                          "text-[var(--dark-1)] truncate",
                        )}
                        title={adapter.modelId}
                      >
                        {adapter.modelId}
                      </span>
                      {provider === "huggingface" && (
                        <Link
                          href={`https://huggingface.co/${adapter.modelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${adapter.modelId} on Hugging Face`}
                          className={styles.external_link_button}
                        >
                          <ExternalLink className="h-[14px] w-[14px]" />
                        </Link>
                      )}
                    </div>
                    <button
                      className={styles.remove_button}
                      onClick={() => handleRemoveAdapter(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  styles.route_error,
                  !hasDuplicateRoute && styles.route_error_hidden,
                )}
              >
                {LORA_ROUTE_DUPLICATE_ERROR_MESSAGE}
              </div>
            </div>
          )}
        </div>

        <div className={cn(styles.footer, "flex justify-end gap-3 mb-4 mr-6")}>
          <Button
            type="button"
            variant="outline"
            className="w-[90px]"
            onClick={onClose}
            size="sl"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="min-w-[90px]"
            variant="secondary"
            onClick={handleSubmit}
            disabled={saving || hasDuplicateRoute}
            size="sl"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Save ${adapters.length}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
