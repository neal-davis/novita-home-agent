import { Metadata } from "next";
import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";

export const metadata: Metadata = {
  title: "Novita AI console",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleHeaderWrapper product="models">{children}</ConsoleHeaderWrapper>
  );
}
