import { cookies } from "next/headers";
import Header from "@/app/components/header/Header";
import styles from "./page.module.scss";
import Footer from "@/app/components/footer/Footer";
import Main from "./components/Main";
import ActivityEndedModal from "./components/ActivityEndedModal";
import { Metadata } from "next";

const META = {
  title: "Give $10, Earn $10 In LLM API credits",
  description:
    "Refer a friend to Novita and both earn $10 in LLM API credits—up to $500 total.",
  images: [
    {
      url: "https://novita.ai/affiliate/referral.png",
      alt: "Invitation Reward",
    },
  ],
  siteName: "Novita AI",
};

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
  openGraph: {
    title: META.title,
    description: META.description,
    siteName: META.siteName,
    images: META.images,
  },
  twitter: {
    title: META.title,
    description: META.description,
    site: META.siteName,
    images: META.images,
  },
};

export default function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value || "";

  return (
    <div className={styles.container}>
      <Header page={token ? "console" : undefined} />
      <Main />
      <Footer />
      <ActivityEndedModal show={true} />
    </div>
  );
}
