import styles from "./resultModal.module.css";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function ResultModal({
  open,
  setOpen,
  width = 600,
  children,
  message,
  status = "unset",
  iconStyle = "",
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  status?:
    | "success"
    | "error"
    | "warning"
    | "info"
    | "default"
    | "processing"
    | "unset";
  width?: number;
  message?: string | React.ReactNode;
  children?: React.ReactNode;
  iconStyle?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent style={{ maxWidth: width }}>
        <DialogTitle className="sr-only">Result</DialogTitle>
        {status === "success" && (
          <img
            className={cn(styles.ico, iconStyle)}
            src="/icons/success.svg"
            alt="success"
          />
        )}
        {status === "error" && (
          <img className={styles.ico} src="/icons/fail.png" alt="error" />
        )}
        {status === "warning" && (
          <img className={styles.ico} src="/icons/warning.png" alt="warning" />
        )}
        {typeof message === "string" ? (
          <div className={styles.message}>{message}</div>
        ) : (
          message
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
