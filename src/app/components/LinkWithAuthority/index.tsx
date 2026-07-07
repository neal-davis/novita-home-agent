"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_REQUIRED_URL } from "@/constants/urls";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import Cookies from "js-cookie";

export default function LinkWithAuthority({
  className,
  target,
  href,
  children,
  id,
  loginRequired,
}: {
  className?: string;
  target?: "_self" | "_blank" | "_parent" | "_top" | string;
  href: string;
  children: React.ReactNode;
  id?: string;
  loginRequired?: boolean;
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const localizedHref = getLocalizedPath(href, locale);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        (loginRequired || LOGIN_REQUIRED_URL.includes(href)) &&
        !Cookies.get("token")
      ) {
        event.preventDefault();
        if (target === "_blank") {
          window.open(
            getLocalizedPath(
              `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(localizedHref)}`,
              locale,
            ),
            "_blank",
          );
        } else {
          router.push(
            getLocalizedPath(
              `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(localizedHref)}`,
              locale,
            ),
          );
        }
      }
    },
    [href, localizedHref, locale, router, loginRequired, target],
  );

  return (
    <a
      className={className}
      target={target}
      href={localizedHref}
      onClick={handleClick}
      id={id}
    >
      {children}
    </a>
  );
}
