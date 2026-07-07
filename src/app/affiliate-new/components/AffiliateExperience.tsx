"use client";

import CopyToClipboard from "react-copy-to-clipboard";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAffiliateInfo, type AffiliateInfoResponse } from "@/api/user";
import {
  AFFILIATE_LOGIN_URL,
  AFFILIATE_PORTAL_URL,
  NOVITA_URL,
} from "@/constants/urls";
import { useAppSelector } from "@/store";
import { TeamRole, UserState } from "@/store/slice/userSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { message } from "@/components/ui/standard/notify";
import { Header as Banner } from "./Header";

const defaultAffiliateInfo: AffiliateInfoResponse = {
  referralLink: "",
  invites: 0,
  balance: 0,
  clicks: 0,
  password: "",
};

function copySuccess(label: string) {
  message.success(`${label} copied`);
}

function CopyValue({
  label,
  value,
  href,
}: {
  label: string;
  value?: string;
  href?: string;
}) {
  const canCopy = Boolean(value);

  return (
    <div className="flex items-center gap-3 rounded bg-[var(--fill-4)] px-4 py-3">
      <span className="sr-only">{label}</span>
      <div className="min-w-0 flex-1">
        {href && value ? (
          <a
            href={href}
            target="_blank"
            className="block truncate font-mono text-sm text-[var(--dark-1)] underline-offset-4 hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="block truncate font-mono text-sm text-[var(--dark-1)]">
            {value || "Not available yet"}
          </span>
        )}
      </div>
      <CopyToClipboard
        text={value || ""}
        onCopy={() => {
          if (canCopy) {
            copySuccess(label);
          }
        }}
      >
        <button
          type="button"
          disabled={!canCopy}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-[var(--dark-2)] transition-colors hover:bg-white hover:text-[var(--dark-1)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Copy ${label}`}
        >
          <Copy size={16} />
        </button>
      </CopyToClipboard>
    </div>
  );
}

function CredentialsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="h-[196px] rounded-lg" />
      <Skeleton className="h-[260px] rounded-lg" />
    </div>
  );
}

function AffiliateCredentials({
  affiliate,
  email,
  error,
  loading,
  onRetry,
}: {
  affiliate: AffiliateInfoResponse;
  email: string;
  error: boolean;
  loading: boolean;
  onRetry: () => void;
}) {
  return (
    <section id="affiliate-credentials" className="bg-[var(--fill-4)] py-20">
      <div className="max_width_container">
        <div className="mx-web">
          <div className="mx-auto mb-10 max-w-[760px] text-center">
            <h2 className="mb-3 text-3xl font-semibold leading-tight text-[var(--dark-1)] lg:text-4xl">
              Your Affiliate Credentials
            </h2>
            <p className="text-base leading-[1.5] text-[var(--dark-2)]">
              Start earning commissions with your personalized affiliate tools
            </p>
          </div>

          {loading ? (
            <CredentialsSkeleton />
          ) : error ? (
            <div className="mx-auto max-w-[820px] rounded-lg border border-[var(--border-default)] bg-white p-6">
              <p className="mb-4 text-base text-[var(--dark-2)]">
                Unable to load affiliate credentials. Please try again later.
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--dark-1)] px-4 font-mono text-base text-white transition-colors hover:bg-[var(--dark-2)]"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-[820px] space-y-6">
              <div className="rounded-lg border border-[var(--border-brand)] bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-3)] text-[var(--brand-1)]">
                    <Copy size={16} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-[var(--dark-1)]">
                      Your Referral Link
                    </h3>
                    <p className="text-sm leading-[1.5] text-[var(--dark-2)]">
                      Share this link to earn 10% commission on every
                      referral&apos;s spending
                    </p>
                  </div>
                </div>
                <CopyValue
                  label="Referral Link"
                  value={affiliate.referralLink}
                  href={affiliate.referralLink}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-[var(--border-default)] bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gray-3)] text-[var(--dark-2)]">
                      <ExternalLink size={16} />
                    </div>
                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-[var(--dark-1)]">
                        Affiliate Dashboard
                      </h3>
                      <p className="text-sm leading-[1.5] text-[var(--dark-2)]">
                        Track your referrals, earnings, and payout history
                      </p>
                    </div>
                  </div>
                  <a
                    href={AFFILIATE_LOGIN_URL}
                    target="_blank"
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded bg-[var(--dark-1)] px-4 font-mono text-sm text-white transition-colors hover:bg-[var(--dark-2)]"
                  >
                    Open Dashboard
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="rounded-lg border border-[var(--border-default)] bg-white p-6 shadow-sm">
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-[var(--dark-1)]">
                      Initial Login Credentials
                    </h3>
                    <p className="mb-5 text-sm leading-[1.5] text-[var(--dark-2)]">
                      Use these to access your affiliate dashboard for the first
                      time
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-[var(--dark-2)]">Email</p>
                      <CopyValue label="Email" value={email} />
                    </div>
                    <div>
                      <p className="mb-2 text-sm text-[var(--dark-2)]">
                        Initial Password
                      </p>
                      <CopyValue
                        label="Initial Password"
                        value={affiliate.password}
                      />
                    </div>
                    <p className="text-xs leading-[1.5] text-[var(--dark-3-1)]">
                      We recommend changing your password after your first
                      login.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function AffiliateExperience() {
  const token = useAppSelector((state) => state.user.token);
  const email = useAppSelector((state) => state.user.email);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const userState = useAppSelector((state) => state.user.state);
  const [affiliate, setAffiliate] =
    useState<AffiliateInfoResponse>(defaultAffiliateInfo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isLoggedIn = Boolean(token || email);
  const isUserReady = userState !== UserState.initializing;
  const isTeamNonOwner = Boolean(
    currentTeam && currentTeam.role !== TeamRole.owner,
  );

  const loginUrl = useMemo(
    () =>
      `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(
        NOVITA_URL.AFFILIATE,
      )}`,
    [],
  );

  const fetchAffiliateInfo = useCallback(() => {
    if (!isUserReady || !isLoggedIn || isTeamNonOwner) {
      return;
    }
    setLoading(true);
    setError(false);
    getAffiliateInfo()
      .then((res) => {
        setAffiliate({
          ...defaultAffiliateInfo,
          ...res,
        });
      })
      .catch((err) => {
        console.error("fetch affiliate credentials error", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoggedIn, isTeamNonOwner, isUserReady]);

  useEffect(() => {
    fetchAffiliateInfo();
  }, [fetchAffiliateInfo]);

  const handleLoginStart = useCallback(() => {
    localStorage.setItem("redirect", NOVITA_URL.AFFILIATE);
  }, []);

  return (
    <>
      <Banner
        affiliatePortalUrl={AFFILIATE_PORTAL_URL}
        isLoggedIn={isLoggedIn}
        isTeamNonOwner={isTeamNonOwner}
        loginUrl={loginUrl}
        onLoginStart={handleLoginStart}
      />
      {isLoggedIn && !isTeamNonOwner && (
        <AffiliateCredentials
          affiliate={affiliate}
          email={email}
          error={error}
          loading={loading}
          onRetry={fetchAffiliateInfo}
        />
      )}
    </>
  );
}
