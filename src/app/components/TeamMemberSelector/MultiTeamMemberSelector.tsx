import { fetchAllTeamMembers, TeamMemberStatus } from "@/store/slice/userSlice";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown, Loader2, X } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandLoading,
} from "@/components/ui/command";
import { Check } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useAppSelector } from "@/store";
import { useAppDispatch } from "@/store";
import { selectTeamMembers } from "@/store/slice/userSlice";
import { cn } from "@/lib/utils";
export type TeamMember = {
  memberIds: string[];
  email: string;
  phone: string;
  alias?: string;
  role: string;
  status: TeamMemberStatus;
  joinedAt: number;
  userId: string;
};
interface MultiTeamMemberSelectorProps {
  selectedMembers: string[];
  onMembersChange: (members: string[], memberIds: string[]) => void;
  className?: string;
  placeholder?: string;
}
export function MultiTeamMemberSelector({
  selectedMembers,
  onMembersChange,
  className,
  placeholder = "Select members...",
}: MultiTeamMemberSelectorProps) {
  const [filterMemberOpen, setFilterMemberOpen] = useState(false);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const allTeamMembers = useAppSelector(selectTeamMembers);
  const fillTeamMembers = useCallback(() => {
    setLoadingTeamMembers(true);
    dispatch(fetchAllTeamMembers() as any)
      .unwrap()
      .then(() => {
        setLoadingTeamMembers(false);
      })
      .catch((error: any) => {
        console.log(error);
        setTeamMembersError("Failed to fetch team members");
        setLoadingTeamMembers(false);
      });
  }, [dispatch]);
  useEffect(() => {
    if (
      filterMemberOpen &&
      allTeamMembers.length === 0 &&
      !loadingTeamMembers
    ) {
      fillTeamMembers();
    }
  }, [filterMemberOpen, allTeamMembers, loadingTeamMembers, fillTeamMembers]);
  const handleMemberToggle = (member: TeamMember) => {
    const memberEmail = member.email;
    if (selectedMembers.includes(memberEmail)) {
      const newSelectedMembers = selectedMembers.filter(
        (email) => email !== memberEmail,
      );
      const newSelectedMembersData = allTeamMembers.filter((member) =>
        newSelectedMembers.includes(member.email),
      );
      const newMemberIds = [
        ...new Set(
          newSelectedMembersData.flatMap((member) => member.memberIds),
        ),
      ];
      onMembersChange(newSelectedMembers, newMemberIds);
      return;
    }
    if (selectedMembers.length >= 10) {
      return;
    }
    const newSelectedMembers = [...selectedMembers, memberEmail];
    const memberMap = new Map();
    allTeamMembers.forEach((member) => {
      if (newSelectedMembers.includes(member.email)) {
        const existingMember = memberMap.get(member.email);
        if (!existingMember || member.status === "Active") {
          memberMap.set(member.email, member);
        }
      }
    });
    const newSelectedMembersData = Array.from(memberMap.values());
    const newMemberIds = [
      ...new Set(
        newSelectedMembersData
          .map((member) => member?.memberIds?.[0])
          .filter(Boolean),
      ),
    ];
    onMembersChange(newSelectedMembers, newMemberIds);
  };
  const removeMember = (email: string) => {
    const newSelectedMembers = selectedMembers.filter(
      (member) => member !== email,
    );
    const memberMap = new Map();
    allTeamMembers.forEach((member) => {
      if (newSelectedMembers.includes(member.email)) {
        const existingMember = memberMap.get(member.email);
        if (!existingMember || member.status === "Active") {
          memberMap.set(member.email, member);
        }
      }
    });
    const newSelectedMembersData = Array.from(memberMap.values());
    const newMemberIds = [
      ...new Set(
        newSelectedMembersData
          .map((member) => member?.memberIds?.[0])
          .filter(Boolean),
      ),
    ];
    onMembersChange(newSelectedMembers, newMemberIds);
  };
  const getSelectedMembersData = () => {
    return allTeamMembers.filter((member) =>
      selectedMembers.includes(member.email),
    );
  };
  const selectedMembersData = getSelectedMembersData();
  return (
    <Popover open={filterMemberOpen} onOpenChange={setFilterMemberOpen}>
      <PopoverTrigger
        className={cn(
          "min-w-[180px] h-auto min-h-[40px] border border-input rounded-md px-3 py-2 text-sm bg-background",
          className,
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
            {selectedMembersData.length > 0 ? (
              <>
                {/* show first selected member */}
                <div
                  key={selectedMembersData[0].email}
                  className="flex items-center gap-1 px-2 py-1 rounded-[4px] border border-[#E7E6E2] bg-[#F5F5F5] text-xs whitespace-nowrap max-w-[90px]"
                >
                  <span className="truncate max-w-[60px]">
                    {selectedMembersData[0].alias ||
                      selectedMembersData[0].email}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMember(selectedMembersData[0].email);
                    }}
                    className="ml-1 hover:bg-[#E7E6E2] rounded-full p-0.5 flex-shrink-0"
                  >
                    <X size={10} />
                  </button>
                </div>
                {/* +N... */}
                {selectedMembersData.length > 1 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-[4px] border border-[#E7E6E2] bg-[#F5F5F5] text-xs whitespace-nowrap">
                    <span className="truncate">
                      +{selectedMembersData.length - 1}...
                    </span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown size={16} className="opacity-50 ml-1 flex-shrink-0" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="min-w-[280px] w-fit p-0 z-[99999]"
      >
        <Command>
          {selectedMembers.length >= 10 && (
            <div className="px-4 py-2 text-sm text-red-500 border-b border-red-200 bg-red-50">
              Recipient limit reached (10 max)
            </div>
          )}
          <CommandInput placeholder="Search members..." />
          <CommandList>
            {loadingTeamMembers && (
              <CommandLoading>
                <div className="flex items-center justify-center min-h-[100px]">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              </CommandLoading>
            )}
            {allTeamMembers.length === 0 &&
              !loadingTeamMembers &&
              teamMembersError && (
                <CommandEmpty>
                  <div className="flex items-center justify-center min-h-[100px] px-4">
                    {teamMembersError}
                  </div>
                </CommandEmpty>
              )}
            <CommandGroup>
              {allTeamMembers.map((m) => {
                const isSelected = selectedMembers.includes(m.email);
                const isDisabled = !isSelected && selectedMembers.length >= 10;
                return (
                  <CommandItem
                    className={cn(
                      "flex flex-col items-start py-2",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                    key={m.email}
                    value={`${m.alias || ""} ${m.email}`}
                    onSelect={() => !isDisabled && handleMemberToggle(m)}
                    disabled={isDisabled}
                  >
                    <div className="flex w-full justify-between items-center">
                      <div className="flex flex-col">
                        {m.alias ? (
                          <>
                            <span>{m.alias}</span>
                            <span className="font-small-console text-muted-foreground">
                              {m.email}
                            </span>
                          </>
                        ) : (
                          <span>{m.email}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {m.status === TeamMemberStatus.leftTeam && (
                          <div className="rounded-sm px-1 bg-[var(--gray-3)] font-small-console">
                            {"Left Team"}
                          </div>
                        )}
                        {isSelected && <Check size={14} className="ml-auto" />}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
