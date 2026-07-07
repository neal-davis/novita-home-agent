import { AlertCircle } from "lucide-react";
import styles from "./form-error-text.module.scss";

interface FormErrorTextProps {
  error?: string;
}

export default function FormErrorText({ error }: FormErrorTextProps) {
  if (!error) {
    return null;
  }

  return (
    <p className={styles.error_message}>
      <AlertCircle className="w-3 h-3" />
      <span>{error}</span>
    </p>
  );
}
