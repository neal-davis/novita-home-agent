import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { reqGetOfficialTemplateById } from "@/api/gpu-instance/templates";
import styles from "./page.module.scss";
// import { getLandingPageTemplatesInServerEnv } from "@/api/config";
import { sliceUTCString } from "@/lib/utils/date";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { matchLogoForTemplate } from "@/lib/utils/utils";
// import ErrorPage from "@/app/components/error/ErrPage";
// import Nav from "./nav";
import UserTips from "./userTips";
import DeployBtn from "./deployBtn";
import FavoriteBtn from "./favoriteBtn";
import CopyLinkBtn from "./copyLinkBtn";
import { DetailsTab } from "./detailsTab";
import { ArrowUp as ArrowUpOutlined } from "lucide-react";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(props: {
  params: { templateId: string };
}): Promise<Metadata> {
  const templateInfo = await reqGetOfficialTemplateById(
    props.params.templateId,
  );
  const template = templateInfo?.template;
  if (!template) {
    redirect(NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY);
  }
  return {
    title: template?.name || "Novita AI GPU Instance templates library",
    description: template?.description || "",
    alternates: getLocalizedMetadataAlternates(
      `https://novita.ai/templates-library/${props.params.templateId}`,
    ),
  };
}

export default async function Section(props: {
  params: { templateId: string | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Check if source or utm_source exists in query parameters
  const hasSource = props.searchParams.source !== undefined;
  const hasUtmSource = props.searchParams.utm_source !== undefined;

  // If neither exists, redirect with UTM parameters
  if (!hasSource && !hasUtmSource) {
    // Get the current path using Next.js headers
    const headersList = headers();
    const pathname = headersList.get("x-pathname") || "";

    // Create new search params object
    const newSearchParams = new URLSearchParams();

    // Add all existing search params
    Object.entries(props.searchParams).forEach(([key, value]) => {
      if (typeof value === "string") {
        newSearchParams.set(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => newSearchParams.append(key, v));
      }
    });

    // Add UTM parameters
    newSearchParams.set("utm_source", "templates");
    newSearchParams.set("utm_medium", "page");
    newSearchParams.set("utm_campaign", props.params.templateId || "");

    // Construct the redirect URL with the current path
    const redirectUrl = `${pathname}?${newSearchParams.toString()}`;

    // Redirect to the new URL
    redirect(redirectUrl);
  }

  const templateInfoTmp = await reqGetOfficialTemplateById(
    props.params.templateId || "",
  );
  if (!templateInfoTmp && !templateInfoTmp?.template) {
    redirect(NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY);
  }
  const templateInfo = templateInfoTmp?.template;

  const favorite = props.searchParams?.favorite || "0";
  const filterName = props.searchParams?.filterName || "";
  const urlSharer = (props.searchParams?.sharer as string) || "";

  return (
    <>
      <ConsoleHeaderWrapper product="gpus">
        <main className="flex h-full flex-col">
          <div className={styles.subContainer}>
            <div className={styles.section}>
              <div
                style={{
                  marginBottom: "var(--spacing-console-24)",
                }}
                className="flex justify-between"
              >
                <Link
                  href={`${NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY}?filterName=${filterName}&favorite=${favorite}`}
                  className="font-body text-[var(--black)] hover:text-[var(--brand-0)]"
                  id={
                    CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_DETAIL_BACK_TO_LIBRARY
                  }
                >
                  <span className="iconfont icon-arrow-left text-[14px] mr-1"></span>
                  <span>Back to Templates Library</span>
                </Link>
                <UserTips templateInfo={templateInfo} />
              </div>
              <div
                style={{
                  marginBottom: "24px",
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                <div className={styles.cardFlexContainer}>
                  <div className="flex justify-between p-6">
                    <div className={styles.cardFlex}>
                      <span style={{ display: "inline-block" }}>
                        <img
                          alt=""
                          className={styles.logo}
                          src={matchLogoForTemplate(
                            templateInfo.logo,
                            templateInfo.image,
                          )}
                        />
                      </span>
                      <span
                        style={{
                          display: "inline-block",
                          maxWidth: "calc(100% - 88px)",
                        }}
                      >
                        <div className="font-h5 text-[var(--dark-1)] mb-4 flex gap-5 break-all">
                          {templateInfo.name}
                          <div className="flex justify-end gap-2 min-w-[180px]">
                            <FavoriteBtn templateInfo={templateInfo} />
                            <CopyLinkBtn templateInfo={templateInfo} />
                          </div>
                        </div>
                        <div className="font-subtle-medium text-[var(--dark-2)]">
                          {templateInfo.channel === "official" ? (
                            <span
                              className="p-1 bg-[var(--gray-3)]"
                              style={{ borderRadius: "4px" }}
                            >
                              Official template
                            </span>
                          ) : (
                            templateInfo.nickname
                          )}
                        </div>
                        <div className="font-subtle text-[var(--dark-2)] mt-2">
                          {templateInfo.image}
                        </div>
                        <div className="font-subtle text-[var(--dark-3)] mt-2">
                          Updated time:{" "}
                          {sliceUTCString(
                            new Date(
                              Number(templateInfo.updatedAt) * 1000,
                            ).toUTCString(),
                            "day",
                          )}
                          {templateInfo?.extra?.originLink &&
                            templateInfo?.extra?.origin && (
                              <Link
                                className={styles.link}
                                target="_blank"
                                href={templateInfo?.extra?.originLink}
                              >
                                <span className={styles.link_text}>
                                  {templateInfo?.extra?.origin}
                                </span>
                                <ArrowUpOutlined
                                  style={{
                                    fontSize: 15,
                                    transform: "rotate(45deg)",
                                    display: "inline-flex",
                                  }}
                                />
                              </Link>
                            )}
                        </div>
                        {templateInfo.image && (
                          <div>
                            <DeployBtn
                              templateInfo={templateInfo}
                              urlSharer={urlSharer}
                            />
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DetailsTab templateInfo={templateInfo} />
            </div>
          </div>
        </main>
      </ConsoleHeaderWrapper>
    </>
  );
}
