import Container from "./components/container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novita AI GPU instances",
};

export default async function Page() {
  return <Container />;
}
