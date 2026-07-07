"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
// import Image from "next/image";
import { NOVITA_URL } from "@/constants/urls";
import AuthHeader from "@/app/components/header/AuthHeader";

export default function OAuthSuccessPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  let client_name = searchParams.get("client_name");
  client_name = decodeURIComponent(client_name || "");
  const [decodedUrl, setDecodedUrl] = useState<string>("");
  console.log("decodedUrl", decodedUrl);

  const e2bSuccess = searchParams.get("e2b");

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (redirectUrl && e2bSuccess !== "success") {
      // const decodedUrl = "";
      const decodedUrl = decodeURIComponent(atob(redirectUrl));

      console.log("decodedUrl", decodedUrl);
      setDecodedUrl(decodedUrl);
      timer = setTimeout(() => {
        window.location.href = decodedUrl;
      }, 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [redirectUrl, e2bSuccess]);

  if (!redirectUrl && e2bSuccess !== "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">
            Invalid Redirect Link
          </h1>
          <p className="text-gray-600 text-center">
            The redirect link is invalid or has expired
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthHeader />
      <div className="flex flex-col items-center justify-start px-4 h-screen w-screen bg-[var(--gray-3)]">
        <div className="w-full max-w-[800px] overflow-hidden text-center mt-[156px]">
          <div className="px-8 py-10 flex flex-col items-center justify-center gap-6 rounded-[16px]">
            {/* <div className="flex items-center justify-center mx-auto mb-2 gap-2">
            <Image
              src="/icons/success.svg"
              alt="Success"
              width={60}
              height={60}
            />
          </div> */}
            <h1 className="font-h4-large text-[var(--dark-1)] text-center">
              {e2bSuccess !== "success"
                ? "Authorization Successful!"
                : `You've successfully connected ${
                    client_name || "Novita Sandbox CLI"
                  }`}
            </h1>
            <p className="font-p text-[var(--dark-2)] mb-1">
              {e2bSuccess !== "success"
                ? "Redirecting to your authorized application, please wait..."
                : `You may now close this window and start using the ${
                    client_name || "Novita Sandbox CLI"
                  } tool.`}
            </p>
            <p className="font-p text-[var(--dark-2)] mb-1">
              {e2bSuccess === "success" && (
                <a
                  style={{
                    fontSize: "16px",
                    lineHeight: "80px",
                    textDecorationLine: "underline",
                  }}
                  className="font-h5 text-[var(--dark-2)] hover:text-[var(--brand-0)]"
                  href={NOVITA_URL.SANDBOX_CONSOLE}
                >
                  {"-> Go to Agent Sandbox Console"}
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
