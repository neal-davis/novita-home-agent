import { fetchAllTeamMembers, TeamMemberStatus } from "@/store/slice/userSlice";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown, Loader2 } from "lucide-react";
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
  ids: string[];
  email: string;
  phone: string;
  alias?: string;
};
export default function TeamMemberSelector({
  onSelect,
  className,
  selectedMember,
}: {
  onSelect: (member: TeamMember | null) => void;
  className?: string;
  selectedMember?: TeamMember | null;
}) {
  const [filterMember, setFilterMember] = useState<
    TeamMember | null | undefined
  >(undefined);
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
    if (selectedMember !== undefined) {
      setFilterMember(selectedMember);
    } else {
      setFilterMember(undefined);
    }
  }, [selectedMember]);
  useEffect(() => {
    if (
      filterMemberOpen &&
      allTeamMembers.length === 0 &&
      !loadingTeamMembers
    ) {
      fillTeamMembers();
    }
  }, [filterMemberOpen, allTeamMembers, loadingTeamMembers, fillTeamMembers]);
  return (
    <Popover open={filterMemberOpen} onOpenChange={setFilterMemberOpen}>
      <PopoverTrigger className={cn("max-w-[180px] min-w-[100px]", className)}>
        {filterMember ? (
          <span className="overflow-hidden text-ellipsis">
            {filterMember.alias || filterMember.email}
          </span>
        ) : filterMember === undefined ? (
          <span className="font-subtle">{"Select a Member..."}</span>
        ) : (
          <span className="font-subtle">{"All"}</span>
        )}
        <ChevronDown size={16} className="opacity-50 ml-1" />
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-[140px] w-fit p-0">
        <Command>
          <CommandInput placeholder={"Search..."} />
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
              {allTeamMembers.length > 0 && (
                <CommandItem
                  value="all"
                  onSelect={() => {
                    setFilterMember(null);
                    setFilterMemberOpen(false);
                    onSelect(null);
                  }}
                >
                  {"All"}
                  {filterMember === null && (
                    <Check size={14} className="ml-auto" />
                  )}
                </CommandItem>
              )}
              {allTeamMembers.map((m) => (
                <CommandItem
                  className="flex flex-col items-start py-2"
                  key={m.email}
                  value={`${m.alias || ""} ${m.email}`}
                  onSelect={() => {
                    setFilterMember({
                      ids: m.memberIds,
                      email: m.email,
                      phone: m.phone,
                      alias: m.alias,
                    });
                    setFilterMemberOpen(false);
                    onSelect({
                      ids: m.memberIds,
                      email: m.email,
                      phone: m.phone,
                      alias: m.alias,
                    });
                  }}
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
                      {m.email === filterMember?.email && (
                        <Check size={14} className="ml-auto" />
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
