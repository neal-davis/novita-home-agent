import { Check } from "lucide-react";

export const SelectedCorner = () => (
  <div
    className="absolute top-[-3px] right-[-3px] flex h-[22px] w-[22px] items-center justify-center rounded-bl-[8px] rounded-tr-[8px] bg-[var(--dark-1)] shadow-sm"
    aria-hidden
  >
    <Check className="h-[14px] w-[14px] text-white" />
  </div>
);
