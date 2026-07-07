"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import FormErrorText from "@/components/ui/standard/form-error-text";
import ModelField from "../../components/form-field/ModelField";
import GPUTileSelector from "../../components/form-field/GPUTileSelector";
import AutoscalingConfig from "../../components/form-field/AutoscalingConfig";
import EngineConfig from "../../components/form-field/EngineConfig";
import PricePreviewPanel from "../../components/PricePreviewPanel";
import {
  createAutoscalingSchema,
  createEndpointNameSchema,
  createEngineSchema,
} from "../../components/form-field/validation";
import { useCreateEndpointForm } from "./useCreateEndpointForm";
import { CreateEndpointHeader } from "./CreateEndpointHeader";
import { CancelConfirmDialog } from "./CancelConfirmDialog";
import styles from "./CreateEndpoint.module.scss";

const StepHeader = ({ step, title }: { step: number; title: string }) => (
  <div className="flex items-center gap-2">
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--brand-0)] text-white text-[12px] font-medium">
      {step}
    </span>
    <h3 className="text-[14px] leading-[18px] font-medium text-[var(--dark-1)]">
      {title}
    </h3>
  </div>
);

interface CreateEndpointProps {
  goToListPage: () => void;
  goToDetail: (endpoint: LLMDedicatedEndpoint) => void;
  initialModelId?: string;
}

export default function CreateEndpoint({
  goToListPage,
  goToDetail,
  initialModelId,
}: CreateEndpointProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const endpointNameSchema = createEndpointNameSchema();
  const autoscalingSchema = createAutoscalingSchema();
  const engineSchema = createEngineSchema();

  const form = useCreateEndpointForm({
    initialModelId,
    goToListPage,
    goToDetail,
  });

  const handleCancelClick = useCallback(() => {
    const hasContent =
      form.endpointName || form.modelValue.modelId || form.instanceInfo;
    if (hasContent) {
      setShowCancelConfirm(true);
    } else {
      goToListPage();
    }
  }, [
    form.endpointName,
    form.modelValue.modelId,
    form.instanceInfo,
    goToListPage,
  ]);

  return (
    <div>
      <CreateEndpointHeader onBack={handleCancelClick} />

      <div className="flex flex-row gap-4 w-full">
        {/* Left: 5-Step Configuration Form */}
        <div className="relative flex-1 min-w-0 pb-[120px] lg:pb-0">
          <fieldset
            disabled={form.isInitializingModel}
            className={cn({
              "pointer-events-none select-none opacity-60":
                form.isInitializingModel,
            })}
          >
            {/* Step 1: Endpoint Name */}
            <div ref={form.refs.nameFieldRef} className={styles.form_card}>
              <div className="mb-3">
                <StepHeader step={1} title="Endpoint Name" />
              </div>
              <Input
                placeholder="Please enter the endpoint name..."
                className={cn("h-[40px]", {
                  [styles.input_error]: form.validationErrors.name,
                })}
                autoFocus={!form.isInitializingModel}
                value={form.endpointName}
                onChange={(e) => {
                  const newName = e.target.value;
                  form.setEndpointName(newName);
                  form.clearValidationError("name");
                  form.validateField(
                    "name",
                    { name: newName },
                    endpointNameSchema,
                  );
                  if (newName.length >= 3) {
                    form.checkEndpointNameExists(newName);
                  }
                }}
              />
              <p className="mt-1 text-[12px] leading-[16px] text-[var(--dark-3)]">
                Lowercase letters, numbers and hyphens. Must start with a letter
                (3-63 chars).
              </p>
              <FormErrorText error={form.validationErrors.name} />
            </div>

            {/* Step 2: Model + LoRA */}
            <div
              ref={form.refs.modelFieldRef}
              className={`${styles.form_card} mt-4`}
            >
              <div className="mb-2">
                <StepHeader step={2} title="Model" />
              </div>
              <ModelField
                value={form.modelValue}
                onChange={(value) => {
                  form.setModelValue(value);
                  form.clearValidationError("model");
                }}
                checkStatus={form.modelCheckStatus}
                setCheckStatus={form.setModelCheckStatus}
                error={form.validationErrors.model}
                hideToken={!!initialModelId}
              />
            </div>

            {/* Step 3: GPU Configuration */}
            <div
              ref={form.refs.instanceFieldRef}
              className={`${styles.form_card} mt-4`}
            >
              <div className="mb-1">
                <StepHeader step={3} title="GPU Configuration" />
              </div>
              <p className="text-[12px] text-[var(--dark-3)] mb-3">
                Available GPU types and quantities depend on the selected model.
              </p>
              {form.instanceList ? (
                <GPUTileSelector
                  selectedInstance={form.instanceInfo}
                  instanceList={form.instanceList || []}
                  setInstanceList={form.setInstanceList}
                  onChange={(value) => {
                    form.setInstanceInfo(value);
                  }}
                />
              ) : form.modelValue.modelId ? (
                <div className="mt-4">
                  <Skeleton className="h-[120px] rounded-[6px] animate-pulse" />
                </div>
              ) : (
                <div className="mt-4 p-6 rounded-[6px] border border-dashed border-[var(--gray-2)] bg-[var(--gray-4)]">
                  <p className="text-[13px] text-[var(--dark-3)] text-center">
                    Please select a model first to see available GPU options.
                  </p>
                </div>
              )}
            </div>

            {/* Step 4: Autoscaling Configuration */}
            <div
              ref={form.refs.autoscalingFieldRef}
              className={`${styles.form_card} mt-4`}
            >
              <div className="mb-3">
                <StepHeader step={4} title="Autoscaling Configuration" />
              </div>
              <AutoscalingConfig
                instanceGPUCount={form.instanceInfo?.gpuNum || 1}
                value={form.autoscalingInfo}
                maxReplicasLimit={form.maxReplicasLimit}
                onChange={(value) => {
                  form.setAutoscalingInfo(value);
                  form.clearValidationError("autoscaling");
                  form.validateField("autoscaling", value, autoscalingSchema);
                }}
                error={form.validationErrors.autoscaling}
                mode="view"
              />
            </div>

            {/* Step 5: Engine Configuration */}
            <div
              ref={form.refs.engineFieldRef}
              className={`${styles.form_card} mt-4 mb-6`}
            >
              <div className="mb-3">
                <StepHeader step={5} title="Engine Configuration" />
              </div>
              <EngineConfig
                value={{
                  engineType: form.recommendedSpec.engineType,
                  engineVersion: form.recommendedSpec.engineVersion,
                  maxNumSeqs: form.engineValue.maxNumSeqs,
                  isSuffixDecodingEnable:
                    form.engineValue.isSuffixDecodingEnable,
                }}
                onChange={(value) => {
                  form.setEngineValue({
                    maxNumSeqs: value.maxNumSeqs,
                    isSuffixDecodingEnable: value.isSuffixDecodingEnable,
                  });
                  form.clearValidationError("engine");
                  form.validateField("engine", value, engineSchema);
                }}
                error={form.validationErrors.engine}
                mode="view"
              />
            </div>
          </fieldset>
          {form.isInitializingModel && (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-[6px] bg-white/70 pt-32 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-[6px] border border-[var(--gray-2)] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--dark-2)]" />
                <span className="text-[13px] text-[var(--dark-2)]">
                  Loading model configuration...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Cost Estimation Panel - Desktop */}
        <div className="hidden lg:block sticky top-4 self-start">
          <PricePreviewPanel
            gpuName={form.instanceInfo?.displayName || ""}
            gpuPrice={form.instanceInfo?.discount || 0}
            gpuPricePrecision={form.instanceInfo?.pricePrecision || 2}
            gpuCount={form.instanceInfo?.gpuNum || 1}
            minReplicas={form.autoscalingInfo.minReplicas}
            maxReplicas={form.autoscalingInfo.maxReplicas}
            autoscalingEnabled={form.autoscalingInfo.enabled}
            isLoading={form.isLoading || form.isInitializingModel}
            loadingText={
              form.isInitializingModel ? "Loading..." : "Creating..."
            }
            onSubmit={form.handleSubmit}
          />
        </div>
      </div>

      {/* Mobile: Fixed Bottom Cost Estimation Panel */}
      <div className="lg:hidden fixed bottom-0 left-[218px] right-0 z-[50] bg-white border-t border-[var(--gray-2)] p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        <PricePreviewPanel
          gpuName={form.instanceInfo?.displayName || ""}
          gpuPrice={form.instanceInfo?.discount || 0}
          gpuPricePrecision={form.instanceInfo?.pricePrecision || 2}
          gpuCount={form.instanceInfo?.gpuNum || 1}
          minReplicas={form.autoscalingInfo.minReplicas}
          maxReplicas={form.autoscalingInfo.maxReplicas}
          autoscalingEnabled={form.autoscalingInfo.enabled}
          isLoading={form.isLoading || form.isInitializingModel}
          loadingText={form.isInitializingModel ? "Loading..." : "Creating..."}
          onSubmit={form.handleSubmit}
          isMobile={true}
        />
      </div>

      <CancelConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirm={() => {
          setShowCancelConfirm(false);
          goToListPage();
        }}
      />
    </div>
  );
}
