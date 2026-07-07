import { useEffect, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TeamMemberStatus, TeamRole } from "@/store/slice/userSlice";
import { inviteTeamMember } from "@/api/team";
import { Loader2, X, Copy, Info } from "lucide-react";
import { validateEmail } from "@/lib/utils/validators";
import { genRoleCards } from "./index";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import CopyToClipboard from "react-copy-to-clipboard";
import Permissions from "./Permissions";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { useAppSelector } from "@/store";
import analytics from "@/app/components/analytics/analytics";
import {
  formatBudgetLimit,
  getRoleColor,
  getRoleLabel,
  getStatusLabel,
} from "./MemberList";
function createCopyTeamInviteFormLimit() {
  return "One team can have up to {{max_team_member}} members";
}
type IProps = {
  copy?: unknown;
  onClose: () => void;
  onSuccess: () => void;
  allMembers: any[];
};
const emailDomains = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.jp",
  "aol.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "live.com",
  "msn.com",
  "ymail.com",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "fastmail.com",
];
const MAX_COUNT = 6;

function EmailTagsInput({
  emails,
  inputValue,
  options,
  error,
  maxCount,
  onEmailsChange,
  onInputChange,
}: {
  emails: string[];
  inputValue: string;
  options: { value: string; label: string }[];
  error: string;
  maxCount: number;
  onEmailsChange: (emails: string[]) => void;
  onInputChange: (value: string) => void;
}) {
  const addEmails = (rawValue: string) => {
    const nextEmails = rawValue
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    if (nextEmails.length === 0) return;
    onEmailsChange(
      Array.from(new Set([...emails, ...nextEmails])).slice(0, maxCount),
    );
    onInputChange("");
  };

  return (
    <div className="relative">
      <div
        className={`flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 ${
          error ? "border-[var(--red-1)]" : "border-[var(--gray-2)]"
        }`}
      >
        {emails.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1 rounded bg-[var(--gray-2)] px-2 py-1 text-sm text-[var(--dark-1)]"
          >
            {email}
            <button
              type="button"
              onClick={() =>
                onEmailsChange(emails.filter((item) => item !== email))
              }
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <Input
          className="h-6 min-w-[220px] flex-1 border-0 p-0 focus:border-0"
          value={inputValue}
          placeholder={
            emails.length === 0 ? "Separate multiple emails with commas" : ""
          }
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addEmails(inputValue);
            }
          }}
          onBlur={() => addEmails(inputValue)}
        />
        <span className="font-small-console whitespace-nowrap opacity-50">
          {emails.length} / {maxCount}
        </span>
      </div>
      {options.length > 0 && inputValue ? (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white shadow-md">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--gray-2)]"
              onMouseDown={(event) => {
                event.preventDefault();
                addEmails(option.value);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      {error ? (
        <div className="mt-1 text-sm text-[var(--red-1)]">{error}</div>
      ) : null}
    </div>
  );
}

export default function Invite({
  copy,
  onClose,
  onSuccess,
  allMembers,
}: IProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailOptions, setEmailOptions] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [role, setRole] = useState<TeamRole>(TeamRole.basic);
  const [inviting, setInviting] = useState(false);
  const [step, setStep] = useState(0);
  const [inviteLinks, setInviteLinks] = useState<
    {
      account: string;
      link: string;
    }[]
  >([]);
  const [openPermissions, setOpenPermissions] = useState(false);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const roleCards = genRoleCards(copy);
  const clear = () => {
    setEmails([]);
    setEmailOptions([]);
    setEmailInput("");
    setEmailError("");
    setRole(TeamRole.basic);
    setInviteLinks([]);
    setTimeout(() => {
      setStep(0);
    }, 200);
  };
  const [pendingMembers, setPendingMembers] = useState<any[]>(
    allMembers.filter((m) => m.status === TeamMemberStatus.invitePending),
  );
  useEffect(() => {
    setPendingMembers(
      allMembers.filter((m) => m.status === TeamMemberStatus.invitePending),
    );
  }, [allMembers]);
  return (
    <div className="relative flex flex-col gap-6 w-auto h-full bg-white px-6 py-[40px]">
      <Button
        className="absolute top-[40px] right-5"
        size="icon"
        variant="text"
        onClick={() => {
          clear();
          onClose();
        }}
      >
        <X size={20} />
      </Button>
      <h5 className="font-h4">{"Invite Members"}</h5>
      <div className="flex flex-col gap-6 overflow-y-auto h-[calc(100%-40px)]">
        {step === 0 && (
          <>
            <div className="flex flex-col gap-2">
              <p className="font-h6">{"Invite members to your team"}</p>
              <p className="font-subtle" style={{ color: "var(--dark-2)" }}>
                {createCopyTeamInviteFormLimit().replace(
                  "{{max_team_member}}",
                  currentTeam?.maxMemberCount.toString() ?? "0",
                )}
              </p>
              <EmailTagsInput
                emails={emails}
                inputValue={emailInput}
                options={emailOptions}
                error={emailError}
                maxCount={MAX_COUNT}
                onEmailsChange={(value) => {
                  setEmails(value);
                  setEmailOptions([]);
                  setEmailError("");
                }}
                onInputChange={(value) => {
                  setEmailInput(value);
                  if (value.length === 0) {
                    setEmailOptions([]);
                    return;
                  }
                  let domains = emailDomains;
                  if (value.includes("@")) {
                    domains = domains.filter((domain) =>
                      domain.includes(value.split("@")[1]),
                    );
                  }
                  setEmailOptions(
                    domains.map((domain) => ({
                      value: `${value.split("@")[0]}@${domain}`,
                      label: `${value.split("@")[0]}@${domain}`,
                    })),
                  );
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-h6">{"Select a Role"}</p>
              <p className="font-subtle" style={{ color: "var(--dark-2)" }}>
                {
                  'Assign access permissions to members by selecting roles. The budget for each new member is unlimited by default. If you need to adjust it, please go to the "Budgets" page.'
                }
                &nbsp;
                <Button
                  variant="text"
                  size="link"
                  onClick={() => setOpenPermissions(true)}
                >
                  {"View permission details"}
                </Button>
              </p>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as TeamRole)}
              >
                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  {roleCards.map((role) => (
                    <div
                      className="flex flex-col items-start gap-2 p-4 cursor-pointer border rounded-lg"
                      onClick={() => setRole(role.value)}
                      key={role.value}
                    >
                      <p className="font-subtle-medium text-[var(--dark-1)] flex items-center gap-2">
                        <RadioGroupItem value={role.value} />
                        <span>{role.title}</span>
                      </p>
                      <p className="font-small-console text-[var(--dark-2)]">
                        {role.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                }}
                id={CLICK_BTN_IDs.SETTINGS.TEAM_INVITE_MEMBERS_CANCEL}
              >
                {"Cancel"}
              </Button>
              <Button
                variant="default"
                disabled={inviting}
                onClick={() => {
                  if (!emails || emails.length === 0) {
                    setEmailError("Please input the emails");
                    return;
                  }
                  if (emails.some((email) => !validateEmail(email))) {
                    setEmailError("Some of the emails are invalid");
                    return;
                  }
                  setInviting(true);
                  inviteTeamMember(emails, role)
                    .then((res) => {
                      setInviting(false);
                      message.success("Invitation emails sent successfully!");
                      setInviteLinks(
                        res.urls?.map((link: any) => ({
                          account: link.email,
                          link: link.invite_url,
                        })),
                      );
                      // setStep(1);
                      onSuccess();
                    })
                    .catch((error) => {
                      console.error(error);
                      setInviting(false);
                      message.error("Invitation failed");
                    });
                }}
                id={CLICK_BTN_IDs.SETTINGS.TEAM_INVITE_MEMBERS_SUBMIT}
              >
                <span className="flex flex-row items-center gap-2 font-subtle">
                  {"+ Invite Members"}
                  {inviting && (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  )}
                </span>
              </Button>
            </div>
            {pendingMembers.length > 0 && (
              <>
                <div className="h-[1px] w-full border-b border-[var(--gray-2)]"></div>
                <div className="flex flex-col gap-3">
                  <p className="font-subtle text-[var(--dark-2)]">
                    {
                      "Invitation emails have been sent! You can also share these invite links below with your team members directly. And the links will remain accessible in the members list for future reference."
                    }
                  </p>

                  <Table className="h-full" style={{ minWidth: "550px" }}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[170px] min-w-[170px]">
                          {"Account"}
                        </TableHead>
                        <TableHead className="w-[70px] min-w-[70px]">
                          {"Role"}
                        </TableHead>
                        <TableHead className="w-[70px] min-w-[70px]">
                          {"Status"}
                        </TableHead>
                        <TableHead className="w-[70px] min-w-[70px]">
                          <div className="flex flex-row items-center gap-[2px]">
                            <span>Budget</span>
                            <Tooltip
                              title={
                                'Change the budget on the "Budgets" page after invitees join your team.'
                              }
                            >
                              <Info
                                size={12}
                                className="text-[var(--black)] cursor-pointer"
                              />
                            </Tooltip>
                          </div>
                        </TableHead>
                        <TableHead className="w-[100px] min-w-[100px]">
                          {"Invite Link"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingMembers.map((m) => (
                        <TableRow key={m.email}>
                          <TableCell className="flex flex-col justify-center w-[170px] min-w-[170px]">
                            <div className="truncate">
                              <span className="font-subtle-demibold text-[var(--black)]">
                                {m.email || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            className={`truncate w-[70px] min-w-[70px] ${getRoleColor(m.role)}`}
                          >
                            {getRoleLabel(m.role, copy)}
                          </TableCell>
                          <TableCell className="truncate w-[70px] min-w-[70px]">
                            {getStatusLabel(m.status, copy)}
                          </TableCell>
                          <TableCell className="truncate w-[70px] min-w-[70px]">
                            {m.budgetType === "Unlimited"
                              ? "Unlimited"
                              : m.budgetType === "One-time"
                                ? `${formatBudgetLimit(m.budgetLimit)} (One-time)`
                                : formatBudgetLimit(m.budgetLimit || 0)}
                          </TableCell>
                          <TableCell className="truncate w-[70px] min-w-[70px]">
                            <CopyToClipboard
                              text={m.inviteLink}
                              onCopy={() => {
                                message.success("Invite link copied");
                              }}
                            >
                              <Copy size={16} className="cursor-pointer" />
                            </CopyToClipboard>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </>
        )}
        {step === 1 && (
          <div>
            <p className="font-subtle-medium">
              {
                "Invitation emails have been sent! You can also share these invite links below with your team members directly. And the links will remain accessible in the members list for future reference."
              }
            </p>
            <Table className="mt-5">
              <TableHeader>
                <TableRow>
                  <TableHead>{"Account"}</TableHead>
                  <TableHead>{"Invite Link"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inviteLinks.map((link) => (
                  <TableRow key={link.account}>
                    <TableCell>{link.account}</TableCell>
                    <TableCell>
                      <CopyToClipboard
                        text={link.link}
                        onCopy={() => {
                          message.success("Invite link copied");
                          analytics.trackClick(
                            CLICK_BTN_IDs.SETTINGS
                              .TEAM_INVITE_MEMBERS_COPY_LINK,
                          );
                        }}
                      >
                        <Copy size={16} className="cursor-pointer" />
                      </CopyToClipboard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex mt-8 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  clear();
                  onClose();
                }}
              >
                {"Close"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <Permissions
        open={openPermissions}
        onOpenChange={setOpenPermissions}
        copy={copy}
      />
    </div>
  );
}
