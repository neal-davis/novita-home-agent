import { usePathname } from "next/navigation";
import { getPathnameWithoutLocale } from "@/i18n/config";

export const useIsInConsole = () => {
  const pathname = usePathname();

  if (!pathname) {
    return false;
  }

  const businessPathname = getPathnameWithoutLocale(pathname);

  return (
    businessPathname.startsWith("/gpu-instance/console") ||
    businessPathname.startsWith("/gpus-console") ||
    businessPathname.startsWith("/models-console") ||
    businessPathname.startsWith("/settings") ||
    businessPathname.startsWith("/billing") ||
    businessPathname.startsWith("/console") ||
    businessPathname.startsWith("/quota-limits") ||
    businessPathname.startsWith("/sandbox-console") ||
    businessPathname.startsWith("/models/llm")
  );
};
