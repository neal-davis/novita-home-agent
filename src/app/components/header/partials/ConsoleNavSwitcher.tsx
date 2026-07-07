"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import { NOVITA_URL } from "@/constants/urls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

const createConsoleRoutes = () => [
  {
    title: "Model APIs",
    key: "model-api",
    link: NOVITA_URL.MODEL_API_CONSOLE,
  },
  {
    title: "Agent Sandbox",
    key: "agent-sandbox",
    link: NOVITA_URL.SANDBOX_CONSOLE,
  },
  {
    title: "GPUs",
    key: "gpu-instance",
    link: NOVITA_URL.GPU_CONSOLE_APPLICATION,
  },
];

export default function ConsoleNavSwitcher({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const [curRoute, setCurRoute] = useState("model-api");
  const { locale } = useI18n();
  const allConsoleRoutes = useMemo(() => {
    void locale;

    return createConsoleRoutes();
  }, [locale]);

  const pathname = usePathname();
  const businessPathname = getPathnameWithoutLocale(pathname);

  useEffect(() => {
    let matchedKey = "";
    if (businessPathname.startsWith(NOVITA_URL.MODEL_API_CONSOLE)) {
      matchedKey = "model-api";
    } else if (businessPathname.startsWith(NOVITA_URL.GPU_CONSOLE_EXPLORE)) {
      matchedKey = "gpu-instance";
    } else if (businessPathname.startsWith(NOVITA_URL.SANDBOX_CONSOLE)) {
      matchedKey = "agent-sandbox";
    }
    setCurRoute(matchedKey);
  }, [businessPathname]);

  if (
    !businessPathname.match(NOVITA_URL.MODEL_API_CONSOLE) &&
    !businessPathname.match("/gpus-console") &&
    !businessPathname.match(NOVITA_URL.SANDBOX_CONSOLE)
  ) {
    return <></>;
  }

  return (
    <Select
      value={curRoute}
      onValueChange={(value) => {
        setCurRoute(value);
        const route = allConsoleRoutes.find((r: any) => r.key === value);
        if (route) {
          router.push(getLocalizedPath(route.link, locale));
        }
      }}
    >
      <SelectTrigger
        className={cn("h-[32px]", className)}
        icon={
          <ChevronsUpDown className="absolute right-3 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 opacity-50" />
        }
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent style={{ zIndex: 999 }}>
        {allConsoleRoutes.map((r) => {
          return (
            <SelectItem key={r.key} value={r.key}>
              {r.title}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
