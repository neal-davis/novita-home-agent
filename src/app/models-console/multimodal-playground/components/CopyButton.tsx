import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
interface CopyButtonProps {
  content: string;
  className?: string;
}
export const CopyButton = ({ content, className }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`rounded-[4px] ${className || ""}`}
    >
      {copied ? (
        <Check size={16} className="mr-1" />
      ) : (
        <Copy size={16} className="mr-1" />
      )}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
};
