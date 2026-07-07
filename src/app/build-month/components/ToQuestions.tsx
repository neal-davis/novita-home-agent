"use client";

export function ToQuestions() {
  return (
    <span
      onClick={() => {
        const questionsSection = document.querySelector(
          ".black-friday-questions-section",
        );
        if (questionsSection) {
          questionsSection.scrollIntoView({ behavior: "smooth" });
        }
      }}
      className="font-subtle-button cursor-pointer text-[var(--black)]"
    >
      {"See event terms →"}
    </span>
  );
}
