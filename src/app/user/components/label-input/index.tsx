import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Eye as EyeOutlined,
  EyeOff as EyeInvisibleOutlined,
} from "lucide-react";

type LabelInputValue = string | number | undefined;

type LabelInputProps<T extends LabelInputValue> = {
  value: T;
  onChange: (value: T) => void;
  label: string;
  placeholder?: string;
  name: string;
  icon?: React.ReactNode;
  rightLabel?: React.ReactNode;
  status?: "error" | undefined;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
  disabled?: boolean;
  isRequired?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function LabelInput<T extends LabelInputValue>({
  value,
  onChange,
  label,
  placeholder,
  name,
  icon,
  rightLabel,
  status,
  type,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  onInput,
  disabled,
  isRequired,
}: LabelInputProps<T>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex justify-between">
        <Label
          htmlFor={name}
          className="leading-[20px] text-sm font-normal text-common-dark-1"
        >
          {isRequired && <span className="text-red-500 mr-1">*</span>}
          {label}
        </Label>
        {rightLabel}
      </div>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          id={name}
          placeholder={placeholder}
          className={cn(
            "h-[42px] leading-none rounded-[4px]",
            status === "error" && "!border-red-500",
            disabled && "!bg-gray-100 !border-gray-200",
          )}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onInput={onInput}
        />
        {icon}
      </div>
    </div>
  );
}

export function LabelPassword(props: LabelInputProps<string>) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <LabelInput
      {...props}
      icon={
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowPassword(!showPassword);
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        </span>
      }
      type={showPassword ? "text" : "password"}
    />
  );
}
