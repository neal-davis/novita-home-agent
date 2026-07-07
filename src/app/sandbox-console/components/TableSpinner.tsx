import { cn } from "@/lib/utils";

const spinnerClassName = "iconfont icon-loader inline-block animate-spin";
const spinnerStyle = {
  fontSize: 24,
  color: "var(--dark-3)",
  animationDuration: "1.6s",
  opacity: 1,
};

export default function TableSpinner({
  className,
  tdColNum = 1,
  standalone = false,
  size = 24,
}: {
  className?: string;
  tdColNum?: number;
  standalone?: boolean;
  size?: number;
}) {
  if (standalone) {
    return (
      <span
        className={cn(spinnerClassName, className)}
        style={{ ...spinnerStyle, fontSize: size }}
      />
    );
  }

  return (
    <tr
      className={cn(
        "absolute inset-0 mx-auto left-1/2 top-[calc(33%+40px)]",
        className,
      )}
    >
      <td
        colSpan={tdColNum}
        className={spinnerClassName}
        style={spinnerStyle}
      ></td>
    </tr>
  );
}
