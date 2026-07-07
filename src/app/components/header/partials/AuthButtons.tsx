"use client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { CLICK_BTN_IDs } from "../../analytics/constants";
const { HEADER_LINK_IDs } = CLICK_BTN_IDs;
interface AuthButtonsProps {
  onLogin: (redirect: string) => void;
  onGetStarted: (redirect: string) => void;
}
/**
 * "Login" and "Get Started" buttons for unauthenticated users
 */
export const AuthButtons = ({ onLogin, onGetStarted }: AuthButtonsProps) => {
  const path = usePathname();
  const getRedirectPath = () => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    return hash ? `${path}${hash}` : path;
  };
  return (
    <>
      <Button
        variant={"outline"}
        id={HEADER_LINK_IDs.LOGIN}
        size="sl"
        onClick={() => {
          const redirect = getRedirectPath();
          onLogin(redirect);
        }}
      >
        {"Log In"}
      </Button>
      <Button
        id={HEADER_LINK_IDs.GET_STARTED}
        size="sl"
        onClick={() => {
          const redirect = getRedirectPath();
          onGetStarted(redirect);
        }}
      >
        {"Get Started"}
      </Button>
    </>
  );
};
