import { Metadata } from "next";
import EnterpriseTable from "./components/EnterpriseTable";
import { NOVITA_URL } from "@/constants/urls";

export const metadata: Metadata = {
  title: "Image Dedicated Endpoints | Novita AI",
};

export default function Page() {
  return <EnterpriseTable />;
}
