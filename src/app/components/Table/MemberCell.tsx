import { useAppSelector } from "@/store";
import { useState, useEffect } from "react";

export default function MemberCell({
  memberID,
  uuid,
  member,
}: {
  memberID?: string;
  uuid?: string;
  member?: { alias: string; phone: string; email: string; [key: string]: any };
}) {
  const [displayMember, setDisplayMember] = useState<
    { alias: string; phone: string; email: string } | undefined
  >(member);
  const allTeamMembers = useAppSelector((state) => state.user.allTeamMembers);

  useEffect(() => {
    if (member) {
      setDisplayMember(member);
      return;
    }
    let teamMember = allTeamMembers.find((m) => m.memberId === memberID);
    if (!teamMember && uuid) {
      teamMember = allTeamMembers.find((m) => m.userId === uuid);
    }
    if (teamMember) {
      setDisplayMember({
        alias: teamMember.alias,
        phone: teamMember.phone,
        email: teamMember.email,
      });
    }
  }, [memberID, uuid, member, allTeamMembers]);

  return (
    <div className="flex flex-col h-10 justify-center">
      {displayMember && (
        <>
          <span>{displayMember.alias || displayMember.email}</span>
          {displayMember.alias && (
            <span className="font-small-console text-[var(--dark-3)]">
              {displayMember.email}
            </span>
          )}
        </>
      )}
    </div>
  );
}
