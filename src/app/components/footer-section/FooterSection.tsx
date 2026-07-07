import Banner, { type FooterBannerProps } from "./Banner";
import Footer from "./Footer";
import FooterOverscrollBackground from "./FooterOverscrollBackground";

export default function FooterSection({ getStartedHref }: FooterBannerProps) {
  return (
    <>
      <FooterOverscrollBackground />
      <Banner getStartedHref={getStartedHref} />
      <Footer />
    </>
  );
}
