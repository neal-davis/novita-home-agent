"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useAppSelector } from "@/store";
import FirstPage from "./FirstPage";
import Register from "./Register";
import Share from "./Share";
import BindGithub from "./BindGithub";
import { userInviteInfo } from "@/api/user";
import FAQ from "./FAQ";
import Loading from "./Loading";
import { AFFILIATE_INVITE_URL_KEY } from "@/constants/constants";
import { TeamRole } from "@/store/slice/userSlice";

const STATUS = {
  NOT_LOGGED_IN: "NOT_LOGGED_IN",
  LOADING: "LOADING",
  LOADED: "LOADED",
};

interface InvitedInfo {
  inviteCode: string;
  inviteCount: number;
  registerCommissions: number;
  commissions: number;
  isRelatedGithub: boolean;
  isFromInvite: boolean;
  templateIds: string[];
}

export default function Main() {
  const currentTeam = useAppSelector((state) => state.user.currentTeam) || null;
  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState(STATUS.LOADING);

  const searchParams = useSearchParams();
  const invitedCode = searchParams.get(AFFILIATE_INVITE_URL_KEY) || "";

  const [invitedInfo, setInvitedInfo] = useState<InvitedInfo | null>(null);

  const isFromInvite = useMemo(() => {
    return Boolean(invitedInfo?.isFromInvite);
  }, [invitedInfo]);
  const isRelatedGithub = useMemo(() => {
    return Boolean(invitedInfo?.isRelatedGithub);
  }, [invitedInfo]);
  const isSubAccount = useMemo(() => {
    return Boolean(currentTeam && currentTeam.role !== TeamRole.owner);
  }, [currentTeam]);

  const fetchInvitedInfo = useCallback(async (count: number = 0) => {
    if (count === 0) {
      setStatus(STATUS.LOADING);
    }
    try {
      const result = await userInviteInfo();
      if (result) {
        setInvitedInfo(result);
        setStatus(STATUS.LOADED);
      }
      if (
        result?.isFromInvite &&
        result?.isRelatedGithub &&
        !Number(result.registerCommissions) &&
        count < 30
      ) {
        // Voucher delay
        setTimeout(() => {
          fetchInvitedInfo(count + 1);
        }, 5000);
      }
    } catch (error) {
      if (count < 3) {
        fetchInvitedInfo(count + 1);
      } else {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? Cookies.get("token") : "";
    if (!token) {
      setStatus(STATUS.NOT_LOGGED_IN);
    }
    if (token) {
      fetchInvitedInfo();
    }
    setIsClient(true);
  }, [fetchInvitedInfo]);

  if (!isClient) {
    return <Loading />;
  }

  return status === STATUS.LOADING ? (
    <Loading />
  ) : (
    <>
      <FirstPage
        isRelatedGithub={isRelatedGithub}
        isSubAccount={isSubAccount}
      />
      {status === STATUS.NOT_LOGGED_IN && (
        <Register
          invitedCode={invitedCode || ""}
          registered={false}
          isSubAccount={false}
        />
      )}
      {status === STATUS.LOADED && !isRelatedGithub && isFromInvite && (
        <Register
          invitedCode={invitedInfo?.inviteCode || ""}
          registered={true}
          isSubAccount={isSubAccount}
        />
      )}
      {status === STATUS.LOADED && !isRelatedGithub && !isFromInvite && (
        <BindGithub
          invitedCode={invitedInfo?.inviteCode || ""}
          isSubAccount={isSubAccount}
        />
      )}
      {status === STATUS.LOADED && isRelatedGithub && !isSubAccount && (
        <Share
          code={invitedInfo?.inviteCode || ""}
          inviteCount={invitedInfo?.inviteCount || 0}
          commissions={invitedInfo?.commissions || 0}
          registerCommissions={invitedInfo?.registerCommissions || 0}
          voucherTemplateIds={invitedInfo?.templateIds || []}
        />
      )}
      <FAQ />
    </>
  );
}
