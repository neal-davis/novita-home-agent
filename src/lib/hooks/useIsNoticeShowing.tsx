import { useAppSelector } from "@/store";
import { DISABLE_NOTICE_URLS } from "@/store/slice/configSlice";
import { getPathnameWithoutLocale } from "@/i18n/config";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function useIsNoticeShowing(isConsole?: boolean) {
  const path = usePathname();
  const businessPath = getPathnameWithoutLocale(path);
  const noticeConfig = useAppSelector((state) => state.config.notice);

  const isNoticeShowing = useMemo(() => {
    if (!noticeConfig?.show) {
      return false;
    }

    if (isConsole && !noticeConfig.showInConsole) {
      return false;
    }

    for (const pathUrl of DISABLE_NOTICE_URLS) {
      if (businessPath.startsWith(pathUrl)) {
        return false;
      }
    }
    return true;
  }, [businessPath, isConsole, noticeConfig]);

  return isNoticeShowing;
}
