import WebsiteNavbar from "@/app/components/website-navbar/WebsiteNavbar";
import FooterSection from "@/app/components/footer-section/FooterSection";
import ErrorPage from "@/app/components/error/ErrPage";

export default function NotFoundPage() {
  return (
    <main className="relative max-w-full overflow-hidden">
      <WebsiteNavbar />
      <ErrorPage page="404" />
      <FooterSection />
    </main>
  );
}
