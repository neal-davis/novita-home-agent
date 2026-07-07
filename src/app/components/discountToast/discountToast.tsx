import { notify } from "@/components/ui/standard/notify";
import { useAppSelector } from "@/store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import styles from "./style.module.scss";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function DiscountToast() {
  const { discount } = useAppSelector((state) => state.config);
  const pathname = usePathname();
  const { locale } = useI18n();

  useEffect(() => {
    if (discount?.valid && pathname.includes("console")) {
      const showFlag = sessionStorage.getItem("pricing_discount_black_friday");
      if (showFlag) {
        return;
      }
      sessionStorage.setItem("pricing_discount_black_friday", "true");
      notify.info("Black Friday", {
        description: (
          <div>
            <a
              href={getLocalizedPath(NOVITA_URL.BILLING_OVERVIEW, locale)}
              className={styles.view}
            >
              Enjoy a 10% discount on every top-up.
            </a>
          </div>
        ),
        duration: 15_000,
        className: styles.discountToast,
      });
    }
  }, [discount, locale, pathname]);

  return <></>;
}
