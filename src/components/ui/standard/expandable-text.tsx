import { useState, useRef, useEffect } from "react";
import { Button } from "../button";

export default function ExpandableText({
  text,
  maxLines = 2,
  className,
}: {
  text: string;
  maxLines?: number;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
    const maxHeight = lineHeight * maxLines;
    console.log("maxHeight", maxHeight);
    console.log("element.scrollHeight", element.scrollHeight);
    setIsOverflowing(element.scrollHeight > maxHeight);
  }, [text, maxLines]);

  return (
    <div className={`relative ${className}`}>
      {/* Hidden element for height measurement */}
      <p
        ref={textRef}
        className="invisible absolute"
        style={{
          width: "100%",
        }}
      >
        {text}
      </p>

      {/* Actual visible text */}
      <p
        className={`overflow-hidden ${
          !isExpanded ? `line-clamp-${maxLines}` : ""
        }`}
        style={{
          WebkitLineClamp: !isExpanded ? maxLines : "unset",
          WebkitBoxOrient: "vertical",
          display: "-webkit-box",
        }}
      >
        {text}
      </p>
      {isOverflowing && (
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="!text-primary hover:underline font-small"
          variant="text"
          size="link"
        >
          {isExpanded ? "Folding" : "Expand"}
        </Button>
      )}
    </div>
  );
}
