import { useCallback, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { NOVITA_URL } from "@/constants/urls";
import { joinTeamByInvite } from "@/api/team";
import { Button } from "@/components/ui/button";
import styles from "../page.module.scss";
const settingsTeamRoles = {
  all: "All",
  owner: "Owner",
  admin: "Admin",
  developer: "Developer",
  basic: "Basic",
  billing: "Billing",
};
interface CurrentAccountProps {
  email: string;
  teamName: string;
  role: string;
  inviteToken: string;
}
export default function CurrentAccount({
  email,
  teamName,
  role,
  inviteToken,
}: CurrentAccountProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleJoin = useCallback(async () => {
    try {
      setLoading(true);
      const { token } = await joinTeamByInvite(inviteToken);
      const cookieOptions: any = { expires: 7 };
      if (window.location.hostname.includes("novita.ai")) {
        cookieOptions.domain = ".novita.ai";
      }
      Cookies.set("token", token, cookieOptions);
      Cookies.remove("invite_token");
      router.push(NOVITA_URL.TEAM_MANAGE);
    } catch {
      setLoading(false);
    }
  }, [inviteToken, router]);
  return (
    <>
      <div className={styles.tips_large}>
        <span className={styles.confirm_message_large}>{"Hi,"}</span>{" "}
        <span className={styles.confirm_message_large}>{`${email}`}</span>
        <span>{", You have been invited to join a team!"}</span>
      </div>
      <div className={styles.tips_large}>
        <span>{"Team Name:"}</span>{" "}
        <span className={styles.confirm_message_large}>{teamName}</span>
      </div>
      <div className={styles.tips_large}>
        <span>{"Role:"}</span>{" "}
        <span className={styles.confirm_message_large}>
          {settingsTeamRoles[role as keyof typeof settingsTeamRoles] || " "}
        </span>
      </div>
      <div className={styles.button_wrap}>
        <Button
          style={{ width: 120 }}
          variant="secondary"
          onClick={handleJoin}
          disabled={loading}
        >
          {"Join Team"}
          {loading && <Loader2 className="animate-spin ml-2" />}
        </Button>
      </div>
    </>
  );
}
