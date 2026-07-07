"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchUserInfo, fetchTeamInvite } from "@/store/slice/userSlice";
import Loading from "./Loading";
import NotLoggedIn from "./NotLoggedIn";
import NotCurrentAccount from "./NotCurrentAccount";
import CurrentAccount from "./CurrentAccount";

const STATUS = {
  NOT_LOGGED_IN: "NOT_LOGGED_IN",
  AUTH_LOADING: "AUTH_LOADING",
  NOT_CURRENT_ACCOUNT: "NOT_CURRENT_ACCOUNT",
  CURRENT_ACCOUNT: "CURRENT_ACCOUNT",
};

export default function Main() {
  const [isClient, setIsClient] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const uuid = useAppSelector((state) => state.user.uuid);
  const email = useAppSelector((state) => state.user.email);
  const invitedEmail = useAppSelector((state) => state.user.teamInvite.email);
  const invitedMobilePhone = useAppSelector(
    (state) => state.user.teamInvite.phone,
  );
  const teamName = useAppSelector((state) => state.user.teamInvite.teamName);
  const role = useAppSelector((state) => state.user.teamInvite.role);

  const inviteToken = searchParams.get("token") || "";

  if (!inviteToken) {
    router.push("/");
  }

  useEffect(() => {
    if (inviteToken) {
      dispatch(fetchTeamInvite(inviteToken) as any);
    }
  }, [inviteToken, router, dispatch]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? Cookies.get("token") : "";
    if (token) {
      dispatch(fetchUserInfo() as any);
    }
    setIsClient(true);
  }, [dispatch]);

  const status = useMemo(() => {
    const token = typeof window !== "undefined" ? Cookies.get("token") : "";
    if (!token) {
      return STATUS.NOT_LOGGED_IN;
    }
    if (!uuid || !(invitedEmail || invitedMobilePhone)) {
      return STATUS.AUTH_LOADING;
    }
    if (invitedEmail.toLowerCase() !== email.toLowerCase()) {
      return STATUS.NOT_CURRENT_ACCOUNT;
    }
    return STATUS.CURRENT_ACCOUNT;
  }, [uuid, email, invitedEmail, invitedMobilePhone]);

  return isClient ? (
    <>
      {status === STATUS.AUTH_LOADING && <Loading />}
      {status === STATUS.NOT_LOGGED_IN && (
        <NotLoggedIn
          teamName={teamName as string}
          inviteToken={inviteToken as string}
        />
      )}
      {status === STATUS.NOT_CURRENT_ACCOUNT && (
        <NotCurrentAccount inviteToken={inviteToken as string} />
      )}
      {status === STATUS.CURRENT_ACCOUNT && (
        <CurrentAccount
          email={invitedEmail}
          teamName={teamName}
          role={role}
          inviteToken={inviteToken}
        />
      )}
    </>
  ) : (
    <></>
  );
}
