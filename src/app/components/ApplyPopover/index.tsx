"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DISCORD_INVITE_LINK, NOVITA_URL } from "@/constants/urls";
import { Button, ButtonArrow } from "@/components/ui/button";
import commomStyles from "./index.module.scss";

/**
 * Apply for access -- popover
 * Used for both server-side and client-side components, unable to pass in event functions, permission verification is first built into the component, and will need to be adjusted according to actual situations in the future (switch case)
 */
const DEFAULT_ACCESS_URL = NOVITA_URL.GPU_CONSOLE_SERVERLESS;

type IProps = {
  applyTips: string;
  accessUrl?: string;
  buttonText?: string;
  buttonType?: "nomal" | "boxWhite" | "boxGray"; // Three built-in button types. If these don't meet your needs, you can pass in children
  children?: React.ReactNode; // If children are passed in, the type prop is ignored
};

const Popconfirm: React.FC<{
  children: React.ReactNode;
  contactTips: string;
  accessUrl: string;
}> = ({ children, contactTips, accessUrl }) => {
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(accessUrl);
  }, [accessUrl, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toDiscordPage(url: string) {
    if ("undefined" !== typeof window) {
      window.open(url);
    }
  }

  return (
    <div
      className={`relative inline-block ${commomStyles.popover_content_wrap}`}
    >
      <div onClick={handleClick} className="inline-block">
        {children}
      </div>
      {isVisible && (
        <div
          ref={popoverRef}
          className={`absolute ${commomStyles.popover_box}`}
        >
          <p>{contactTips}</p>
          <Button
            style={{
              fontSize: 16,
              fontWeight: 600,
              height: "60px",
              width: "100%",
            }}
            onClick={() => toDiscordPage(DISCORD_INVITE_LINK)}
          >
            <Image
              width={24}
              height={24}
              src={"/header/discord.png"}
              alt="discord"
              priority
            />{" "}
            To Discord
          </Button>
        </div>
      )}
    </div>
  );
};

export default function ApplyPopover({
  applyTips,
  buttonText,
  buttonType,
  children,
  accessUrl = DEFAULT_ACCESS_URL,
}: IProps) {
  const content = useMemo(() => {
    if (children) {
      return children;
    } else if (!buttonType || buttonType === "nomal") {
      return (
        <Button
          style={{
            width: 148,
          }}
          className={commomStyles.btn}
        >
          <div className="flex items-center">
            <span>{buttonText}</span>
            <ButtonArrow />
          </div>
        </Button>
      );
    } else {
      return (
        <div
          className={`flex flex-row justify-between items-center ${
            commomStyles.btn_box
          } ${buttonType === "boxGray" ? commomStyles.btn_box_gray : ""}`}
        >
          <span className={commomStyles.try_btn_text}>{buttonText}</span>
          <span
            className={`flex flex-row justify-center items-center ${commomStyles.arrow_span}`}
          >
            <span className="iconfont icon-right-arrow"></span>
          </span>
        </div>
      );
    }
  }, [buttonType, buttonText, children]);

  return (
    <Popconfirm contactTips={applyTips} accessUrl={accessUrl}>
      {content}
    </Popconfirm>
  );
}
