"use client";

import { useState } from "react";
import { useCloudflareTurnstile } from "../components/cloudflare-turnstile";
import { verifyEmail } from "@/api/user";
import { useRouter, useSearchParams } from "next/navigation";
import { message, notify } from "@/components/ui/standard/notify";
import { NOVITA_URL } from "@/constants/urls";
import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";
import { Button } from "@/components/ui/button";

export function Form() {
  const search = useSearchParams();
  const token = search.get("token");
  const router = useRouter();

  // 处理email参数，解决+号被转换为空格的问题
  const rawEmail = search.get("email");
  const email = rawEmail ? rawEmail.replace(/\s/g, "+") : null;

  const { TurnstileElement, cloudflareToken, status, resetWidget } =
    useCloudflareTurnstile();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token || !email) {
      message.error("Invalid params.");
      return;
    }
    if (status !== "solved" || !cloudflareToken) {
      message.error("Please finish the captcha first.");
      return;
    }
    try {
      setLoading(true);
      await verifyEmail({
        token: token,
        email: email,
        cloudflareToken,
      });
      notify.success("Email verified", {
        description: "You can now proceed to the next step.",
      });
      dataLayerPushEvent(
        {
          event: GA_ENVENT.SIGN_UP_SUCCESS,
        },
        false,
        { posthog: false },
      );
      router.push(NOVITA_URL.USER_LOGIN);
    } catch (error) {
      console.error(error);
      resetWidget();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[460px] flex flex-col gap-6 px-6 py-8 bg-white border border-1 border-common-gray-2 rounded-lg items-center">
      <h4 className="font-h4">Email verification</h4>
      <div className="text-common-dark-2 text-center">
        {`We just need to make sure you're a real person before you can proceed. You can confirm your account email through the button below`}
      </div>
      <div className="flex justify-center items-center">{TurnstileElement}</div>
      <div>
        <Button
          page="console"
          className="!text-sm !h-[40px] w-full px-5"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            fontFamily: "var(--font-family) !important",
          }}
        >
          Confirm my account
        </Button>
      </div>
    </div>
  );
}
