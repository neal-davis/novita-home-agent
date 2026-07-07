import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStripeCustomerPortal } from "@/api/buy";
import { NOVITA_URL } from "@/constants/urls";

export default function StripeInfoManage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(() => {
    setIsLoading(true);
    updateStripeCustomerPortal({
      redirect_url: NOVITA_URL.BILLING_TRANSACTIONS,
    })
      .then((res) => {
        const { url } = res;
        window.open(url, "_blank");
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Button
      size="sl"
      variant="secondary"
      className="w-[160px]"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
      Update billing info
    </Button>
  );
}
