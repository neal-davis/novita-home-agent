import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import PermissionTable from "../settings/components/PermissionTable";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";

export const metadata = {};

export default async function Page() {
  return (
    <main className="relative max-w-full overflow-hidden">
      <Header />
      <div className="flex !mt-[180px] !mb-[180px] max_width_container">
        <div className="flex-col justify-center items-center px-web">
          <h1 className="font-h2 mb-12 text-center">
            {"Team Permission Details"}
          </h1>
          <PermissionTable />
        </div>
      </div>
      <FooterBanner />
      <Footer />
    </main>
  );
}
