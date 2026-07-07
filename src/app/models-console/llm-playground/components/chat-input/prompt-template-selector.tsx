import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { PromptTemplate } from "../../types/modelConstraints";

interface PromptTemplateSelectorProps {
  templates: PromptTemplate[];
  selectedTemplate: PromptTemplate | null;
  onSelectTemplate: (template: PromptTemplate) => void;
  className?: string;
}

export function PromptTemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  className,
}: PromptTemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTemplate = (template: PromptTemplate) => {
    onSelectTemplate(template);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2",
          "border border-common-gray-2 rounded-md",
          "bg-white hover:bg-common-gray-3 transition-colors",
          "text-sm text-left",
          isOpen && "border-[var(--brand-0)]",
        )}
      >
        <div className="flex-1 min-w-0">
          {selectedTemplate ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-common-dark-1">
                {selectedTemplate.label}
              </span>
              {selectedTemplate.description && (
                <span className="text-xs text-common-dark-3 truncate">
                  {selectedTemplate.description}
                </span>
              )}
            </div>
          ) : (
            <span className="text-common-dark-3">Select a prompt template</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-common-dark-3 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 w-full bottom-full mb-1",
            "bg-white border border-common-gray-2 rounded-md shadow-lg",
            "max-h-[300px] overflow-y-auto",
          )}
        >
          {templates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelectTemplate(template)}
                className={cn(
                  "w-full flex items-start gap-2 px-3 py-2",
                  "hover:bg-common-gray-3 transition-colors",
                  "text-left",
                  isSelected && "bg-common-gray-3",
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-common-dark-1">
                    {template.label}
                  </div>
                  {template.description && (
                    <div className="text-xs text-common-dark-3 mt-0.5">
                      {template.description}
                    </div>
                  )}
                  <div className="text-xs text-common-dark-3 mt-1 font-mono bg-common-gray-2 px-2 py-1 rounded">
                    {template.prompt}
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[var(--brand-0)] shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
