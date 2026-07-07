"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check, Info, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import FormErrorText from "@/components/ui/standard/form-error-text";
import { getSanitizedUserId } from "@/lib/utils/user";
import HFTokenIntegrationModal from "../HFTokenIntegrationModal";
import AddAdapterModal from "../AddAdapterModal";
import { getHfModel, checkHfBaseModel } from "@/api/dedicated-endpoint";
import { Loader2, AlertCircle } from "lucide-react";
import Tooltip from "@/app/components/Tooltip";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { SUPPORT_EMAIL_LINK } from "@/constants/urls";
import { getFullLLMModelsWithCache } from "@/api/model";
import type { LLMModelWithStatus } from "@/types/models";
import { Input } from "@/components/ui/input";
import {
  getDuplicateLoraRouteIndexes,
  LORA_ROUTE_DUPLICATE_ERROR_MESSAGE,
  type LoraAdapterItem,
} from "./validation";
import styles from "./ModelField.module.scss";

export interface ModelFieldValue {
  modelId: string;
  token: string;
  loraAdapters: LoraAdapterItem[];
  provider?: "huggingface" | "novita";
}

interface ModelFieldProps {
  value?: ModelFieldValue;
  onChange?: (value: ModelFieldValue) => void;
  checkStatus: "success" | "error" | "loading" | null;
  setCheckStatus: (status: "success" | "error" | "loading" | null) => void;
  error?: string;
  mode?: "create" | "edit";
  hideToken?: boolean; // If true, hide token input and skip token validation
}

type ModelSource = "huggingface" | "novita";

export default function ModelField({
  value = { modelId: "", token: "", loraAdapters: [], provider: "huggingface" },
  onChange,
  checkStatus,
  setCheckStatus,
  error,
  mode = "create",
  hideToken = false,
}: ModelFieldProps) {
  const [showHFTokenIntegrationModal, setShowHFTokenIntegrationModal] =
    useState(false);
  const [showAddAdapterModal, setShowAddAdapterModal] = useState(false);
  const [availableModels, setAvailableModels] = useState<{ modelId: string }[]>(
    [],
  );
  const [availableNovitaModels, setAvailableNovitaModels] = useState<
    LLMModelWithStatus[]
  >([]);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [errorReason, setErrorReason] = useState<string>("");
  const [activeSource, setActiveSource] = useState<ModelSource>(
    (value.provider as ModelSource) || "huggingface",
  );
  const duplicateRouteIndexes = getDuplicateLoraRouteIndexes(
    value.loraAdapters,
  );
  const hasDuplicateRoute = duplicateRouteIndexes.size > 0;
  const [loadingNovitaModels, setLoadingNovitaModels] = useState(false);

  useEffect(() => {
    const nextSource = (value.provider as ModelSource) || "huggingface";
    if (nextSource !== activeSource) {
      setActiveSource(nextSource);
      setSearchValue("");
    }
  }, [activeSource, value.provider]);

  const getErrorMessage = useCallback(
    (reason: string, hasToken: boolean, modelId: string) => {
      if (reason === "HUGGING_FACE_GATED") {
        return hasToken ? (
          <span className="flex flex-row items-center gap-2">
            {"You don't have access to this gated model."}{" "}
            <Link
              href={`https://huggingface.co/${modelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.submit_access_request_link}
            >
              Please submit an access request from the repository.
              <ExternalLink className="h-[12px] w-[12px]" />
            </Link>
          </span>
        ) : (
          "Please integrate a Hugging Face token."
        );
      }

      if (reason === "LLM_DEDICATED_ENDPOINT_MODEL_NOT_SUPPORTED") {
        return "This model is not supported for LLM Dedicated Endpoints.";
      }

      return "You don't have access to this model.";
    },
    [],
  );

  const fetchHfModels = useCallback(
    async (searchTerm: string = "") => {
      try {
        const { models } = await getHfModel({
          modelId: searchTerm,
          token: value.token,
        });
        setAvailableModels(models || []);
      } catch (error) {
        console.error(error);
        setAvailableModels([]);
      }
    },
    [value.token],
  );

  const fetchNovitaModels = useCallback(async () => {
    setLoadingNovitaModels(true);
    try {
      const models = await getFullLLMModelsWithCache([
        "chat",
        "embedding",
        "reranker",
      ]);

      // Only keep models that have hf_mirror_url
      const modelsWithHfMirrorUrl = models.filter(
        (model: any) =>
          model.hf_mirror_url && model.hf_mirror_url.trim() !== "",
      );

      // Only set models that have hf_mirror_url
      setAvailableNovitaModels(modelsWithHfMirrorUrl);
    } catch (error) {
      console.error("Error fetching Novita models:", error);
      setAvailableNovitaModels([]);
    } finally {
      setLoadingNovitaModels(false);
    }
  }, []);

  useEffect(() => {
    if (activeSource === "huggingface") {
      fetchHfModels();
    } else if (activeSource === "novita") {
      fetchNovitaModels();
    }
  }, [activeSource, fetchHfModels, fetchNovitaModels]);

  useEffect(() => {
    if (!value.modelId) {
      return;
    }

    // If hideToken is true, skip validation and set status to success
    if (hideToken) {
      setCheckStatus("success");
      setErrorReason("");
      return;
    }

    // For novita models, skip validation (they are already validated)
    if (value.provider === "novita") {
      setCheckStatus("success");
      setErrorReason("");
      return;
    }

    // Only validate Hugging Face models
    if (value.provider === "huggingface" || !value.provider) {
      setCheckStatus("loading");
      setErrorReason("");
      checkHfBaseModel({
        modelId: value.modelId,
        token: value.token,
      })
        .then(() => {
          setCheckStatus("success");
        })
        .catch((error) => {
          if (error?.reason) {
            setErrorReason(error.reason);
          }
          setCheckStatus("error");
        });
    }
  }, [value.token, value.modelId, value.provider, setCheckStatus, hideToken]);

  const handleModelIdChange = async (modelId: string) => {
    let finalModelId = modelId;

    // For novita models, check if hf_mirror_url exists, use it if available
    if (activeSource === "novita") {
      const selectedModel = availableNovitaModels.find(
        (model) => model.id === modelId,
      );
      if (selectedModel && (selectedModel as any).hf_mirror_url) {
        finalModelId = (selectedModel as any).hf_mirror_url;
      }
    }

    const newValue = {
      ...value,
      modelId: finalModelId,
      provider: activeSource,
    };
    onChange?.(newValue);
    setOpen(false);
  };

  const handleSearchModels = async (searchTerm: string) => {
    setSearchValue(searchTerm);
    if (activeSource === "huggingface") {
      debouncedFetchHfModels(searchTerm);
    } else {
      // For novita models, filter locally
      // The models are already loaded, we just filter them
    }
  };

  const debouncedFetchHfModels = useMemo(
    () => debounce(fetchHfModels, 500),
    [fetchHfModels],
  );

  const filteredNovitaModels = useMemo(() => {
    // Ensure only models with hf_mirror_url are displayed
    const modelsWithHfUrl = availableNovitaModels.filter(
      (model: any) => model.hf_mirror_url && model.hf_mirror_url.trim() !== "",
    );

    if (!searchValue) {
      return modelsWithHfUrl;
    }
    const searchLower = searchValue.toLowerCase();
    return modelsWithHfUrl.filter(
      (model) =>
        model.id.toLowerCase().includes(searchLower) ||
        model.name.toLowerCase().includes(searchLower) ||
        model.displayName?.toLowerCase().includes(searchLower) ||
        false,
    );
  }, [availableNovitaModels, searchValue]);

  useEffect(() => {
    return () => {
      debouncedFetchHfModels.cancel();
    };
  }, [debouncedFetchHfModels]);

  const handleSourceChange = (source: ModelSource) => {
    setActiveSource(source);
    setSearchValue("");
    // Reset model selection when switching sources
    onChange?.({ ...value, modelId: "", provider: source });
  };

  const handleAddLoRAAdapter = () => {
    if (!value.modelId) {
      return;
    }
    setShowAddAdapterModal(true);
  };

  const handleRemoveAdapter = (index: number) => {
    const newAdapters = value.loraAdapters.filter((_, i) => i !== index);
    onChange?.({ ...value, loraAdapters: newAdapters });
  };

  const handleAdapterAliasChange = (index: number, alias: string) => {
    const newAdapters = value.loraAdapters.map((item, i) =>
      i === index ? { ...item, modelAlias: alias } : item,
    );
    onChange?.({ ...value, loraAdapters: newAdapters });
  };

  return (
    <div
      className={cn({
        [styles.form_card_edit]: mode === "edit",
      })}
    >
      {/* Step 1: Model Source Selection */}
      <div className="mb-4">
        <p className="text-[12px] text-[var(--dark-3)] mb-3">
          Select a model source to get started
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* Hugging Face Card - Default/Primary */}
          <div
            className={cn(
              "flex flex-col rounded-[6px] border cursor-pointer transition-all bg-white relative",
              activeSource === "huggingface"
                ? "border-[var(--dark-4)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                : "border-[var(--gray-2)] hover:border-[var(--dark-4)]",
            )}
            onClick={() => handleSourceChange("huggingface")}
          >
            <div className="p-4">
              {activeSource === "huggingface" && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--brand-0)] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <img
                  src="/logo/huggingface.svg"
                  alt="huggingface"
                  width={20}
                  height={20}
                />
                <span className="text-[14px] font-medium text-[var(--dark-1)]">
                  Hugging Face
                </span>
              </div>
              <p className="text-[12px] text-[var(--dark-3)] leading-[16px]">
                Access public, private & gated models
              </p>
            </div>

            {/* HF Token Section - Inside card when selected */}
            {activeSource === "huggingface" && !hideToken && (
              <div
                className="px-4 py-3 bg-[var(--gray-4)] border-t border-[var(--gray-2)] rounded-b-[6px]"
                onClick={(e) => e.stopPropagation()}
              >
                {value.token ? (
                  // Token configured - show preview with edit
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[12px] text-[var(--dark-2)] shrink-0">
                        Token:
                      </span>
                      <span className="text-[12px] text-[var(--dark-1)] font-medium truncate">
                        {getSanitizedUserId(value.token)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[12px] shrink-0 text-[var(--dark-2)] hover:text-[var(--dark-1)]"
                      onClick={() => setShowHFTokenIntegrationModal(true)}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  // No token - show integrate button
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[var(--dark-3)]">
                      Required for private & gated models
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-[12px]"
                      onClick={() => setShowHFTokenIntegrationModal(true)}
                    >
                      Integrate
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Novita AI Card */}
          <div
            className={cn(
              "flex flex-col p-4 rounded-[6px] border cursor-pointer transition-all bg-white relative",
              activeSource === "novita"
                ? "border-[var(--dark-4)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                : "border-[var(--gray-2)] hover:border-[var(--dark-4)]",
            )}
            onClick={() => handleSourceChange("novita")}
          >
            {activeSource === "novita" && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--brand-0)] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/logo/logo_small.svg"
                alt="novita"
                width={20}
                height={20}
              />
              <span className="text-[14px] font-medium text-[var(--dark-1)]">
                Novita AI
              </span>
            </div>
            <p className="text-[12px] text-[var(--dark-3)] leading-[16px]">
              Curated models optimized for deployment
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: Model Selection */}
      <div className="mb-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "relative flex h-10 w-full items-center justify-between rounded-[6px] border bg-white px-3 py-2 text-[13px] cursor-pointer transition-colors",
                error || checkStatus === "error"
                  ? "border-[var(--red-1)]"
                  : "border-[var(--gray-2)] hover:border-[var(--dark-4)]",
              )}
            >
              <span
                className={cn({
                  "text-[var(--dark-3)]": !value.modelId,
                  "text-[var(--dark-1)]": value.modelId,
                })}
              >
                {value.modelId ||
                  (activeSource === "huggingface"
                    ? "Search or enter model name..."
                    : "Select a model...")}
              </span>
              <ChevronsUpDown className="h-4 w-4 text-[var(--dark-3)]" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="p-0"
            align="start"
            side="bottom"
            avoidCollisions={false}
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            {activeSource === "huggingface" ? (
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search Hugging Face models..."
                  value={searchValue}
                  onValueChange={handleSearchModels}
                />
                <CommandList className="max-h-[240px] overflow-y-auto">
                  {searchValue && availableModels.length === 0 && (
                    <CommandEmpty>
                      No models found.
                      <Link
                        className="underline cursor-pointer ml-2"
                        href={`mailto:${SUPPORT_EMAIL_LINK}`}
                        target="_blank"
                      >
                        Contact support
                      </Link>
                    </CommandEmpty>
                  )}
                  {availableModels.length > 0 && (
                    <CommandGroup>
                      {availableModels.map((model) => (
                        <CommandItem
                          key={model.modelId}
                          value={model.modelId}
                          onSelect={() => handleModelIdChange(model.modelId)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value.modelId === model.modelId &&
                                value.provider === "huggingface"
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {model.modelId}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            ) : (
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search Novita models..."
                  value={searchValue}
                  onValueChange={handleSearchModels}
                />
                <CommandList className="max-h-[240px] overflow-y-auto">
                  {loadingNovitaModels ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading models...
                      </span>
                    </div>
                  ) : (
                    <>
                      {searchValue && filteredNovitaModels.length === 0 && (
                        <CommandEmpty>
                          No models found.
                          <Link
                            className="underline cursor-pointer ml-2"
                            href={`mailto:${SUPPORT_EMAIL_LINK}`}
                            target="_blank"
                          >
                            Contact support
                          </Link>
                        </CommandEmpty>
                      )}
                      {filteredNovitaModels.length > 0 && (
                        <CommandGroup>
                          {filteredNovitaModels.map((model) => (
                            <CommandItem
                              key={model.id}
                              value={model.id}
                              onSelect={() => handleModelIdChange(model.id)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  value.modelId === model.id &&
                                    value.provider === "novita"
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{model.displayName || model.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {model.id}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            )}
          </PopoverContent>
        </Popover>

        {/* Status Messages */}
        {checkStatus === "loading" && (
          <div className="flex items-center gap-1 mt-2">
            <Loader2 className="h-3 w-3 animate-spin text-[var(--dark-3)]" />
            <span className="text-[12px] text-[var(--dark-3)]">
              Validating model...
            </span>
          </div>
        )}
        {checkStatus === "success" && value.modelId && (
          <div className="flex items-center gap-1.5 mt-2">
            <Check className="w-3 h-3 text-[var(--brand-0)]" />
            <span className="text-[12px] text-[var(--brand-0)]">
              {value.provider === "novita"
                ? "Model selected successfully"
                : "You have been granted access to this model"}
            </span>
          </div>
        )}
        {checkStatus === "error" && (
          <div className="flex items-center gap-1 mt-2">
            <AlertCircle className="w-3 h-3 text-[var(--red-1)]" />
            <span className="text-[12px] text-[var(--red-1)]">
              {getErrorMessage(errorReason, !!value.token, value.modelId)}
            </span>
          </div>
        )}
        <FormErrorText error={error} />
      </div>

      {/* Step 4: LoRA Adapters */}
      <div className="pt-3 border-t border-[var(--gray-2)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] text-[var(--dark-2)]">
            LoRA Adapters
          </span>
          <span className="text-[11px] text-[var(--dark-3)]">(Optional)</span>
          <Tooltip
            content="A base model can be configured with multiple LoRA adapters."
            contentClassName="w-[246px] whitespace-normal"
          >
            <Info className="w-3 h-3 text-[var(--dark-3)]" />
          </Tooltip>
        </div>

        {value.loraAdapters.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 px-3 pb-1.5 text-[12px] text-[var(--dark-3)]">
              <div className="flex items-center gap-1 w-[160px] shrink-0">
                Route
                <Tooltip
                  maxWidth={260}
                  // i18n-disable-next-line
                  contentClassName="w-[260px] whitespace-normal"
                  content={
                    <span>
                      Optional route for this adapter. Leave empty to fall back
                      to the adapter name. Route must be unique within the
                      endpoint.
                    </span>
                  }
                >
                  <Info className="w-3 h-3 text-[var(--dark-3)]" />
                </Tooltip>
              </div>
              <div className="flex-1">Adapter name</div>
            </div>
            <div className="space-y-2">
              {value.loraAdapters.map((adapter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-1.5 rounded-[4px] bg-[var(--gray-3)]"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-[160px] shrink-0">
                      <Input
                        placeholder={adapter.modelId}
                        className={cn(
                          "h-[28px] w-full !border-none !bg-white !shadow-none text-[13px] !text-[var(--dark-1)] placeholder:!text-[var(--dark-3)]",
                          duplicateRouteIndexes.has(index) &&
                            styles.route_input_error,
                        )}
                        value={adapter.modelAlias || ""}
                        onChange={(e) =>
                          handleAdapterAliasChange(index, e.target.value)
                        }
                      />
                    </div>
                    <span
                      className="text-[13px] text-[var(--dark-1)] truncate"
                      title={adapter.modelId}
                    >
                      {adapter.modelId}
                    </span>
                    {value.provider === "huggingface" && (
                      <Link
                        href={`https://huggingface.co/${adapter.modelId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <ExternalLink className="h-3 w-3 text-[var(--dark-3)]" />
                      </Link>
                    )}
                  </div>
                  <button
                    className="text-[12px] text-[var(--red-1)] hover:underline shrink-0 ml-2"
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-3 text-[13px]"
          onClick={handleAddLoRAAdapter}
          disabled={!value.modelId}
          id={CLICK_BTN_IDs.MODELS_CONSOLE.LLM_DE_ADD_LORA_ADAPTER}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add LoRA Adapter
        </Button>
      </div>

      {showHFTokenIntegrationModal && (
        <HFTokenIntegrationModal
          show={showHFTokenIntegrationModal}
          onClose={() => setShowHFTokenIntegrationModal(false)}
          onTokenChange={(token) => onChange?.({ ...value, token })}
        />
      )}

      {showAddAdapterModal && (
        <AddAdapterModal
          show={showAddAdapterModal}
          loraAdapters={value.loraAdapters}
          onClose={() => setShowAddAdapterModal(false)}
          onAdapterSave={(adapters) =>
            onChange?.({
              ...value,
              loraAdapters: adapters,
            })
          }
          token={value.token}
          baseModel={value.modelId}
          provider={value.provider}
        />
      )}
    </div>
  );
}
