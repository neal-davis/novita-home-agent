"use client";
import {
  Github_Client_ID,
  Google_Client_ID,
  Huggingface_Client_ID,
} from "@/constants/config";
import { Button } from "@/components/ui/button";
import styles from "./index.module.scss";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import {
  AUTH_BIND_GITHUB_CB_URL,
  AUTH_CB_URL,
  AUTH_CB_URL_KEY,
  AUTH_STATE,
  AUTH_TYPE,
  AUTH_TYPE_GITHUB,
  AUTH_TYPE_GOOGLE,
  AUTH_TYPE_HUGGINGFACE,
  AUTH_UNIFIED_CALLBACK_ORIGIN,
} from "@/constants/auth";

type AuthMethod = "google" | "github" | "huggingface" | string;

function needsCrossDomainCallback() {
  const { hostname } = window.location;
  return (
    hostname !== "novita.ai" &&
    hostname !== "chat.novita.ai" &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1"
  );
}

function generateGoogleState(callbackUrl: string) {
  return btoa(
    JSON.stringify({
      origin: window.location.origin,
      authType: AUTH_TYPE_GOOGLE,
      callbackUrl,
      redirectUrl: Cookies.get("redirect"),
      inviteToken: Cookies.get("invite_token"),
    }),
  );
}

export function googleLogin() {
  const isCrossDomain = needsCrossDomainCallback();
  const callbackUrl = isCrossDomain
    ? AUTH_UNIFIED_CALLBACK_ORIGIN + AUTH_CB_URL
    : window.location.origin + AUTH_CB_URL;
  const authUrl = encodeURIComponent(callbackUrl);
  const state = isCrossDomain ? generateGoogleState(callbackUrl) : undefined;

  Cookies.set(AUTH_CB_URL_KEY, authUrl);
  Cookies.set(AUTH_TYPE, AUTH_TYPE_GOOGLE);

  let url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${Google_Client_ID}&redirect_uri=${authUrl}&response_type=code&scope=email%20profile%20openid`;
  if (state) {
    url += `&state=${encodeURIComponent(state)}`;
  }
  window.location.href = url;
}

export function githubLogin() {
  const authUrl = encodeURIComponent(window.location.origin + AUTH_CB_URL);
  Cookies.set(AUTH_CB_URL_KEY, authUrl);
  Cookies.set(AUTH_TYPE, AUTH_TYPE_GITHUB);
  window.location.href = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${Github_Client_ID}&redirect_uri=${authUrl}`;
}

export function huggingfaceLogin() {
  const authUrl = encodeURIComponent(window.location.origin + AUTH_CB_URL);
  Cookies.set(AUTH_CB_URL_KEY, authUrl);
  Cookies.set(AUTH_TYPE, AUTH_TYPE_HUGGINGFACE);
  const state = Math.random().toString(36).substring(2, 15);
  Cookies.set(AUTH_STATE, state);
  window.location.href = `https://huggingface.co/oauth/authorize?client_id=${Huggingface_Client_ID}&redirect_uri=${authUrl}&scope=openid%20profile%20email&state=${state}&response_type=code`;
}

export function githubBinding() {
  const authUrl = encodeURIComponent(
    window.location.origin + AUTH_BIND_GITHUB_CB_URL,
  );
  window.location.href = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${Github_Client_ID}&redirect_uri=${authUrl}`;
}

export function ThirdPartLoginButton<T extends AuthMethod>({
  type,
  text,
  children,
  onClick,
  loading,
  className,
  disabled,
  id,
}: {
  type?: T;
  text?: string;
  children?: React.ReactNode;
  onClick?: (type?: T) => void;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
}) {
  if (type === "github") {
    return (
      <Button
        variant="outline"
        onClick={() => {
          if (loading || disabled) return;
          onClick?.(type);
        }}
        disabled={loading}
        className={cn(
          styles.third_part_login_button,
          className,
          disabled && styles.disabled_btn,
        )}
        id={id}
      >
        <div className="flex items-center gap-2">
          <img src={"/logo/github.svg"} alt="github" width={22} />
          <span>
            {loading ? "Authorizing..." : text || "Login with GitHub"}
          </span>
        </div>
      </Button>
    );
  }
  if (type === "google") {
    return (
      <Button
        variant="outline"
        className={cn(
          styles.third_part_login_button,
          className,
          disabled && styles.disabled_btn,
        )}
        onClick={() => {
          if (loading || disabled) return;
          onClick?.(type);
        }}
        disabled={loading}
        id={id}
      >
        <div className="flex items-center gap-2">
          <img src={"/logo/google.svg"} alt="google" width={22} />
          <span>
            {loading ? "Authorizing..." : text || "Login with Google"}
          </span>
        </div>
      </Button>
    );
  }
  if (type === "huggingface") {
    return (
      <Button
        variant="outline"
        className={cn(
          styles.third_part_login_button,
          className,
          disabled && styles.disabled_btn,
        )}
        onClick={() => {
          if (loading || disabled) return;
          onClick?.(type);
        }}
        disabled={loading}
        id={id}
      >
        <div className="flex items-center gap-2">
          <img src={"/logo/huggingface.svg"} alt="huggingface" width={22} />
          <span>
            {loading ? "Authorizing..." : text || "Login with Hugging Face"}
          </span>
        </div>
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (loading || disabled) return;
        onClick?.(type);
      }}
      disabled={loading}
      id={id}
    >
      {children}
    </Button>
  );
}
