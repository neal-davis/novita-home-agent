"use client";

import Header from "@/app/components/header/Header";
import { useAppSelector } from "@/store";

export default function PlaygroundHeader() {
  const uuid = useAppSelector((state) => state.user.uuid);
  return <Header size="full" noMobile page="playground" position="relative" />;
}
