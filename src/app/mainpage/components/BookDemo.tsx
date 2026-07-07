"use client";

import { reportInternalEvent } from "@/api/config";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { Button } from "@/components/ui/button";
import { BREVO_BOOK_LINK } from "@/constants/urls";
import { useAppSelector } from "@/store";
import Link from "next/link";

export function BookDemo({
  asChild,
  outClassName = "",
  className,
  variant = "outline",
  elmID = "",
}: {
  asChild?: boolean;
  outClassName?: string;
  className?: string;
  variant?: "outline" | "link" | "text";
  elmID?: string;
}) {
  const userInfo = useAppSelector((state) => state.user);
  return (
    <Button
      size="lg"
      variant={variant}
      className={`ml-5 ${outClassName}`}
      id={elmID || CLICK_BTN_IDs.INDEX_BTNS.BOOK_A_DEMO}
      onClick={async () => {
        if (userInfo.uid && userInfo.uuid) {
          await reportInternalEvent({
            uid: String(userInfo.uid),
            action: "BOOK_DEMO",
          });
        }
      }}
      asChild={asChild}
    >
      <Link href={BREVO_BOOK_LINK} target="_blank" className={className}>
        Book a Demo
      </Link>
    </Button>
  );
}
