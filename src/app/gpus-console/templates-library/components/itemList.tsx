"use client";

import { sliceUTCString } from "@/lib/utils/date";
import { matchLogoForTemplate } from "@/lib/utils/utils";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import styles from "./itemList.module.scss";
import { Copy, Ellipsis, Link, UserIcon } from "lucide-react";
import { useAppSelector } from "@/store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export default function ItemList({
  deleteTemplate,
  modifyTemplate,
  copyTemplate,
  items,
  handleClick,
  handleFavorite,
  handleCopy,
}: {
  deleteTemplate: (id: string) => void;
  modifyTemplate: (id: string) => void;
  copyTemplate: (id: string, e: any) => void;
  items: any[];
  handleClick: (id: string) => void;
  handleFavorite: (id: string, isCollected: boolean, e: any) => void;
  handleCopy: (id: string, e: any) => void;
}) {
  const members = useAppSelector((state) => state.user.allTeamMembers) || [];
  function getCreator(creator: any, uuid: any) {
    const targetItem = members.find((item: any) => item.memberId === creator);
    if (targetItem) {
      return {
        name: targetItem.alias || "",
        email: targetItem.email,
      };
    } else {
      const newTargetItem = members.find((item: any) => item.userId === uuid);
      if (newTargetItem) {
        return {
          name: newTargetItem.alias || "",
          email: newTargetItem.email,
        };
      } else {
        return {
          name: "",
          email: "",
        };
      }
    }
  }

  const applicationList = {
    1: "LLM",
    2: "Image",
    3: "Audio",
    4: "Video",
  };
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  return (
    <div className={styles.card_container_list}>
      {items.map((item: any, index: number) => {
        const creator = getCreator(item.creator, item.uuid);
        return (
          <div
            onClick={() => {
              if (["official"].includes(item.channel)) {
                handleClick(item.Id);
              }
            }}
            key={index}
            className={`${styles.card_container} relative
            ${["official"].includes(item.channel) ? "cursor-pointer hover:border-[var(--dark-1)]" : ""}`}
          >
            {item?.extra?.tags?.includes("NEW") && (
              <img
                src="/gpu-instance/template-library/new-icon.svg"
                alt="new-icon"
                className="absolute top-[-3px] left-[-4px] w-9 h-9"
              />
            )}
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <img
                  alt="logo"
                  src={matchLogoForTemplate(item?.logo, item?.image)}
                  className="w-6 h-6 shrink-0"
                />
                <div className="flex flex-row gap-1">
                  {["official"].includes(item.channel) && (
                    <Tooltip
                      title={`${item.isCollected ? "Unfavorite Template" : "Favorite Template"}`}
                    >
                      <div
                        className="w-6 h-6 shrink-0 flex items-center 
                  justify-center hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px]"
                        onClick={(e: any) => {
                          handleFavorite(item.Id, item.isCollected, e);
                        }}
                      >
                        <img
                          src={
                            item.isCollected
                              ? "/gpu-instance/template-library/icon-fav.svg"
                              : "/gpu-instance/template-library/icon-unfav.svg"
                          }
                          alt="icon-fav"
                          className="w-4 h-4 shrink-0"
                        />
                      </div>
                    </Tooltip>
                  )}
                  {item.channel === "private" && (
                    <Tooltip title="Copy Template">
                      <div
                        className="w-6 h-6 shrink-0 flex items-center justify-center
                    hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px]"
                        onClick={(e: any) => {
                          copyTemplate(item.Id, e);
                        }}
                      >
                        <Copy className="w-4 h-4 shrink-0 text-[var(--dark-1)]" />
                      </div>
                    </Tooltip>
                  )}
                  {["official"].includes(item.channel) && (
                    <Tooltip title="Copy Link">
                      <div
                        className="w-6 h-6 shrink-0 flex 
                    items-center justify-center hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px]"
                        onClick={(e: any) => handleCopy(item.Id, e)}
                      >
                        <Link className="w-4 h-4 shrink-0 text-[var(--dark-1)]" />
                      </div>
                    </Tooltip>
                  )}
                  {item.channel === "private" && (
                    <Popover
                      open={openPopoverId === item.Id}
                      onOpenChange={(open) =>
                        setOpenPopoverId(open ? item.Id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <div
                          className="w-6 h-6 shrink-0 flex items-center justify-center
                        hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Ellipsis className="w-4 h-4 shrink-0 text-[var(--dark-1)]" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[136px] px-1 py-2"
                        align="end"
                      >
                        <div
                          className="font-subtle text-[var(--dark-1)] rounded-[4px] 
                            px-4 py-[6px] hover:bg-[var(--gray-3)] cursor-pointer"
                          onClick={() => modifyTemplate(item.Id)}
                        >
                          Edit
                        </div>
                        <div
                          className="font-subtle text-[var(--dark-1)] rounded-[4px] 
                            px-4 py-[6px] hover:bg-[var(--gray-3)] cursor-pointer"
                          onClick={() => deleteTemplate(item)}
                        >
                          Delete
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
              <div className="font-h7 text-[var(--black)]">{item.name}</div>
              <div className="font-small-console text-[var(--black)]">
                {item.image}
              </div>
            </div>
            <div className="flex flex-row gap-1">
              <div
                className={`px-[6px] flex items-center justify-center h-5 rounded-[4px] 
                ${
                  item.channel === "official"
                    ? "bg-[var(--purple-6)] text-[var(--purple-1)]"
                    : "bg-[var(--yellow-7)] text-[var(--yellow-1)]"
                }
                font-small-console`}
              >
                {item.channel === "official" ? "Official" : "Private"}
              </div>
              {applicationList[
                item.application as keyof typeof applicationList
              ] && (
                <div className="px-[6px] rounded-[4px] bg-[var(--gray-3)] font-small-console text-[var(--dark-1)]">
                  {
                    applicationList[
                      item.application as keyof typeof applicationList
                    ]
                  }
                </div>
              )}
            </div>
            <div className="h-[1px] w-full border-t border-dashed border-[var(--dark-4)]"></div>
            <div className="flex flex-row items-center gap-1">
              {item.channel === "private" && (
                <Tooltip
                  title={
                    <div className={`flex flex-col ${styles.creator_tooltip}`}>
                      {creator.name && (
                        <>
                          <div className="font-small-console-medium text-[var(--dark-1)]">
                            {`Creator: ${creator.name}`}
                          </div>
                        </>
                      )}
                      <div className="font-small-console text-[var(--dark-1)]">
                        {creator.email}
                      </div>
                    </div>
                  }
                  overlayClassName={styles.creator_tooltip_overlay}
                  placement="bottom"
                  className="flex flex-row items-center gap-1"
                >
                  <UserIcon className="w-3 h-3 shrink-0 text-[var(--dark-1)]" />
                  {creator.name && (
                    <span className="font-small-console text-[var(--dark-3-1)]">
                      {creator.name.length > 10
                        ? `${creator.name.slice(0, 10)}...`
                        : creator.name}
                    </span>
                  )}
                </Tooltip>
              )}
              {item.channel === "private" && (
                <div className="w-[1px] h-[9px] bg-[var(--gray-2)]"></div>
              )}
              {item.updatedAt === item.createdAt ? (
                <div className="font-small-console text-[var(--dark-3-1)]">
                  Create time:{" "}
                  {sliceUTCString(
                    new Date(Number(item.updatedAt) * 1000).toUTCString(),
                    "second",
                  )}
                </div>
              ) : (
                <div className="font-small-console text-[var(--dark-3-1)]">
                  Updated time:{" "}
                  {sliceUTCString(
                    new Date(Number(item.updatedAt) * 1000).toUTCString(),
                    "second",
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
