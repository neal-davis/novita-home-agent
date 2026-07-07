import { Switch } from "@/components/ui/switch";
import formStyles from "../form.module.scss";
import styles from "./Switcher.module.scss";

type SwitcherProps = {
  label: string;
  value: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  onFocus: () => void;
  onBlur: () => void;
};
export default function Switcher({
  label,
  value,
  onChange,
  disabled,
  onFocus,
  onBlur,
}: SwitcherProps) {
  return (
    <div className={formStyles.form_item}>
      <label className={`${formStyles.form_label} ${styles.form_label}`}>
        <span className={styles.label_text}>{label}</span>
        <Switch
          disabled={disabled}
          className="ml-auto data-[state=checked]:bg-[var(--text-1)]"
          checked={value}
          size="sm"
          onCheckedChange={(checked) => {
            onChange(checked);
            onFocus?.();
            setTimeout(() => {
              onBlur?.();
            }, 1000);
          }}
        />
      </label>
    </div>
  );
}
