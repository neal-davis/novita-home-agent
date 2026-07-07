import Header from "@/app/components/header/Header";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import Success from "./success";
import ReadyStart from "@/app/components/pageComponents/ReadyStart";
import Footer from "@/app/components/footer/Footer";

export default function Page() {
  return (
    <main className="relative max-w-full overflow-hidden">
      <Header />
      <Success />
      <ReadyStart />
      <FooterBanner />
      <Footer />
    </main>
  );
}
