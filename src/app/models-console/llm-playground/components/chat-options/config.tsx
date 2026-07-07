"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import styles from "./styles.module.scss";
import { NumberInput } from "@/components/ui/standard/number-input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LLMModelWithStatus } from "@/types/models";
import { Info } from "lucide-react";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { ChatMode } from "../../types/types";

const description = {
  max_tokens:
    "Maximum number of tokens in the generated text — shorter length has faster performance",
  system_prompt: 'System persona, such as "You are an AI assistant."',
  temperature: "Creativity and randomness of the response",
  top_p:
    "Dynamically adjusts the number of choices for each predicted token, which helps to maintain diversity and generate more fluent and natural-sounding text",
  presence_penalty:
    "A number between -2.0 and 2.0 where a positive value increases the likelihood of a model talking about new topics",
  frequency_penalty:
    "A number between -2.0 and 2.0 where a positive value decreases the likelihood of repeating tokens that have already been mentioned",
  repetition_penalty:
    "Reduce the likelihood of repeating prompt text or getting stuck in a loop",
  min_p:
    "A number between 0 and 1 that can be used as an alternative to top_p and top-k",
  top_k:
    "Limits the number of choices for the next predicted word or token, which helps to speed up the generation process and can improve the quality of the generated text",
  response_format:
    "Use a JSON schema to define the structure of the model's response format or let the model decide it's own structure.",
};

export const defaultParams = {
  max_tokens: 512,
  temperature: 1,
  response_format: {
    type: "text",
  },
  system_content: "Be a helpful assistant",
  presence_penalty: 0,
  frequency_penalty: 0,
  top_p: 1,
  min_p: 0,
  top_k: 50,
  repetition_penalty: 1,
} as const;

export type ChatOptionConfig = {
  value: number | string;
  min?: number;
  max?: number;
  step?: number;
};

export type ConfigRef = {
  getChatParams: () => Record<string, any>;
};

export interface ConfigProps {
  currentModel: LLMModelWithStatus | null;
  chatMode: ChatMode;
  onParamsChange: (params: Record<string, any>) => void;
  isDeEndpoint?: boolean;
}

export const LLMConfig = forwardRef<ConfigRef, ConfigProps>((props, ref) => {
  const { currentModel, onParamsChange, chatMode, isDeEndpoint } = props;
  const [params, setParams] = useState<Record<string, ChatOptionConfig>>({
    max_tokens: {
      value: defaultParams.max_tokens,
      min: 0,
      max: 2048,
      step: 1,
    },
    temperature: {
      value: defaultParams.temperature,
      min: 0,
      max: 2,
      step: 0.1,
    },
    top_p: {
      value: defaultParams.top_p,
      min: 0,
      max: 1,
      step: 0.1,
    },
    min_p: {
      value: defaultParams.min_p,
      min: 0,
      max: 1,
      step: 0.01,
    },
    top_k: {
      value: defaultParams.top_k,
      min: 0,
      max: 100,
      step: 1,
    },
    presence_penalty: {
      value: defaultParams.presence_penalty,
      min: -2,
      max: 2,
      step: 0.1,
    },
    frequency_penalty: {
      value: defaultParams.frequency_penalty,
      min: -2,
      max: 2,
      step: 0.1,
    },
    repetition_penalty: {
      value: defaultParams.repetition_penalty,
      min: -2,
      max: 2,
      step: 0.1,
    },
    system_content: {
      value: defaultParams.system_content,
    },
    response_format: {
      value: defaultParams.response_format.type,
    },
  });

  const chatParams = useMemo(() => {
    const responseFormatValue = params.response_format.value as string;
    return {
      max_tokens: params.max_tokens.value,
      temperature: params.temperature.value,
      top_p: params.top_p.value,
      min_p: params.min_p.value,
      top_k: params.top_k.value,
      presence_penalty: params.presence_penalty.value,
      frequency_penalty: params.frequency_penalty.value,
      repetition_penalty: params.repetition_penalty.value,
      system_content: params.system_content.value,
      // Only include response_format when not "default"
      ...(responseFormatValue === "default"
        ? {}
        : {
            response_format: {
              type: responseFormatValue,
            },
          }),
    };
  }, [params]);

  useImperativeHandle(ref, () => ({
    getChatParams: () => chatParams,
  }));

  useEffect(() => {
    if (currentModel) {
      setParams((prev) => ({
        ...prev,
        model: {
          value: currentModel.id,
        },
        response_format: {
          value: isDeEndpoint ? "default" : "text",
        },
        max_tokens: {
          ...(prev?.max_tokens ?? {}),
          max: currentModel.max_output_tokens || prev?.max_tokens?.max || 2048,
          value:
            Math.floor(
              (currentModel.max_output_tokens || currentModel.context_size) / 2,
            ) ||
            prev?.max_tokens?.value ||
            1024,
        },
        temperature: {
          ...(prev?.temperature ?? {}),
          value: currentModel.id === "deepseek/deepseek-r1" ? 0.6 : 1.0,
        },
      }));
    }
  }, [setParams, currentModel, isDeEndpoint]);

  useEffect(() => {
    onParamsChange(chatParams);
  }, [chatParams, onParamsChange]);

  return (
    <div className={cn(styles.wrap)}>
      <div className={styles.title}>Model Configuration</div>
      {chatMode === ChatMode.Chat && (
        <>
          <div className={styles.subtitle}>
            Response format{" "}
            <Tooltip
              placement="topLeft"
              title={
                <span className="text-white">
                  {description.response_format}
                </span>
              }
              color="rgba(0, 0, 0, 0.85)"
            >
              <Info className="w-3 h-3 text-common-dark-5" />
            </Tooltip>
          </div>
          <div className="mt-2 mb-4">
            <Select
              defaultValue="text"
              value={(params.response_format?.value as string) ?? "text"}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  response_format: { value },
                }));
              }}
            >
              <SelectTrigger className="border-common-gray-2">
                <SelectValue style={{ height: 36 }} />
              </SelectTrigger>
              <SelectContent>
                {isDeEndpoint && (
                  <SelectItem value="default">default</SelectItem>
                )}
                <SelectItem value="text">text</SelectItem>
                {((currentModel?.features || []).includes(
                  "structured-outputs",
                ) ||
                  isDeEndpoint) && (
                  <SelectItem value="json_object">json_object</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className={styles.subtitle}>
            System Prompt{" "}
            <Tooltip
              placement="topLeft"
              title={
                <span className="text-white">{description.system_prompt}</span>
              }
              color="rgba(0, 0, 0, 0.85)"
            >
              <Info className="w-3 h-3 text-common-dark-5" />
            </Tooltip>
          </div>
          <div className="mt-2 mb-4">
            <textarea
              className={styles.textarea}
              value={params?.system_content?.value}
              onChange={(e) => {
                setParams((pre) => ({
                  ...pre,
                  system_content: {
                    value: e.target.value,
                  },
                }));
              }}
            ></textarea>
          </div>
        </>
      )}
      <div className={styles.params}>
        {Object.keys(params)
          .filter((one) =>
            [
              "max_tokens",
              "top_p",
              "temperature",
              "presence_penalty",
              "frequency_penalty",
              "repetition_penalty",
              "min_p",
              "top_k",
            ].includes(one),
          )
          .map((key) => (
            <OptionItem
              key={key}
              attribute={key}
              config={{ ...params[key] }}
              onChange={(key, value) => {
                setParams((prev) => ({
                  ...prev,
                  [key]: {
                    ...prev[key],
                    value,
                  },
                }));
              }}
            />
          ))}
      </div>
    </div>
  );
});

LLMConfig.displayName = "Config";

export function OptionItem({
  attribute,
  config,
  onChange,
}: {
  config: ChatOptionConfig;
  attribute: string;
  onChange: (key: string, value: number) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className={styles.subtitle}>
        {attribute}{" "}
        <Tooltip
          placement="topLeft"
          title={
            <span className="text-white">
              {description[attribute as keyof typeof description]}
            </span>
          }
          color="rgba(0, 0, 0, 0.85)"
        >
          <Info className="w-3 h-3 text-common-dark-5" />
        </Tooltip>
      </div>
      <div className={cn("flex mt-1 gap-2", styles.sliderWrapper)}>
        <Slider
          min={config.min}
          max={config.max}
          value={[config.value as number]}
          onValueChange={(value) => {
            onChange(attribute, value[0]);
          }}
          style={{
            width: "80%",
          }}
          step={config.step}
          className={cn(
            "[&_.slider-track]:h-1 [&_.slider-track]:bg-common-gray-1 [&_.slider-range]:bg-brand-1 [&_.slider-thumb]:border-brand-1 [&_.slider-thumb]:w-4 [&_.slider-thumb]:h-4",
          )}
          thumbClassName="focus-visible:ring-offset-0 focus-visible:ring-0"
        />
        <NumberInput
          value={Number(config.value)}
          onChange={(value) => onChange(attribute, value ?? 0)}
          step={config.step}
          min={config.min}
          max={config.max}
          controls={false}
          className={styles.inputNumber}
        />
      </div>
    </div>
  );
}
