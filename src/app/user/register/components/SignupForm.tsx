"use client";

import { inviteCodeVerify, register } from "@/api/user";
import { getUserCollect } from "@/lib/utils/utils";
import { message, notify } from "@/components/ui/standard/notify";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import styles from "./SignupForm.module.scss";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchTeamInvite } from "@/store/slice/userSlice";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { useCloudflareTurnstile } from "../../components/cloudflare-turnstile";
import { LabelInput } from "../../components/label-input";
import { PasswordStrengthInput } from "@/components/ui/password-strength-input";
import { validateConfig } from "../../components/utils";
import {
  getRegistrationCampaign,
  isShowRegistrationCampaign,
  syncCampaignCodeForThirdPartyAuth,
} from "@/lib/utils/registrationCampaign";
import {
  githubLogin,
  googleLogin,
  huggingfaceLogin,
  ThirdPartLoginButton,
} from "../../components/third-part-login-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AFFILIATE_INVITE_URL_KEY } from "@/constants/constants";
import Cookies from "js-cookie";
import MDDocs from "@/components/ui/standard/md-docs";
import { makeLoginRegisterUrl } from "@/lib/utils/user";
import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";

export function SignupForm({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const showRegistrationCampaign = isShowRegistrationCampaign(searchParams);
  const registrationCampaign = getRegistrationCampaign();

  const router = useRouter();
  const path = usePathname();
  const search = useSearchParams();
  const dispatch = useAppDispatch();
  const inviteToken = search.get("invite_token");
  const inviteCode = search.get(AFFILIATE_INVITE_URL_KEY);
  const prefilledInviteCode =
    registrationCampaign?.campaignCode || inviteCode || "";

  const { TurnstileElement, cloudflareToken, status, resetWidget } =
    useCloudflareTurnstile();

  const [form, setForm] = useState({
    email: "",
    pwd: "",
    inviteCode: "",
  });

  const [validateResult, setValidateResult] = useState({
    email: "",
    pwd: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [huggingfaceLoading, setHuggingfaceLoading] = useState(false);
  const [isShowEmailRegister, setIsShowEmailRegister] = useState(false);

  const inviteTeam = useAppSelector((state) => state.user.teamInvite.teamName);

  // when pass key, only validate the attribute match key
  // when not pass key, validate all attributes
  const validateForm = useCallback(
    (key?: keyof typeof form, value?: string) => {
      if (key) {
        const validMethod = validateConfig[key];
        if (!validMethod) return "";
        const [, res] = validMethod(value ?? form[key]);
        setValidateResult((pre) => ({
          ...pre,
          [key]: res,
        }));
        return res;
      } else {
        const result: Record<string, string> = {} as any;
        Object.keys(form).forEach((key) => {
          const res = validateForm(key as keyof typeof form);
          result[key] = res as string;
        });
        return result;
      }
    },
    [form],
  );

  const submitForm = useCallback(async () => {
    const result = validateForm();
    if (Object.values(result).some((res) => res !== "")) {
      console.log("result", result);
      return;
    }
    // check invite code
    if (form.inviteCode) {
      const res = await inviteCodeVerify(form.inviteCode);
      if (!res || !res.isValid) {
        message.error("Invalid invitation code");
        return;
      }
    }
    if (status !== "solved" || !cloudflareToken) {
      message.error("Please finish the captcha first.");
      return;
    }
    const collectInfo = getUserCollect();
    setLoading(true);
    register({
      email: form.email,
      password: form.pwd,
      confirmPassword: form.pwd,
      ...collectInfo,
      redirectUrl: NOVITA_URL.USER_LOGIN,
      cloudflareToken: cloudflareToken,
      allowNotification: true,
      fromInviteCode: form.inviteCode,
    })
      .then(() => {
        dataLayerPushEvent({
          event: GA_ENVENT.SIGN_UP_SUCCESS,
        });
        Cookies.set("share_template_id", "");
        Cookies.set("share_sharer_uuid", "");
        router.push(`${NOVITA_URL.USER_LOGIN}`);
        notify.success("Activation email sent", {
          description: "Please check your email to activate your account.",
        });
      })
      .catch(() => {
        resetWidget();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    validateForm,
    form.inviteCode,
    form.email,
    form.pwd,
    status,
    cloudflareToken,
    router,
    resetWidget,
  ]);

  useEffect(() => {
    if (prefilledInviteCode) {
      setForm((prevForm) => {
        if (prevForm.inviteCode === prefilledInviteCode) {
          return prevForm;
        }
        return {
          ...prevForm,
          inviteCode: prefilledInviteCode,
        };
      });
    }
  }, [prefilledInviteCode]);

  useEffect(() => {
    if (!inviteTeam && inviteToken) {
      dispatch(fetchTeamInvite(inviteToken) as any);
    }
  }, [inviteTeam, inviteToken, dispatch]);

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
      <div className={styles.form_wrap}>
        <div className={styles.title}>Sign up for Novita</div>
        {showRegistrationCampaign
          ? renderCampaignTopInfo()
          : renderDefaultTopInfo()}
        <div className={styles.thridPart_container}>
          <ThirdPartLoginButton
            type="google"
            text="Sign up with Google"
            loading={googleLoading}
            className="w-full"
            onClick={() => {
              dataLayerPushEvent({
                event: GA_ENVENT.GOOGLE_CLICK,
              });
              syncCampaignCodeForThirdPartyAuth();
              setGoogleLoading(true);
              googleLogin();
            }}
            id={CLICK_BTN_IDs.USER.GOOGLE_SIGN_UP}
          />
          <ThirdPartLoginButton
            type="github"
            text="Sign up with GitHub"
            loading={githubLoading}
            className="w-full"
            onClick={() => {
              dataLayerPushEvent({
                event: GA_ENVENT.GITHUB_CLICK,
              });
              syncCampaignCodeForThirdPartyAuth();
              setGithubLoading(true);
              githubLogin();
            }}
            id={CLICK_BTN_IDs.USER.GITHUB_SIGN_UP}
          />
          <ThirdPartLoginButton
            type="huggingface"
            text="Sign up with Hugging Face"
            loading={huggingfaceLoading}
            className="w-full"
            onClick={() => {
              dataLayerPushEvent({
                event: GA_ENVENT.HUGGINGFACE_CLICK,
              });
              syncCampaignCodeForThirdPartyAuth();
              setHuggingfaceLoading(true);
              huggingfaceLogin();
            }}
            id={CLICK_BTN_IDs.USER.HUGGINGFACE_SIGN_UP}
          />
        </div>
        <Separator description="Or" className="my-4" />
        {!isShowEmailRegister && (
          <Button
            variant="ghost"
            className="mt-2 mb-6 !border-border-dark-3 !text-sm !h-[40px]"
            onClick={() => setIsShowEmailRegister(true)}
            id={CLICK_BTN_IDs.USER.SHOW_EMAIL_SIGN_UP}
            page="console"
            style={{
              fontFamily: "var(--font-family) !important",
            }}
          >
            Create with an Email
          </Button>
        )}
        {isShowEmailRegister && (
          <>
            <div className={styles.form_container}>
              <LabelInput
                label="Email Address"
                value={form.email}
                onChange={(email) => {
                  setForm((prevForm) => ({ ...prevForm, email }));
                  if (validateResult.email) {
                    validateForm("email", email);
                  }
                }}
                status={validateResult.email ? "error" : undefined}
                placeholder="Enter your email address"
                name="email"
                className="w-full"
                onBlur={() => validateForm("email")}
                isRequired
              />
              {validateResult.email && (
                <div className="text-red-500 text-sm mt-1">
                  {validateResult.email}
                </div>
              )}
              <PasswordStrengthInput
                value={form.pwd}
                onChange={(pwd) => {
                  setForm((prevForm) => ({ ...prevForm, pwd }));
                  if (validateResult.pwd) {
                    validateForm("pwd", pwd);
                  }
                }}
                label="Password"
                placeholder="Enter your password"
                name="password"
                onBlur={() => validateForm("pwd")}
                status={validateResult.pwd ? "error" : undefined}
                isRequired
              />
              {validateResult.pwd && (
                <div className="text-red-500 text-sm mt-1">
                  {validateResult.pwd}
                </div>
              )}
              <LabelInput
                label="Invitation Code"
                value={form.inviteCode}
                onChange={(inviteCode) => {
                  setForm((prevForm) => ({ ...prevForm, inviteCode }));
                }}
                placeholder="Enter your invitation code"
                name="invite-code"
                className="w-full"
                disabled={!!inviteCode}
              />
            </div>
            <Button
              variant="default"
              onClick={submitForm}
              id={CLICK_BTN_IDs.USER.SIGN_UP}
              style={{
                marginBottom: 24,
                fontFamily: "var(--font-family) !important",
              }}
              disabled={loading}
              page="console"
              className="!text-sm !h-[40px]"
            >
              Create an account
            </Button>
          </>
        )}

        <div className="flex justify-center items-center">
          {TurnstileElement}
        </div>

        <div className={styles.form_footer}>
          Already have an account?{" "}
          <span className="underline">
            <Link
              href={makeLoginRegisterUrl(NOVITA_URL.USER_LOGIN, {
                inviteToken,
                campaignSlug: registrationCampaign?.campaignSlug,
              })}
              className="hover:text-primary"
              id={CLICK_BTN_IDs.USER.SIGN_UP_GO_TO_LOGIN}
            >
              Log in
            </Link>
          </span>
        </div>
      </div>
      {showRegistrationCampaign && registrationCampaign && (
        <div className="block lg:hidden p-6 py-8">
          <MDDocs content={registrationCampaign.description} />
        </div>
      )}
    </div>
  );
}
