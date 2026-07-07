import { createContext } from "react";
import { CardInterface } from "@/app/billing/lib/hooks/paymentMethods";

export const CardInfoContext = createContext<{
  cardsInfo: CardInterface[] | null;
}>({
  cardsInfo: null,
});
