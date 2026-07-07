import { getBannerConfigInServerEnv } from "@/api/config";
import WhatsNewClient from "./WhatsNewClient";

export default async function WhatsNew() {
  const cards = await getBannerConfigInServerEnv();
  return <WhatsNewClient cards={cards} />;
}
