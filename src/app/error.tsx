"use client";

import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import ErrorPage from "@/app/components/error/ErrPage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative max-w-full overflow-hidden">
      <WebsiteNavbar />
      <ErrorPage page="error" error={error} reset={reset} />
      <FooterSection />
    </main>
  );
}
