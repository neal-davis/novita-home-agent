import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getOAuthClient } from "../../../api/oauth";
import { infoInServerEnv } from "@/api/user";
import { NOVITA_URL } from "@/constants/urls";
// import { ArrowLeftRight } from "lucide-react";
import OAuthButtons from "./OAuthButtons";
import AuthTeamSwitcher from "@/app/components/header/partials/AuthTeamSwitcher";
import AuthHeader from "@/app/components/header/AuthHeader";

interface OAuthClientData {
  name: string;
  logo_url: string;
  homepage_url?: string;
  scopes: Array<{
    scope: string;
    description: string;
  }>;
}

export default async function OAuthPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const goLogin = () => {
    const currentPath = NOVITA_URL.OAUTH;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "utm_source") {
        continue;
      }
      if (typeof value === "string") {
        query.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      }
    }
    const queryString = query.toString();

    const fullCurrentPath = queryString
      ? `${currentPath}?${queryString}`
      : currentPath;

    const utmSource = searchParams.utm_source;
    const utmSourceQuery = utmSource ? `&utm_source=${utmSource}` : "";

    const redirectUrl = `${
      NOVITA_URL.USER_LOGIN
    }?login=true${utmSourceQuery}&redirect=${encodeURIComponent(
      fullCurrentPath,
    )}`;

    redirect(redirectUrl);
  };

  if (!token) {
    goLogin();
    return;
  }

  // Extract query parameters
  const clientId = (searchParams.client_id || "") as string;
  const scope = (searchParams.scope || "") as string;
  const redirectUri = (searchParams.redirect_uri || "") as string;
  const responseType = (searchParams.response_type || "code") as string;
  const state = (searchParams.state || "") as string;

  // If any required parameter is missing, show error
  if (!clientId || !redirectUri) {
    return (
      <div className="flex flex-col items-center justify-center px-4 h-screen w-screen bg-white">
        <div className="w-full max-w-[500px] overflow-hidden -mt-[100px]">
          <h1 className="text-2xl font-bold text-center mb-6">
            Request parameter error
          </h1>
          <p className="text-gray-600 text-center">
            Missing required parameters, authorization cannot be completed
          </p>
        </div>
      </div>
    );
  }

  // Fetch OAuth client data
  let clientData: OAuthClientData | APICommonErrorResponse | null = null;
  try {
    console.info("clientId", clientId);
    console.info("scope", scope);
    console.info("token", token);
    clientData = await getOAuthClient(clientId, scope, token);
    console.info("clientData", clientData);
  } catch (error) {
    console.info("[ERROR]: Failed to fetch OAuth client data:", error);
    clientData = null;
  }

  if (!clientData || "code" in clientData) {
    if (clientData?.code === 401) {
      goLogin();
      return;
    }
    return (
      <div className="flex flex-col items-center justify-center px-4 h-screen w-screen bg-white">
        <div className="w-full max-w-[500px] overflow-hidden -mt-[100px]">
          <h1 className="text-2xl font-bold text-center mb-6">
            Application information error
          </h1>
          <p className="text-gray-600 text-center">
            Unable to get application information, please contact the
            application provider
          </p>
        </div>
      </div>
    );
  }

  // Fetch user info
  const userInfo = await infoInServerEnv({ token });

  // Format phone number to display only last 4 digits
  // const formatPhoneNumber = (phone?: string) => {
  //   if (!phone) return "";
  //   if (phone.length >= 4) {
  //     return phone.slice(-4);
  //   }
  //   return phone;
  // };

  return (
    <>
      <AuthHeader />
      <div className="flex flex-col items-center justify-center px-4 h-screen w-screen bg-[var(--gray-3)]">
        <div className="w-full max-w-[549px] overflow-hidden -mt-[100px]">
          <div className="flex flex-col items-center mb-6">
            {clientData?.logo_url ? (
              <div className="flex items-center justify-center mb-4">
                <div className="w-[50px] h-[50px] border border-[var(--gray-1)] rounded-[50%] flex items-center justify-center mr-4">
                  {clientData?.logo_url && (
                    <Image
                      src={clientData.logo_url}
                      alt={clientData.name}
                      width={50}
                      height={50}
                      className="rounded-[50%]"
                    />
                  )}
                </div>
                <Image
                  src="/sandbox/oauth/exchange.svg"
                  alt="auth"
                  width={16}
                  height={16}
                />
                <div className="w-[50px] h-[50px] border border-[var(--gray-1)] rounded-[50%] bg-white flex items-center justify-center ml-4">
                  <Image
                    src="/logo/logo_small.svg"
                    alt="novita"
                    width={50}
                    height={50}
                    className="rounded"
                    style={{
                      scale: 0.8,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center mb-4">
                <div className="w-[50px] h-[50px] border border-[var(--gray-1)] rounded-[50%] bg-white flex items-center justify-center">
                  <Image
                    src="/logo/logo_small.svg"
                    alt="novita"
                    width={50}
                    height={50}
                    className="rounded"
                    style={{
                      scale: 0.8,
                    }}
                  />
                </div>
              </div>
            )}
            <h1 className="font-h5 text-center text-[var(--dark-1)]">
              {clientData?.name} is requesting access to your Novita account
              associated with email{" "}
              <span className="text-[var(--brand-0)]">{userInfo.email}</span>
            </h1>
          </div>
          <div
            className="w-full rounded-[12px] overflow-hidden p-6 bg-white flex flex-col gap-4"
            style={{
              border: "1px solid var(--gray-1)",
            }}
          >
            <div>
              <div className="font-body-medium text-[var(--dark-3)] mb-2">
                Select the team account you wish to authorize access to:
              </div>
              <div className="flex justify-center bg-white w-full">
                <AuthTeamSwitcher />
              </div>
            </div>
            {/* <div className="bg-[var(--gray-3)] rounded px-[10px] py-[14px]">
            <p className="text-[var(--dark-3)]">
              <span className="font-body">The</span>{" "}
              <span className="font-body-medium" style={{ fontWeight: "600" }}>
                {clientData?.name}
              </span>{" "}
              <span className="font-body">
                application is requesting access to your account{" "}
                <span className="text-[var(--brand-0)]">{userInfo.email}</span>
              </span>
            </p>
          </div> */}

            <div className="text-[var(--dark-3)]">
              <p className="mb-[6px] font-body-medium">Permissions Notice:</p>
              <ul className="space-y-1.5 font-subtle">
                {clientData?.scopes?.map(
                  (scopeItem: { scope: string; description: string }) => (
                    <li key={scopeItem.scope} className="flex items-center">
                      <span className="inline-block w-1 h-1 rounded-full bg-[var(--dark-3)] mr-1"></span>
                      <span>{scopeItem.description}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <OAuthButtons
              clientId={clientId}
              redirectUri={redirectUri}
              responseType={responseType}
              state={state}
              scope={scope}
              clientName={clientData?.name}
            />
          </div>
        </div>
      </div>
    </>
  );
}
