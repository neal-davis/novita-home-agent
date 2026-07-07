"use client";
import { message } from "@/components/ui/standard/notify";
import { useAppSelector } from "@/store";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { switchTeam } from "@/api/team";
import { TeamRole, TeamInfo } from "@/store/slice/userSlice";
import { Button, ButtonArrow } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "../../analytics/constants";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
const { HEADER_LINK_IDs } = CLICK_BTN_IDs;
const formatTeamID = (id: string) => {
  if (id.length <= 10) return id;
  return `${id.slice(0, 5)}****${id.slice(-5)}`;
};
export default function AuthTeamSwitcher() {
  const { locale } = useI18n();
  const username = useAppSelector((state) => state.user.username);
  const teams = useAppSelector((state) => state.user.teams);
  const curTeam = useAppSelector((state) => state.user.currentTeam);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTeamOwner = teams.some((team) => team.role === TeamRole.owner);
  const displayTeams: (
    | TeamInfo
    | {
        id: string;
        name: string;
      }
  )[] = [...teams];
  if (!isTeamOwner) {
    displayTeams.push({
      id: "",
      name: username,
    });
  }
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 150);
  };
  const handleClick = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(!isOpen);
  };
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="w-full flex items-center justify-between text-ellipsis cursor-pointer border-solid border-[1px] border-[var(--gray-2)] rounded-sm px-[8px] py-[6px] font-subtle whitespace-nowrap"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {curTeam?.name || username}{" "}
          <span className="flex items-center justify-center">
            <span className="px-1 bg-[var(--gray-3)] rounded-sm font-small-console ml-2">
              {curTeam ? "Team" : "Personal"}
            </span>
            <ChevronDown size={16} className="ml-1" />
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-2 pb-0 overflow-hidden z-1000"
        align="start"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col gap-[6px]">
          {displayTeams.map((team) => {
            const isActive =
              team.id === curTeam?.id || (team.id === "" && !curTeam);
            return (
              <div key={team.id || "personal"}>
                <div
                  className={`flex min-h-[52px] justify-between ${team.id ? "items-start" : "items-center"}
                    px-[8px] py-[5px]
                      ${isActive ? "bg-[var(--gray-3)]" : "cursor-pointer"}
                    hover:bg-[var(--gray-3)]
                    rounded-sm
                  `}
                  id={HEADER_LINK_IDs.SWITCH_TEAM}
                  onClick={() => {
                    if (isActive) {
                      return;
                    }
                    switchTeam(team.id)
                      .then(() => {
                        if (typeof window !== "undefined") {
                          window.location.reload();
                        }
                      })
                      .catch(() => {
                        message.error("Switch team failed");
                      });
                  }}
                >
                  <div>
                    <div
                      className={`font-subtle ${isActive ? "text-primary" : ""}`}
                    >
                      {team.name}
                    </div>
                    {team.id && (
                      <div
                        className={`font-small-console text-[var(--dark-3)]`}
                      >
                        {"Team ID"}
                        :&nbsp;
                        {formatTeamID(team.id)}
                      </div>
                    )}
                  </div>
                  <div className="rounded-sm px-1 bg-[var(--gray-3)] font-small-console">
                    {team.id ? "Team" : "Personal"}
                  </div>
                </div>
              </div>
            );
          })}
          <div>
            <Link
              href={getLocalizedPath(NOVITA_URL.SETTINGS_TEAM, locale)}
              className="flex border-t border-[var(--gray-3)] justify-start w-full h-[38px] px-[8px]"
            >
              <Button
                variant="text"
                size="link"
                className="flex items-center no-underline"
                id={HEADER_LINK_IDs.TEAM_SWITCHER_TEAM_SETTINGS}
              >
                <span className="font-subtle mr-[2px]">
                  {curTeam
                    ? curTeam.role === TeamRole.owner ||
                      curTeam.role === TeamRole.admin
                      ? "Team Settings"
                      : "My Team"
                    : "Create Team"}
                </span>
                <ButtonArrow />
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
