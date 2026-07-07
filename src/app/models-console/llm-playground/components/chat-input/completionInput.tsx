import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Square } from "lucide-react";
import { useRef, useEffect, useCallback } from "react";

interface CompletionInputProps {
  className?: string;
  isLoading: boolean;
  input: string;
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => void;
  stopCompletion: () => void;
}

export function CompletionInput({
  className,
  isLoading,
  setInput,
  handleInputChange,
  handleSubmit,
  input,
  stopCompletion,
}: CompletionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAutoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const minHeight = 88;
      const maxHeight = 200;
      const scrollHeight = textarea.scrollHeight;

      if (scrollHeight <= maxHeight) {
        textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`;
        textarea.style.overflowY = "hidden";
      } else {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto";
      }
    }
  }, []);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit(e);
      setInput("");
      handleAutoResize();
    },
    [handleSubmit, setInput, handleAutoResize],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
        setInput("");
        handleAutoResize();
      }
    },
    [handleSubmit, setInput, handleAutoResize],
  );

  useEffect(() => {
    handleAutoResize();
  }, [input, handleAutoResize]);

  return (
    <div
      className={cn(
        "ring-1 ring-common-gray-1 rounded-xl p-3 w-full focus-within:ring-2 focus-within:ring-[var(--brand-1)]",
        className,
      )}
    >
      <form className="relative pr-10" onSubmit={handleFormSubmit}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full resize-none outline-none border-none min-h-[88px] placeholder:text-common-dark-2"
          placeholder="Say something..."
          rows={1}
        />
        {isLoading ? (
          <Button
            variant="noborderghost"
            className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center rounded-full bg-common-gray-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stopCompletion();
            }}
          >
            <Square
              className="h-4 w-4 animate-pulse opacity-80"
              fill="var(--dark-1)"
            />
          </Button>
        ) : (
          <Button
            variant="default"
            className={cn(
              "absolute right-0 top-0",
              !input.trim() && "bg-common-dark-4 !text-white",
            )}
            disabled={!input.trim()}
          >
            <SendHorizontal className="w-4 h-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
