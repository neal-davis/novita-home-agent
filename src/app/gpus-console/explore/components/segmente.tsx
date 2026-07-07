import styles from "./segmente.module.scss";

interface SegmenteProps {
  options: Array<string>;
  onChange?: any;
  value?: any;
}

const Segmente = ({ options = [], onChange, value }: SegmenteProps) => {
  return (
    <div
      className={styles.segmentWrap}
      style={{
        minWidth: options.length * 40 + "px",
      }}
    >
      {options.map((op) => (
        <div
          className={`${styles.segment} ${
            value === op ? styles.selectSegment : ""
          }`}
          key={op}
          onClick={() => onChange(op)}
        >
          {op}
        </div>
      ))}
    </div>
  );
};

export default Segmente;
