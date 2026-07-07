import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./index.module.scss";

export function ConsoleButtonDefault({ children, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      variant="default"
      className={cn(props.className, styles.console_button)}
    >
      {children}
    </Button>
  );
}
