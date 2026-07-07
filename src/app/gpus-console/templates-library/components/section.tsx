"use client";

import { useSearchParams } from "next/navigation";
import List from "./list";
import TemplateDetail from "./templateDetail";

export default function Section() {
  const searchParams = useSearchParams();
  const templateId = (searchParams.get("templateId") ?? "").trim();

  if (!templateId) {
    return <List />;
  } else {
    return <TemplateDetail templateId={templateId} />;
  }
}
