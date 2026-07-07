import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface OCRPromptOption {
  id: string;
  label: string;
  prompt: string;
  description?: string;
}

function createOCRPromptOptions(): OCRPromptOption[] {
  return [
    {
      id: "document",
      label: "Document",
      prompt: "<|grounding|>Convert the document to markdown.",
      description: "Convert document to markdown format",
    },
    {
      id: "other-image",
      label: "Other Image",
      prompt: "<|grounding|>OCR this image.",
      description: "OCR recognition for general images",
    },
    {
      id: "without-layouts",
      label: "Without Layouts",
      prompt: "Free OCR.",
      description: "Free OCR without layout detection",
    },
    {
      id: "figures-in-document",
      label: "Figures in Document",
      prompt: "Parse the figure.",
      description: "Parse figures from documents",
    },
    {
      id: "general",
      label: "General",
      prompt: "Describe this image in detail.",
      description: "Detailed image description",
    },
    {
      id: "rec",
      label: "Recognition",
      prompt: "Locate <|ref|>xxxx<|/ref|> in the image.",
      description: "Locate specific text in image (requires custom input)",
    },
  ];
}

interface OCRPromptSelectorProps {
  value: string;
  onChange: (prompt: string, needsCustomInput?: boolean) => void;
  disabled?: boolean;
  width?: number;
}

export const OCRPromptSelector = React.memo(
  ({ value, onChange, disabled, width }: OCRPromptSelectorProps) => {
    const ocrPromptOptions = createOCRPromptOptions();
    const [customText, setCustomText] = useState("");
    const [selectedOption, setSelectedOption] = useState<string>("other-image");

    // Initialize with the default prompt
    useEffect(() => {
      const defaultOption = ocrPromptOptions.find(
        (opt) => opt.id === "other-image",
      );
      if (defaultOption) {
        onChange(defaultOption.prompt, false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOptionChange = useCallback(
      (optionId: string) => {
        setSelectedOption(optionId);
        const option = ocrPromptOptions.find((opt) => opt.id === optionId);
        if (option) {
          if (optionId === "rec") {
            // For recognition mode, we need custom input
            setCustomText("");
            onChange("", true);
          } else {
            onChange(option.prompt, false);
          }
        }
      },
      [ocrPromptOptions, onChange],
    );

    const handleCustomTextChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setCustomText(text);
        if (selectedOption === "rec") {
          onChange(`Locate <|ref|>${text}<|/ref|> in the image.`, false);
        }
      },
      [onChange, selectedOption],
    );

    const selectedOptionData = ocrPromptOptions.find(
      (opt) => opt.id === selectedOption,
    );

    return (
      <div className="flex flex-col gap-3 py-2" style={{ width }}>
        {/* OCR Mode Selector */}
        <div className="flex flex-col gap-2">
          {/* <Label className="font-subtle-medium text-[var(--dark-1)]">
            Select OCR Mode
          </Label> */}
          <Select
            value={selectedOption}
            onValueChange={handleOptionChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                "w-full bg-white border-[var(--gray-2)] font-body h-14",
                {
                  "opacity-50 cursor-not-allowed": disabled,
                },
              )}
            >
              <SelectValue placeholder="Select OCR mode..." />
            </SelectTrigger>
            <SelectContent>
              {ocrPromptOptions.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-subtle-medium">{option.label}</span>
                    <span className="text-xs text-[var(--dark-3)]">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Text Input for Recognition Mode */}
        {selectedOption === "rec" && (
          <div className="flex flex-col gap-2">
            <Label className="font-subtle-medium text-[var(--dark-1)]">
              Enter text to locate
            </Label>
            <Input
              type="text"
              value={customText}
              onChange={handleCustomTextChange}
              placeholder="Enter the text to locate in the image..."
              disabled={disabled}
              className={cn(
                "w-full bg-white border-[var(--gray-2)] font-body h-10 !text-sm",
                {
                  "opacity-50 cursor-not-allowed": disabled,
                },
              )}
            />
            {customText && (
              <p className="text-xs text-[var(--dark-3)] px-1">
                Prompt: Locate{" "}
                <span className="font-medium text-[var(--dark-2)]">
                  &lt;|ref|&gt;{customText}&lt;|/ref|&gt;
                </span>{" "}
                in the image.
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

OCRPromptSelector.displayName = "OCRPromptSelector";
