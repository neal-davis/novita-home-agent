import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import Loading from "@/app/components/Loading/Loading";
import styles from "./common.module.scss";
import { Suspense } from "react";
import Nav from "./components/nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novita AI policy",
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative max-w-full overflow-x-clip bg-[var(--surface)]">
      <WebsiteNavbar />
      <section className={`${styles.layout} max_width_container`}>
        <Nav />
        <div className={styles.content}>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
      </section>
      <FooterSection />
    </main>
  );
}
