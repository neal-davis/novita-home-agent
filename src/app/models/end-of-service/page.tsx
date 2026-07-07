import Footer from "@/app/components/footer/Footer";
import Header from "@/app/components/header/Header";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import EndOfService from "@/app/components/error/EndOfService";

export const metadata = {};

export default function EndOfServicePage() {
  return (
    <main className="relative max-w-full overflow-hidden">
      <Header />
      <EndOfService />
      <FooterBanner />
      <Footer />
    </main>
  );
}
