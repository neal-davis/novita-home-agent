import { Metadata } from "next";
import ServerlessDeploy from "./components/section";

export const metadata: Metadata = {
  title: "Novita AI Serverless Deploy",
};

export default function Page() {
  return <ServerlessDeploy />;
}
