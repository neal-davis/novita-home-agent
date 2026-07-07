import { CSSProperties } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button as UIButton } from "@/components/ui/button"

type ButtonType = "primary" | "normal" | "secondary" | "outline" | "ghost" | "link" | "text" | "danger"
type ButtonSize = "small" | "medium" | "large"

type ButtonProps = {
  children?: React.ReactNode;
  height?: number
  background?: string
  icon?: React.ReactNode
  onClick?: () => void
  type?: ButtonType;
  size?: ButtonSize;
  width?: number;
  shape?: "circle" | "round" | "square";
  style?: React.CSSProperties;
  renderTag?: "button" | "link";
  link?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  elAttrs?: { [key: string]: string | number };
  color?: string
}

function getVariant(type: ButtonType, disabled?: boolean) {
  if (disabled) {
    return "disabled"
  }
  switch (type) {
    case "primary":
      return "default"
    case "normal":
      return "outline"
    case "secondary":
      return "secondary"
    case "outline":
      return "outline"
    case "ghost":
      return "ghost"
    case "link":
      return "link"
    case "text":
      return "link"
    case "danger":
      return "warn"
    default:
      return "default"
  }
}

function getSize(size: ButtonSize, type: ButtonType) {
  if (type === "link" || type === "text") {
    return "link"
  }
  switch (size) {
    case "small":
      return "sm"
    case "medium":
      return "default"
    case "large":
      return "lg"
    default:
      return "default"
  }
}

export default function Button({
  children,
  type = "primary",
  width,
  height,
  shape = "square",
  size = "medium",
  style,
  onClick,
  renderTag = "button",
  link,
  loading,
  disabled,
  className,
  id,
  elAttrs,
  background,
  icon,
  // color,
}: ButtonProps) {
  const btnStyle: CSSProperties = {
    ...style,
  }
  if (height) {
    btnStyle.height = `${height}px`
    btnStyle.lineHeight = `${height}px`
  }
  if (width) {
    btnStyle.width = `${width}px`
  }
  if (background) {
    btnStyle.background = background
  }
  if (shape === "circle") {
    btnStyle.borderRadius = "50%"
  }
  if (shape === "round") {
    btnStyle.borderRadius = "var(--large-radius)"
  }

  const btnVariant = getVariant(type, disabled)
  const btnSize = getSize(size, type)

  return <UIButton
    variant={btnVariant}
    size={btnSize}
    asChild={renderTag === "link"}
    style={btnStyle}
    className={className}
    id={id}
    onClick={onClick ? () => {
      !loading && !disabled && onClick && onClick();
    } : undefined}
    disabled={loading || disabled}
    
  >
    {renderTag === "link" ?
      <Link href={link || ""} id={id} {...elAttrs}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
        {icon}
      </Link> : 
      <>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
        {icon}
      </>
    }
  </UIButton>
}
