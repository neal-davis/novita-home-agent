import React from "react";
import styles from "./StepDecorator.module.scss";

interface StepDecoratorProps {
  completed: boolean;
  active: boolean;
  step: number;
}

const StepDecorator: React.FC<StepDecoratorProps> = ({
  completed,
  active,
  step,
}) => {
  return (
    <span
      className={`${styles.step_decorator} ${
        active ? styles.step_decorator_active : ""
      } ${completed ? styles.step_decorator_completed : ""}`}
    >
      <span className={`iconfont icon-solid-arrow ${styles.arrow}`}></span>
      <span className={styles.step}>{step}</span>
    </span>
  );
};

export default StepDecorator;
