"use client";

import Header from "@/app/components/header/Header";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
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
      <Header />
      <ErrorPage page="error" error={error} reset={reset} />
      <FooterBanner />
      {/* <Footer /> */}
    </main>
  );
}
