"use client";

import styles from "./LoginForm.module.scss";
import { login } from "@/api/user";
import { getUserCollect } from "@/lib/utils/utils";
import { message } from "@/components/ui/standard/notify";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchTeamInvite } from "@/store/slice/userSlice";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { Separator } from "@/components/ui/separator";
import debounce from "lodash/debounce";

import { handleLoginSuccessCb } from "@/lib/utils/user";
import {
  getRegistrationCampaign,
  isShowRegistrationCampaign,
  syncCampaignCodeForThirdPartyAuth,
} from "@/lib/utils/registrationCampaign";
import { FormNotice } from "./FormNotice";
import {
  githubLogin,
  googleLogin,
  huggingfaceLogin,
  ThirdPartLoginButton,
} from "../../components/third-part-login-button";
import { Button } from "@/components/ui/button";
import { LabelInput, LabelPassword } from "../../components/label-input";
import { useCloudflareTurnstile } from "../../components/cloudflare-turnstile";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import MDDocs from "@/components/ui/standard/md-docs";
import { makeLoginRegisterUrl } from "@/lib/utils/user";
import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";

export function LoginForm({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const dispatch = useAppDispatch();

  const showRegistrationCampaign = isShowRegistrationCampaign(searchParams);
  const registrationCampaign = getRegistrationCampaign();
  const router = useRouter();
  const path = usePathname();
  const search = useSearchParams();
  const utm_source = search.get("utm_source");
  const redirect = search.get("redirect");
  const inviteToken = search.get("invite_token");

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [huggingfaceLoading, setHuggingfaceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShowEmailLogin, setIsShowEmailLogin] = useState(false);
  const [isCheckForm, setIsCheckForm] = useState(false);

  const inviteTeam = useAppSelector((state) => state.user.teamInvite.teamName);

  const { TurnstileElement, cloudflareToken, status, resetWidget } =
    useCloudflareTurnstile();

  const submitForm = useCallback(() => {
    if (status !== "solved" || !cloudflareToken) {
      message.error("Please finish the captcha first.");
      return;
    }
    if (!email || !pwd) {
      setIsCheckForm(true);
      return;
    }
    const collectInfo = getUserCollect();
    setLoading(true);
    login({
      email,
      password: pwd,
      ...collectInfo,
      redirectUrl: path,
      cloudflareToken: cloudflareToken,
      fromInviteCode: registrationCampaign?.campaignCode || "",
    })
      .then((response) => {
        handleLoginSuccessCb({
          response,
          searchParams: search,
          router,
          dispatch,
          pathname: path,
        });
      })
      .catch((error) => {
        if (error.reason === "USER_IS_LOCKED") {
          const lockTime = error?.metadata[0];
          if (lockTime) {
            const dateFormat = dayjs.unix(lockTime).format("MM/DD HH:mm");
            setError(
              `Your account has been locked. Please try again after ${dateFormat}.`,
            );
            return;
          }
        } else {
          setError(null);
        }
        resetWidget();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    cloudflareToken,
    email,
    path,
    pwd,
    registrationCampaign,
    resetWidget,
    status,
    search,
    dispatch,
    router,
  ]);

  // Create debounced submit function to prevent multiple clicks
  const debouncedSubmitForm = useMemo(
    () =>
      debounce(() => {
        if (!loading) {
          submitForm();
        }
      }, 300),
    [submitForm, loading],
  );

  // Create debounced third-party login functions
  const debouncedGoogleLogin = useMemo(
    () =>
      debounce(() => {
        if (!googleLoading) {
          dataLayerPushEvent({
            event: GA_ENVENT.GOOGLE_CLICK,
          });
          syncCampaignCodeForThirdPartyAuth();
          setGoogleLoading(true);
          googleLogin();
        }
      }, 300),
    [googleLoading],
  );

  const debouncedGithubLogin = useMemo(
    () =>
      debounce(() => {
        if (!githubLoading) {
          dataLayerPushEvent({
            event: GA_ENVENT.GITHUB_CLICK,
          });
          syncCampaignCodeForThirdPartyAuth();
          setGithubLoading(true);
          githubLogin();
        }
      }, 300),
    [githubLoading],
  );

  const debouncedHuggingfaceLogin = useMemo(
    () =>
      debounce(() => {
        if (!huggingfaceLoading) {
          dataLayerPushEvent({
            event: GA_ENVENT.HUGGINGFACE_CLICK,
          });
          syncCampaignCodeForThirdPartyAuth();
          setHuggingfaceLoading(true);
          huggingfaceLogin();
        }
      }, 300),
    [huggingfaceLoading],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading && email && pwd) {
      e.stopPropagation();
      e.preventDefault();
      debouncedSubmitForm();
    }
  };

  useEffect(() => {
    if (!inviteTeam && inviteToken) {
      dispatch(fetchTeamInvite(inviteToken) as any);
    }
  }, [inviteTeam, inviteToken, dispatch]);

  useEffect(() => {
    if (utm_source && redirect) {
      localStorage.setItem("sign_up_from", utm_source);
    }
  }, [utm_source, redirect]);

  useEffect(() => {
    if (redirect) {
      localStorage.setItem("redirect", redirect);
      Cookies.set("redirect", redirect);
    }
  }, [redirect]);

  useEffect(() => {
    if (inviteToken) {
      Cookies.set("invite_token", inviteToken);
    }
  }, [inviteToken]);

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedSubmitForm.cancel();
      debouncedGoogleLogin.cancel();
      debouncedGithubLogin.cancel();
      debouncedHuggingfaceLogin.cancel();
    };
  }, [
    debouncedSubmitForm,
    debouncedGoogleLogin,
    debouncedGithubLogin,
    debouncedHuggingfaceLogin,
  ]);

  const renderDefaultTopInfo = (className: string = "") => {
    return (
      <div className={`${styles.description} ${className}`}>
        {inviteTeam ? (
          <span>
            <span>{"You've been invited to join"}</span>{" "}
            <span className={styles.invite_team}>
              {inviteTeam}
              <span className="ml-[4px]">Team</span>
            </span>
          </span>
        ) : null}
      </div>
    );
  };

  const renderCampaignTopInfo = () => {
    if (!registrationCampaign || !registrationCampaign.title) {
      return null;
    }
    return (
      <>
        {renderDefaultTopInfo("hidden lg:block")}
        <div className="block lg:hidden">
          <span
            className="block font-body mt-1 text-center"
            style={{ color: "var(--dark-2)" }}
          >
            {registrationCampaign.title}
          </span>
        </div>
      </>
    );
  };

  return (
    <div>
      <form
        className={styles.form_wrap}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormNotice />
        <div className={styles.title}>Login for Novita</div>
        {showRegistrationCampaign
          ? renderCampaignTopInfo()
          : renderDefaultTopInfo()}
        <div className={styles.thridPart_container}>
          <ThirdPartLoginButton
            type="google"
            loading={googleLoading}
            className="w-full"
            onClick={debouncedGoogleLogin}
            id={CLICK_BTN_IDs.USER.GOOGLE_LOG_IN}
          />
          <ThirdPartLoginButton
            type="github"
            loading={githubLoading}
            className="w-full"
            onClick={debouncedGithubLogin}
            id={CLICK_BTN_IDs.USER.GITHUB_LOG_IN}
          />
          <ThirdPartLoginButton
            type="huggingface"
            loading={huggingfaceLoading}
            className="w-full"
            onClick={debouncedHuggingfaceLogin}
            id={CLICK_BTN_IDs.USER.HUGGINGFACE_LOG_IN}
          />
        </div>
        <Separator description="Or" className="my-4" />
        {!isShowEmailLogin && (
          <Button
            variant="ghost"
            className="mt-2 mb-6 !border-border-dark-3 !text-sm !h-[40px]"
            onClick={() => {
              setIsShowEmailLogin(true);
              resetWidget();
            }}
            id={CLICK_BTN_IDs.USER.SHOW_EMAIL_LOG_IN}
            page="console"
            style={{
              fontFamily: "var(--font-family) !important",
            }}
          >
            Login with Email
          </Button>
        )}
        {isShowEmailLogin && (
          <>
            <div className={styles.form_container}>
              <LabelInput
                value={email}
                onChange={setEmail}
                label="Email address"
                placeholder="Enter your email address"
                name="email"
                onKeyDown={handleKeyDown}
                status={isCheckForm && !email ? "error" : undefined}
                isRequired
              />
              <LabelPassword
                value={pwd}
                onChange={setPwd}
                label="Password"
                placeholder="Enter your password"
                name="password"
                onKeyDown={handleKeyDown}
                rightLabel={
                  <Link
                    className="font-small-console leading-none text-common-dark-1 underline hover:text-primary"
                    href={NOVITA_URL.USER_RESET_PASSWORD}
                  >
                    Forgot password?
                  </Link>
                }
                status={isCheckForm && !pwd ? "error" : undefined}
                isRequired
              />
            </div>
            <Button
              variant="default"
              onClick={debouncedSubmitForm}
              id={CLICK_BTN_IDs.USER.LOG_IN}
              style={{
                marginBottom: 24,
                fontFamily: "var(--font-family) !important",
              }}
              size="lg"
              disabled={loading}
              page="console"
              className="!text-sm !h-[40px]"
            >
              Log in
            </Button>
          </>
        )}
        {isShowEmailLogin && (
          <div className="flex justify-center items-center">
            {TurnstileElement}
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.form_footer}>
          {"Need to create an account?"}{" "}
          <span className="underline">
            <Link
              href={makeLoginRegisterUrl(NOVITA_URL.USER_REGISTER, {
                inviteToken,
                campaignSlug: registrationCampaign?.campaignSlug,
              })}
              className={styles.sign_up_link}
              id={CLICK_BTN_IDs.USER.LOG_IN_GO_TO_SIGN_UP}
            >
              Sign up
            </Link>
          </span>
        </div>
      </form>
      {showRegistrationCampaign && registrationCampaign && (
        <div className="block lg:hidden p-6 py-8">
          <MDDocs content={registrationCampaign.description} />
        </div>
      )}
    </div>
  );
}
