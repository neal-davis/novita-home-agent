import styles from "./Capabilities.module.scss";

export default function Capabilities() {
  const items: any[] = [
    {
      title: "Code Execution",
      desc: "Run Python, JavaScript, C++, and other languages in a secure sandbox.",
    },
    {
      title: "Network Access",
      desc: "Allow agents to access external APIs and online data as needed.",
    },
    {
      title: "Browser Use",
      desc: "Automate web navigation, form filling, and content scraping.",
    },
    {
      title: "Computer Use",
      desc: "Control full GUI environments: input text, scroll pages, take screenshots, and more.",
    },
    {
      title: "Session Persistence",
      desc: "Pause and resume long-running agent tasks without losing progress.",
    },
    {
      title: "Visual Output",
      desc: "Enable agents to interact with GUI and stream task execution via VNC.",
    },
  ];
  return (
    <div className="bg-[var(--gray-3)] py-[24px]">
      <div>
        <div
          className={`flex flex-col items-center justify-center gap-[24px] ${styles.outContainer}`}
        >
          <div className={`${styles.title} text-[var(--dark-1)] text-center`}>
            Sandbox Capabilities
          </div>
          <div className={styles.container}>
            {items.map((item, index) => (
              <div
                key={index}
                className={`bg-[var(--white)] px-4 py-6 flex flex-col items-center justify-center gap-[10px] ${styles.item}`}
              >
                <img
                  src={`/sandbox/page/${index}.svg`}
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
