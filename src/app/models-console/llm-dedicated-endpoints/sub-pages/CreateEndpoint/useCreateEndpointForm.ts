"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { debounce } from "lodash";
import { z } from "zod";
import { message } from "@/components/ui/standard/notify";
import {
  normalizeEndpointName,
  type ValidationErrors,
  validateControlledComponents,
} from "../../components/form-field/validation";
import type { ModelFieldValue } from "../../components/form-field/ModelField";
import type { AutoscalingConfigValue } from "../../components/form-field/AutoscalingConfig";
import { DEFAULT_RECOMMENDED_CONCURRENCY } from "../../components/form-field/EngineConfig";
import {
  createLLMDedicatedEndpoint,
  getLLMDedicatedSpec,
  getRecommendedEndpointConfig,
  getLLMDedicatedEndpointList,
} from "@/api/dedicated-endpoint";
import { getFullLLMModels } from "@/api/model";
import { normalizeModelId } from "@/app/models/model-detail/utils/model-detail-utils";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";

export type InstanceType = LLMDedicatedSpec & {
  gpuNum: number;
  gpuNums?: number[];
};

interface UseCreateEndpointFormOptions {
  initialModelId?: string;
  goToListPage: () => void;
  goToDetail: (endpoint: LLMDedicatedEndpoint) => void;
}

export function useCreateEndpointForm({
  initialModelId,
  goToListPage,
  goToDetail,
}: UseCreateEndpointFormOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializingModel, setIsInitializingModel] = useState(
    Boolean(initialModelId),
  );
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const [gpuInfo, setGpuInfo] = useState<Record<string, LLMDedicatedSpec>>({});
  const [instanceList, setInstanceList] = useState<InstanceType[] | null>(null);
  const instanceListRef = useRef<InstanceType[] | null>(null);
  const [instanceInfo, setInstanceInfo] = useState<InstanceType | null>(null);
  const instanceInfoRef = useRef<InstanceType | null>(null);

  const nameFieldRef = useRef<HTMLDivElement>(null);
  const modelFieldRef = useRef<HTMLDivElement>(null);
  const instanceFieldRef = useRef<HTMLDivElement>(null);
  const autoscalingFieldRef = useRef<HTMLDivElement>(null);
  const advancedScalingFieldRef = useRef<HTMLDivElement>(null);
  const engineFieldRef = useRef<HTMLDivElement>(null);

  const [endpointName, setEndpointName] = useState("");
  const [modelCheckStatus, setModelCheckStatus] = useState<
    "success" | "error" | "loading" | null
  >(null);
  const [modelValue, setModelValue] = useState<ModelFieldValue>({
    modelId: "",
    token: "",
    loraAdapters: [],
    provider: "huggingface",
  });
  const [autoscalingInfo, setAutoscalingInfo] =
    useState<AutoscalingConfigValue>({
      enabled: true,
      minReplicas: 1,
      maxReplicas: 3,
      cooldownPeriod: 300,
    });

  const [recommendedSpec, setRecommendedSpec] =
    useState<RecommendedEndpointConfig>({
      engineType: "",
      engineVersion: "",
      resources: [],
    });

  const [engineValue, setEngineValue] = useState<{
    maxNumSeqs: number | undefined;
    isSuffixDecodingEnable: boolean | undefined;
  }>({
    maxNumSeqs: DEFAULT_RECOMMENDED_CONCURRENCY,
    isSuffixDecodingEnable: false,
  });

  const maxReplicasLimit = 8;
  const recommendedLoras = useMemo(
    () =>
      modelValue.loraAdapters
        .map((adapter) => ({
          modelId: adapter.modelId.trim(),
          name: (adapter.modelAlias || "").trim(),
          provider: "huggingface" as const,
        }))
        .filter((adapter) => adapter.modelId),
    [modelValue.loraAdapters],
  );

  // Check if endpoint name already exists
  const checkEndpointNameExists = useMemo(
    () =>
      debounce(async (name: string) => {
        if (!name || name.length < 3) return;

        try {
          const res = await getLLMDedicatedEndpointList({
            pageSize: 1,
            pageNum: 1,
            sortKey: "newest",
            filter: { endpointName: name },
          });
          if (res?.endpoints?.length > 0) {
            setValidationErrors((prev) => ({
              ...prev,
              name: "An endpoint with this name already exists",
            }));
          }
        } catch (error) {
          console.error("Error checking endpoint name:", error);
        }
      }, 500),
    [],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      checkEndpointNameExists.cancel();
    };
  }, [checkEndpointNameExists]);

  // Fetch model info and auto-fill form when initialModelId is provided
  useEffect(() => {
    if (!initialModelId) {
      setIsInitializingModel(false);
      return;
    }

    setIsInitializingModel(true);

    const fetchModelInfo = async () => {
      try {
        const models = await getFullLLMModels();
        const normalizedModelId = normalizeModelId(initialModelId);
        const foundModel = models.find(
          (m) => normalizeModelId(m.id) === normalizedModelId,
        );

        if (foundModel) {
          const modelDisplayName =
            foundModel.displayName || foundModel.name || "";
          if (modelDisplayName) {
            setEndpointName(normalizeEndpointName(modelDisplayName));
          }

          const hfMirrorUrl = (foundModel as any).hf_mirror_url;
          const modelIdToUse = hfMirrorUrl || foundModel.id;

          setModelValue({
            modelId: modelIdToUse,
            token: "",
            loraAdapters: [],
            provider: "novita",
          });
        } else {
          setIsInitializingModel(false);
        }
      } catch (error) {
        console.error("Failed to fetch model info:", error);
        setIsInitializingModel(false);
      }
    };

    fetchModelInfo();
  }, [initialModelId]);

  useEffect(() => {
    getLLMDedicatedSpec({}).then((res) => {
      setGpuInfo(
        res.specs.reduce(
          (acc, spec) => {
            acc[spec.gpuName] = spec;
            return acc;
          },
          {} as Record<string, LLMDedicatedSpec>,
        ),
      );
    });
  }, []);

  useEffect(() => {
    if (
      recommendedSpec.resources &&
      recommendedSpec.resources.length > 0 &&
      Object.keys(gpuInfo).length > 0
    ) {
      const newInstanceList = recommendedSpec.resources.map((resource) => {
        return {
          ...gpuInfo[resource.gpuName],
          gpuNum: resource.gpuNums?.[0] ?? 1,
          gpuNums: resource.gpuNums,
        };
      });
      setInstanceList(newInstanceList);
      if (newInstanceList.length > 0) {
        setInstanceInfo(newInstanceList[0]);
      } else {
        setInstanceInfo(null);
      }
    }
  }, [recommendedSpec, gpuInfo]);

  useEffect(() => {
    instanceListRef.current = instanceList;
  }, [instanceList]);

  useEffect(() => {
    instanceInfoRef.current = instanceInfo;
  }, [instanceInfo]);

  useEffect(() => {
    if (modelCheckStatus !== "success" || !modelValue.modelId) {
      return;
    }

    const requestParams: {
      modelId: string;
      hfToken?: string;
      loras?: {
        modelId: string;
        name: string;
        provider: "huggingface";
      }[];
      source?: string;
    } = {
      modelId: modelValue.modelId,
    };

    if (recommendedLoras.length > 0) {
      requestParams.loras = recommendedLoras;
    }

    if (
      modelValue.provider === "huggingface" ||
      (!modelValue.provider && !initialModelId)
    ) {
      requestParams.hfToken = modelValue.token;
    }

    if (initialModelId || modelValue.provider === "novita") {
      requestParams.source = "self_hosting";
    }

    console.log(
      "[getRecommendedEndpointConfig] Request params:",
      requestParams,
    );

    getRecommendedEndpointConfig(requestParams)
      .then((res) => {
        console.log("[getRecommendedEndpointConfig] Response success:", res);
        setRecommendedSpec(res);
        if (res?.resources?.length === 0) {
          setInstanceList([]);
          setInstanceInfo(null);
        }
      })
      .catch((error) => {
        console.error("[getRecommendedEndpointConfig] Response error:", error);
      })
      .finally(() => {
        if (initialModelId) {
          setIsInitializingModel(false);
        }
      });
  }, [
    modelValue.modelId,
    modelCheckStatus,
    modelValue.token,
    modelValue.provider,
    recommendedLoras,
    initialModelId,
  ]);

  useEffect(() => {
    analytics.trackClick(
      CLICK_BTN_IDs.MODELS_CONSOLE.LLM_DE_SELECT_BASE_MODEL,
      {
        modelId: modelValue.modelId,
      },
    );
  }, [modelValue.modelId]);

  const scrollToFirstError = useCallback((errors: ValidationErrors) => {
    const errorFields = [
      { key: "name", ref: nameFieldRef },
      { key: "model", ref: modelFieldRef },
      { key: "instance", ref: instanceFieldRef },
      { key: "autoscaling", ref: autoscalingFieldRef },
      { key: "advancedScaling", ref: advancedScalingFieldRef },
      { key: "engine", ref: engineFieldRef },
    ];

    for (const field of errorFields) {
      if (errors[field.key as keyof ValidationErrors] && field.ref.current) {
        field.ref.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        break;
      }
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const validationResult = validateControlledComponents({
      name: endpointName,
      model: modelValue,
      autoscaling: autoscalingInfo,
      engine: engineValue,
    });

    setValidationErrors(validationResult.errors);

    if (!validationResult.isValid) {
      scrollToFirstError(validationResult.errors);
      return;
    }

    if (!initialModelId && modelCheckStatus !== "success") {
      return;
    }

    if (!instanceInfo) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createLLMDedicatedEndpoint({
        name: endpointName,
        resources: {
          gpu: {
            count: instanceInfo?.gpuNum || 1,
            name: instanceInfo?.gpuName || "",
          },
        },
        scalingPolicy: {
          enable: autoscalingInfo.enabled,
          minReplicas: autoscalingInfo.minReplicas,
          maxReplicas: autoscalingInfo.maxReplicas,
          coolDownPeriod: autoscalingInfo.cooldownPeriod,
        },
        engine: {
          config: {
            maxNumSeqs: engineValue.maxNumSeqs,
          },
        } as LLMDedicatedEndpointEngine,
        isSuffixDecodingEnable: engineValue.isSuffixDecodingEnable,
        baseModel: {
          provider:
            modelValue.provider === "novita"
              ? "self_hosting"
              : modelValue.provider || "huggingface",
          modelId: modelValue.modelId,
          token: modelValue.provider === "novita" ? "" : modelValue.token || "",
        },
        loras: modelValue.loraAdapters.map((adapter) => ({
          provider:
            modelValue.provider === "novita" ? "self_hosting" : "huggingface",
          modelId: adapter.modelId,
          ...(adapter.modelAlias && { name: adapter.modelAlias }),
          ...(modelValue.provider !== "novita" &&
            modelValue.token && { token: modelValue.token }),
        })),
      });
      message.success("Endpoint created successfully");
      // API may return { endpoint: {...} } or { id: "..." } or { endpointId: "..." }
      const endpointData = result?.endpoint;
      const endpointId = endpointData?.id || result?.id || result?.endpointId;
      if (endpointId) {
        goToDetail({
          ...endpointData,
          id: endpointId,
          name: endpointData?.name || endpointName,
        } as LLMDedicatedEndpoint);
      } else {
        goToListPage();
      }
    } catch (error) {
      console.error("Form validation error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    endpointName,
    modelValue,
    autoscalingInfo,
    engineValue,
    initialModelId,
    modelCheckStatus,
    instanceInfo,
    scrollToFirstError,
    goToDetail,
    goToListPage,
  ]);

  const clearValidationError = useCallback(
    (field: keyof ValidationErrors) => {
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors],
  );

  const validateField = useCallback(
    (fieldName: keyof ValidationErrors, value: any, schema: z.ZodSchema) => {
      try {
        schema.parse(value);
        clearValidationError(fieldName);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessage =
            error.errors[0]?.message || `${fieldName} validation failed`;
          setValidationErrors((prev) => ({
            ...prev,
            [fieldName]: errorMessage,
          }));
        }
      }
    },
    [clearValidationError],
  );

  return {
    // State
    isLoading,
    isInitializingModel,
    validationErrors,
    instanceList,
    instanceInfo,
    endpointName,
    modelValue,
    autoscalingInfo,
    engineValue,
    modelCheckStatus,
    recommendedSpec,
    maxReplicasLimit,
    // Refs
    refs: {
      nameFieldRef,
      modelFieldRef,
      instanceFieldRef,
      autoscalingFieldRef,
      advancedScalingFieldRef,
      engineFieldRef,
    },
    // Setters
    setEndpointName,
    setModelValue,
    setAutoscalingInfo,
    setEngineValue,
    setInstanceInfo,
    setInstanceList,
    setModelCheckStatus,
    // Handlers
    handleSubmit,
    clearValidationError,
    validateField,
    checkEndpointNameExists,
  };
}
