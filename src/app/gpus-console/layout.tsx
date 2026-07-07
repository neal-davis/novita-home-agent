import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";
import GlobalNotice from "./components/globalNotice";
import CtxWrapper from "./components/ContextWrapper";
import ConsoleRouteShell from "./components/ConsoleRouteShell/ConsoleRouteShell";
import styles from "./page.module.css";

export default async function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleHeaderWrapper product="gpus">
      <main className="flex h-full flex-col">
        <CtxWrapper>
          <main className={`${styles.main} ${styles.pc}`}>
            <article
              className="flex items-start justify-center"
              style={{ height: "100%" }}
            >
              <ConsoleRouteShell>{children}</ConsoleRouteShell>
            </article>
          </main>
        </CtxWrapper>
        <GlobalNotice />
      </main>
    </ConsoleHeaderWrapper>
  );
}
