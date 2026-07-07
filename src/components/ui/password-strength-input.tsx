"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Eye as EyeOutlined,
  EyeOff as EyeInvisibleOutlined,
} from "lucide-react";
import { Check, X } from "lucide-react";

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  {
    label: "At least 8 characters and less than 64 characters",
    test: (pwd) => pwd.length >= 8 && pwd.length <= 64,
  },
  {
    label: "Contains letter",
    test: (pwd) => /[a-zA-Z]/.test(pwd),
  },
  {
    label: "Contains number",
    test: (pwd) => /\d/.test(pwd),
  },
  {
    label: "Contains special character",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>\\[\];'`~\-=_+/]/.test(pwd),
  },
];

interface PasswordStrengthInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  name: string;
  status?: "error" | undefined;
  isRequired?: boolean;
  onBlur?: () => void;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function PasswordStrengthInput({
  value,
  onChange,
  label,
  placeholder,
  name,
  status,
  isRequired,
  onBlur,
  onInput,
  className,
}: PasswordStrengthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showStrengthIndicator, setShowStrengthIndicator] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowStrengthIndicator(e.target.value.length > 0);
    onInput?.(e);
  };

  const handleFocus = () => {
    setShowStrengthIndicator(value.length > 0);
  };

  const handleBlur = () => {
    setShowStrengthIndicator(false);
    onBlur?.();
  };

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
      </div>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          id={name}
          placeholder={placeholder}
          className={cn(
            "h-[42px] leading-none rounded-[4px] pr-10",
            status === "error" && "!border-red-500",
          )}
        />
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
      </div>

      {showStrengthIndicator && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md border">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Password requirements:
          </div>
          <div className="space-y-1">
            {passwordRules.map((rule, index) => {
              const isPassed = rule.test(value);
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {isPassed ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span
                    className={cn(
                      isPassed ? "text-green-600" : "text-gray-500",
                    )}
                  >
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* <div className="mt-2 text-xs text-gray-600">
            Need at least 3 of the above requirements
          </div> */}
        </div>
      )}
    </div>
  );
}
