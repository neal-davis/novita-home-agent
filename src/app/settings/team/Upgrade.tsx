"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, ButtonArrow } from "@/components/ui/button";
import { CircleCheckBig, Loader2 } from "lucide-react";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { upgradeToTeamAccount } from "@/api/team";
import { message } from "@/components/ui/standard/notify";
import { useAppSelector } from "@/store";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
function createCopyTeamUpgradeBenefitsItems() {
  return [
    {
      title: "Role-Based Access",
      desc: "Assign permissions tailored to each member's responsibilities.",
    },
    {
      title: "Centralized Billing",
      desc: "Manage all expenses under one account with clear insights.",
    },
    {
      title: "Streamlined Collaboration",
      desc: "Share resources and work on projects together in real time.",
    },
    {
      title: "Resource Isolation",
      desc: "Ensure secure and precise resource allocation.",
    },
  ];
}
const getTermsNode = (ori: string) => {
  const [beforeTerms, rest] = ori.split("{{terms}}");
  const [betweenTermsAndPrivacy, afterPrivacy] = rest.split("{{privacy}}");
  return (
    <>
      {beforeTerms}
      <Link
        className="text-[var(--dark-3)] underline"
        href={NOVITA_URL.TERMS_OF_SERVICE}
        target="_blank"
        rel="noreferrer"
      >
        {"Terms of Service"}
      </Link>
      {betweenTermsAndPrivacy}
      <Link
        className="text-[var(--dark-3)] underline"
        href={NOVITA_URL.PRIVACY_POLICY}
        target="_blank"
        rel="noreferrer"
      >
        {"Privacy Policy"}
      </Link>
      {afterPrivacy}
    </>
  );
};
export default function Upgrade({ copy }: { copy?: unknown }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const username = useAppSelector((state) => state.user.username);
  useEffect(() => {
    setTeamName(`${username}${"'s Team"}`);
  }, [username]);
  return (
    <div className="console-card flex flex-col gap-5">
      <div className="flex sm:flex-row flex-col gap-5 border-b items-center pb-[30px]">
        <Image src="/team.png" alt="upgrade" width={152} height={130} />
        <div className="flex flex-col items-center sm:items-start">
          <p className="font-h6">
            {"Upgrade to a team account to collaborate with others"}
          </p>
          <p
            className="font-subtle mt-1 mb-5"
            style={{ color: "var(--dark-3)" }}
          >
            {
              "Invite other users to your team to share access to the account and resources using scoped roles."
            }
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setDialogOpen(true);
            }}
            id={CLICK_BTN_IDs.SETTINGS.TEAM_UPGRADE_TO_TEAM}
          >
            {"Upgrade To Team Account"}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div>
          <p className="font-h6">{"Team Accounts Benefits"}</p>
          <p className="font-subtle mt-1" style={{ color: "var(--dark-3)" }}>
            {
              "Simplify team workflows and enhance productivity with Team Accounts!"
            }
          </p>
        </div>
        <div className="sm:grid sm:grid-cols-2 flex flex-col gap-5">
          {createCopyTeamUpgradeBenefitsItems().map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 px-5 py-6 border rounded-md"
            >
              <CircleCheckBig size={24} className="text-black flex-shrink-0" />
              <div className="flex flex-col gap-[6px]">
                <p className="font-subtle-demibold">{item.title}</p>
                <p className="font-subtle">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <div>
            {
              "Real name authentication is not completed, cannot upgrade to team account"
            }
          </div>
          <div className="flex justify-end gap-5">
            <Button
              variant="outline"
              onClick={() => setVerifyDialogOpen(false)}
            >
              {"Cancel"}
            </Button>
            <Button asChild>
              <Link href={NOVITA_URL.SETTINGS_VERIFY}>
                {"Go to real name authentication"}
                <ButtonArrow />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="font-h6">{"Upgrade to Team Account"}</p>
          </DialogHeader>
          <div>
            <label htmlFor="teamName" className="font-small-console mb-1">
              {"Team Display name"}
            </label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          <p className="font-subtle">
            {
              "Upon upgrading to a team account, all personal assets will be transferred to the team. Authorized team members will be able to view and manage these assets."
            }
          </p>
          <p className="font-subtle" style={{ color: "var(--yellow-2)" }}>
            {
              "Please carefully consider team invitations as members might have access to your account and resources."
            }
          </p>
          <p
            className="font-small-console text-right mt-4"
            style={{ color: "var(--dark-3)" }}
          >
            {getTermsNode(
              "By confirming Upgrade, you agree to our {{terms}} and {{privacy}}.",
            )}
          </p>
          <div className="flex justify-end gap-5">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              id={CLICK_BTN_IDs.SETTINGS.TEAM_UPGRADE_TO_TEAM_CANCEL}
            >
              {"Cancel"}
            </Button>
            <Button
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                upgradeToTeamAccount(teamName)
                  .then(() => {
                    setDialogOpen(false);
                    setLoading(false);
                    if (typeof window !== "undefined") {
                      window.location.reload();
                    }
                  })
                  .catch(() => {
                    setLoading(false);
                    message.error("Upgrade failed");
                  });
              }}
              id={CLICK_BTN_IDs.SETTINGS.TEAM_UPGRADE_TO_TEAM_CONFIRM}
            >
              {"Upgrade"}
              {loading && <Loader2 size={16} className="ml-2 animate-spin" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
