import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./index.module.scss";

export function ConsoleButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      variant="secondary"
      className={cn(props.className, styles.console_button)}
    >
      {children}
    </Button>
  );
}
