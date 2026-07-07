import styles from "./Features.module.scss";

export default function Features() {
  const items: any[] = [
    {
      title: "Pay-As-You-Go Pricing",
      desc: "Only pay for what you use, with no subscription fees for flexible, cost-efficient access.",
    },
    {
      title: "Fast Scalability",
      desc: "Launch 0 to 1,000+ sandboxes in under 200 ms, enabling rapid AI agent deployment.",
    },
    {
      title: "Session Persistence",
      desc: "Maintain Memory & file system persistence for quick recovery, execution continuity, efficient resources use, and complex tasks.",
    },
  ];
  return (
    <div className="bg-[var(--gray-3)] py-[24px]">
      <div>
        <div
          className={`flex flex-col items-center justify-center gap-[24px] ${styles.outContainer}`}
        >
          <div className={`${styles.title} text-[var(--dark-1)] text-center`}>
            Key Features
          </div>
          <div className={styles.container}>
            {items.map((item, index) => (
              <div
                key={index}
                className={`bg-[var(--white)] px-4 py-6 flex flex-col items-center justify-center gap-[10px] ${styles.item}`}
              >
                <img
                  src={`/sandbox/build-month/feature-${index}.svg`}
                  className="w-[32px] h-[32px]"
                  alt={item.title}
                />
                <div className="font-menu text-[var(--dark-1)] text-center">
                  {item.title}
                </div>
                <p className="font-subtle text-[var(--dark-2)] text-center mb-[auto]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
