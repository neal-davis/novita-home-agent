import styles from "./GPUSpotFeature.module.scss";
export default function GPUSpotFeature() {
  return (
    <div>
      <div className="max_width_container py-[80px]">
        <div className="font-h3 text-[var(--dark-1)] text-center mb-[8px]">
          Ideal Use Cases
        </div>
        <div className="font-body text-[var(--dark-2)] text-center mb-[48px]">
          Best practices for maximizing Spot
        </div>
        <div className={styles.container}>
          <div className={styles.item}>
            <img src="/gpus-spot/scence01.png" alt="scence01" />
            <div className="p-6">
              <div className="font-h5 mb-4 text-[var(--dark-1)]">
                Deep Learning
              </div>
              <div className="font-subtle mb-4 text-[var(--dark-1)]">
                Short-term training, prototyping, or small-scale inference
              </div>
              <div className="flex gap-2 items-center">
                <span className="px-2 py-[2px] h-[24px] rounded-[4px] bg-[var(--brand-2)] text-[var(--dark-1)] font-small-console">
                  Training
                </span>
                <span className="px-2 py-[2px] h-[24px] rounded-[4px] bg-[var(--brand-2)] text-[var(--dark-1)] font-small-console">
                  Validation
                </span>
                <span className="px-2 py-[2px] h-[24px] rounded-[4px] bg-[var(--brand-2)] text-[var(--dark-1)] font-small-console">
                  Small-scale inference
                </span>
              </div>
            </div>
          </div>
          <div className={styles.item}>
            <img src="/gpus-spot/scence02.png" alt="scence02" />
            <div className="px-8 py-6">
              <div className="font-h5 mb-4 text-[var(--dark-1)]">
                Batch Processing
              </div>
              <div className="font-subtle mb-4 text-[var(--dark-1)]">
                Cost-effective for overnight, weekend, or large-scale data jobs
              </div>
              <div className="flex gap-2 items-center">
                <span className="px-2 py-[2px] h-[24px] rounded-[4px] bg-[var(--brand-2)] text-[var(--dark-1)] font-small-console">
                  Data processing
                </span>
                <span className="px-2 py-[2px] h-[24px] rounded-[4px] bg-[var(--brand-2)] text-[var(--dark-1)] font-small-console">
                  Large-scale compute
                </span>
              </div>
            </div>
          </div>
          <div className={styles.item}>
            <img src="/gpus-spot/scence03.png" alt="scence03" />
            <div className="px-8 py-6">
              <div className="font-h5 mb-4 text-[var(--dark-1)]">
                Education & Demos
              </div>
              <div className="font-subtle mb-4 text-[var(--dark-1)]">
                Classroom labs, technical workshops, and proof-of-concepts
              </div>
              <div className="flex gap-2 items-center">
                <span className="px-2 py-[2px] h-[24px] rounded-[4px] bg-[var(--brand-2)] text-[var(--dark-1)] font-small-console">
                  Labs
                </span>
                <span className="px-2 py-[2px] h-[24px] rounded-[4px] bg-[var(--brand-2)] text-[var(--dark-1)] font-small-console">
                  Workshops
                </span>
                <span className="px-2 py-[2px] h-[24px] rounded-[4px] bg-[var(--brand-2)] text-[var(--dark-1)] font-small-console">
                  Proof-of-concepts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
