"use client";

import AuthHeader from "@/app/components/header/AuthHeader";
import { NOVITA_URL } from "@/constants/urls";
import { useSearchParams } from "next/navigation";

export default function OAuthSuccessPage() {
  const searchParams = useSearchParams();
  let client_name = searchParams.get("client_name");
  client_name = decodeURIComponent(client_name || "");
  return (
    <>
      <AuthHeader />
      <div className="flex flex-col items-center justify-start px-4 h-screen w-screen bg-[var(--gray-3)]">
        <div className="w-full max-w-[800px] overflow-hidden text-center mt-[156px]">
          <div className="px-8 py-10 flex flex-col items-center justify-center gap-6 rounded-[16px]">
            <h1 className="font-h4-large text-[var(--red-1)] text-center">
              {`You have refused ${
                client_name || "Novita Sandbox CLI"
              } authorization`}
            </h1>
            <p className="font-p text-[var(--dark-2)] mb-1">
              {`You may now close this window and return to the ${
                client_name || "Novita Sandbox CLI"
              } page.`}
            </p>
            <p className="font-p text-[var(--dark-2)] mb-1">
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
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
