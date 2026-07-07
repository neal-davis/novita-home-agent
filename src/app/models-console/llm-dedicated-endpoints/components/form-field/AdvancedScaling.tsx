import { Info } from "lucide-react";
import commonStyles from "../../sub-pages/CreateEndpoint/CreateEndpoint.module.scss";
import styles from "./AdvancedScaling.module.scss";
import { Input } from "@/components/ui/input";
import FormErrorText from "@/components/ui/standard/form-error-text";

export interface AdvancedScalingConfigValue {
  scaleDownWindow: number;
  stableWindow: number;
}

interface AdvancedScalingConfigProps {
  value?: AdvancedScalingConfigValue;
  onChange?: (value: AdvancedScalingConfigValue) => void;
  error?: string;
}

export default function AdvancedScalingConfig({
  value = {
    scaleDownWindow: 300,
    stableWindow: 300,
  },
  onChange,
  error,
}: AdvancedScalingConfigProps) {
  const handleChange = (updates: Partial<AdvancedScalingConfigValue>) => {
    const newValue = { ...value, ...updates };
    onChange?.(newValue);
  };

  return (
    <div className={`${commonStyles.form_card} mt-2`}>
      <h3 className={commonStyles.subtitle}>
        <span>Advanced scaling options</span>
        <span className={styles.optional}>(optional)</span>
      </h3>

      <div className={styles.config_wrapper}>
        <div className="flex-1">
          <div className={`flex items-center gap-2 ${styles.title}`}>
            <span>Scale Down Window</span>
            <Info className="w-3 h-3" color="var(--dark-2)" />
          </div>
          <p className={styles.desc}>
            Time in seconds before scaling down replicas.
          </p>
          <div className="relative inline-block mt-2">
            <Input
              value={value.scaleDownWindow.toString()}
              onChange={(e) =>
                handleChange({ scaleDownWindow: parseInt(e.target.value) || 0 })
              }
              className="w-[360px] h-[32px] pr-[70px]"
            />
            <span
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm pointer-events-none select-none ${styles.desc}`}
            >
              Seconds
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className={`flex items-center gap-2 ${styles.title}`}>
            <span>Stable Window</span>
            <Info className="w-3 h-3" color="var(--dark-2)" />
          </div>
          <p className={styles.desc}>
            Time in seconds before scaling up replicas.
          </p>
          <div className="relative inline-block mt-2">
            <Input
              value={value.stableWindow.toString()}
              onChange={(e) =>
                handleChange({ stableWindow: parseInt(e.target.value) || 0 })
              }
              className="w-[360px] h-[32px] pr-[70px]"
            />
            <span
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm pointer-events-none select-none ${styles.desc}`}
            >
              Seconds
            </span>
          </div>
        </div>
      </div>
      <FormErrorText error={error} />
    </div>
  );
}
