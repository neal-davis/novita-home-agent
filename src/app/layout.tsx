/* eslint-disable @next/next/no-sync-scripts, @next/next/next-script-for-ga -- Cookiebot auto-blocking must be the first synchronous script in head. */
import "./globals.scss";
import { ReduxProvider } from "./components/provider/ReduxProvider";
import { infoInServerEnv } from "@/api/user";
import { getRolePermissionsInServerEnv } from "@/api/permission";
import { configSlice } from "@/store/slice/configSlice";
import { userSlice, updateUserInfo } from "@/store/slice/userSlice";
import type { Metadata } from "next";
import "default-passive-events";
import AnalyticsWrapper from "./components/analytics/AnalyticsWrapper";
import { AppThemeProvider } from "@/app/components/provider/AppThemeProvider";
import PageTracker from "./components/PageTracker";
import { Toaster } from "@/components/ui/sonner";
import Tapfiliate from "./components/tapfiliate";
import {
  getNoticeConfigInServerEnv,
  getRegistrationCampaignConfigInServerEnv,
  getCampaignConfigInServerEnv,
} from "@/api/config";
import { getBatchPrice } from "@/api/price";
import {
  MODEL_API_PRODUCT_IDS,
  type ModelProductPriceSchema,
} from "@/constants/price";
import { dealMoneyWithPrecision } from "@/lib/utils/money";
import { LS_KEY_HIDE_NOTICE } from "@/store/slice/configSlice";
import IntercomManager from "@/app/components/Intercom/IntercomManager";
import { cookies, headers } from "next/headers";
import { miletusGrotesk, ttMono } from "./fonts";
import { StorageTransform } from "./components/header/StorageTransform";
import { isWithinValidityPeriod } from "@/lib/utils/registrationCampaign";
import NavigationTracker from "./components/NavigationTracker";
import { I18nProvider } from "@/i18n/provider";
import { initRequestI18n, serializeI18nSnapshot } from "@/i18n/server";
import {
  getLocalizedCanonicalUrl,
  getRequestMetadataAlternates,
} from "@/i18n/metadata";
import WebMCPProvider from "./components/WebMCPProvider";
import {
  COOKIEBOT_ENABLED_HEADER,
  COOKIEBOT_ID,
  COOKIEBOT_SCRIPT_SRC,
} from "@/constants/consent";
import ConsentControlledVercelInsights from "./components/consent/ConsentControlledVercelInsights";
import MarketingAttributionCollector from "./components/consent/MarketingAttributionCollector";
import { ConsentProvider } from "./components/consent/ConsentProvider";

// 超时处理工具函数
const SERVER_TIMEOUT = 10000; // 10秒超时

function withTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  label?: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[Timeout] ${label || "Request"} exceeded 10s`)),
        SERVER_TIMEOUT,
      ),
    ),
  ]).catch((err) => {
    console.error(err.message || err);
    return fallback;
  });
}

function getGoogleConsentDefaults(cookiebotEnabled: boolean) {
  const nonNecessaryValue = cookiebotEnabled ? "denied" : "granted";

  return {
    ad_personalization: nonNecessaryValue,
    ad_storage: nonNecessaryValue,
    ad_user_data: nonNecessaryValue,
    analytics_storage: nonNecessaryValue,
    functionality_storage: nonNecessaryValue,
    personalization_storage: nonNecessaryValue,
    security_storage: "granted",
    wait_for_update: 500,
  };
}

function getGoogleConsentModeScript(cookiebotEnabled: boolean) {
  const defaults = JSON.stringify(getGoogleConsentDefaults(cookiebotEnabled));

  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('consent', 'default', ${defaults});
    gtag('set', 'ads_data_redaction', true);
    (function() {
      function consentValue(granted) {
        return granted ? 'granted' : 'denied';
      }
      function syncCookiebotConsent() {
        if (!window.Cookiebot || !window.Cookiebot.consent || !window.gtag) {
          return;
        }
        var consent = window.Cookiebot.consent;
        window.gtag('consent', 'update', {
          ad_personalization: consentValue(consent.marketing),
          ad_storage: consentValue(consent.marketing),
          ad_user_data: consentValue(consent.marketing),
          analytics_storage: consentValue(consent.statistics),
          functionality_storage: consentValue(consent.preferences),
          personalization_storage: consentValue(consent.preferences),
          security_storage: 'granted'
        });
        window.dataLayer.push({ event: 'cookie_consent_update' });
      }
      window.addEventListener('CookiebotOnConsentReady', syncCookiebotConsent, false);
      window.addEventListener('CookiebotOnAccept', syncCookiebotConsent, false);
      window.addEventListener('CookiebotOnDecline', syncCookiebotConsent, false);
    })();
  `;
}

function getConsentControlledScriptProps(
  cookiebotEnabled: boolean,
  categories: string,
) {
  return cookiebotEnabled
    ? {
        "data-cookieconsent": categories,
        type: "text/plain",
      }
    : {
        type: "text/javascript",
      };
}

function getCookiebotCulture(locale: string) {
  return locale.split("-")[0]?.toUpperCase() || "EN";
}

const META = {
  title: "Novita AI – Model Libraries & GPU Cloud - Deploy, Scale & Innovate",
  description:
    "Novita AI provides 200+ Model APIs, custom deployment, GPU Instances, and Serverless GPUs. Scale AI, optimize performance, and innovate with ease and efficiency.",
  image: "/mainpage/media-logo.png",
  url: "https://novita.ai",
};

export async function generateMetadata(): Promise<Metadata> {
  const i18nSnapshot = await initRequestI18n();
  const headersList = headers();
  const canonicalPathname = headersList.get("x-pathname") || "/";
  const canonicalUrl = getLocalizedCanonicalUrl(
    canonicalPathname,
    i18nSnapshot.locale,
  );

  return {
    title: "Novita AI",
    manifest: "/manifest.json",
    alternates: getRequestMetadataAlternates(i18nSnapshot.locale),
    openGraph: {
      title: META.title,
      description: META.description,
      siteName: "Novita AI",
      images: [
        {
          url: META.image,
          alt: "Novita AI Logo",
        },
      ],
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: META.title,
      description: META.description,
      images: [
        {
          url: META.image,
          alt: "Novita AI Logo",
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const i18nSnapshot = await initRequestI18n();
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value || "";
  const headersList = headers();
  const cookiebotEnabled =
    Boolean(COOKIEBOT_ID) && headersList.get(COOKIEBOT_ENABLED_HEADER) !== "0";
  const googleConsentModeScript = getGoogleConsentModeScript(cookiebotEnabled);
  const marketingScriptProps = getConsentControlledScriptProps(
    cookiebotEnabled,
    "marketing",
  );
  const analyticsAndMarketingScriptProps = getConsentControlledScriptProps(
    cookiebotEnabled,
    "statistics,marketing",
  );
  const searchStr = headersList.get("x-search") ?? "";
  const searchParams = searchStr
    ? Object.fromEntries(new URLSearchParams(searchStr).entries())
    : {};
  const [
    noticeConfig,
    userInfo,
    permissionsConfig,
    campaignList,
    modelPriceResult,
    campaignConfig,
  ] = await Promise.all([
    withTimeout(
      getNoticeConfigInServerEnv(
        Number(cookieStore.get(LS_KEY_HIDE_NOTICE)?.value),
      ),
      null,
      "getNoticeConfigInServerEnv",
    ),
    withTimeout(infoInServerEnv({ token }), {}, "infoInServerEnv"),
    withTimeout(
      getRolePermissionsInServerEnv({ token }),
      {},
      "getRolePermissionsInServerEnv",
    ),
    withTimeout(
      getRegistrationCampaignConfigInServerEnv(),
      [],
      "getRegistrationCampaignConfigInServerEnv",
    ),
    withTimeout(
      (async () => {
        const ids = MODEL_API_PRODUCT_IDS as unknown as string[];
        const result = await getBatchPrice({
          businessType: "model_api",
          productIds: ids,
        });
        return result;
      })(),
      [],
      "getBatchPrice",
    ),
    withTimeout(
      getCampaignConfigInServerEnv(),
      {},
      "getCampaignConfigInServerEnv",
    ),
  ]);

  // Get server timestamp for campaign validation
  const serverTimestamp = Date.now();

  // Process model product price data
  const modelProductPrice: ModelProductPriceSchema = Array.isArray(
    modelPriceResult,
  )
    ? modelPriceResult.reduce((acc: ModelProductPriceSchema, curr) => {
        acc[curr.productId as keyof ModelProductPriceSchema] = {
          originalPrice: dealMoneyWithPrecision(
            curr.basePrice0,
            curr.pricePrecision,
            4,
          ),
          discountPrice: dealMoneyWithPrecision(
            curr.discountPrice0,
            curr.pricePrecision,
            4,
          ),
        };
        return acc;
      }, {})
    : {};

  let campaignData: Campaign | null = null;
  if (campaignList.length > 0) {
    campaignList.forEach((campaign: Campaign) => {
      const match = searchParams[campaign.campaignSlug];

      if (
        match &&
        isWithinValidityPeriod(campaign.beginTime, campaign.expiryTime)
      ) {
        campaignData = campaign;
      }
    });
  }

  return (
    <html
      lang={i18nSnapshot.locale}
      className={`${miletusGrotesk.variable} ${ttMono.variable}`}
    >
      <head>
        {cookiebotEnabled && (
          /*
            Defer Cookiebot until after hydration. Its `data-blockingmode="auto"`
            script rewrites <head> <script> tags as it loads; doing that while
            React is hydrating shifts the head nodes and triggers a hydration
            mismatch (#418 -> #423) that blanks the whole page. Inject it after
            `load` instead — same pattern as the Brevo tracker below. The
            consent-gated marketing scripts are blocked via `type="text/plain"`
            markup, so they stay blocked regardless of when Cookiebot loads.
          */
          <script
            id="cookiebot-loader"
            dangerouslySetInnerHTML={{
              __html: `
              (function () {
                function loadCookiebot() {
                  if (document.getElementById("Cookiebot")) return;
                  var s = document.createElement("script");
                  s.id = "Cookiebot";
                  s.src = ${JSON.stringify(COOKIEBOT_SCRIPT_SRC)};
                  s.type = "text/javascript";
                  s.async = true;
                  s.setAttribute("data-cbid", ${JSON.stringify(COOKIEBOT_ID)});
                  s.setAttribute("data-blockingmode", "manual");
                  s.setAttribute("data-type", "inlineoptin");
                  s.setAttribute("data-culture", ${JSON.stringify(getCookiebotCulture(i18nSnapshot.locale))});
                  s.setAttribute("data-widget-enabled", "false");
                  (document.head || document.documentElement).appendChild(s);
                }
                if (document.readyState === "complete") {
                  window.setTimeout(loadCookiebot, 0);
                } else {
                  window.addEventListener("load", function () {
                    window.setTimeout(loadCookiebot, 0);
                  }, { once: true });
                }
              })();`,
            }}
          />
        )}
        <script
          id="google-consent-mode-defaults"
          dangerouslySetInnerHTML={{
            __html: googleConsentModeScript,
          }}
        />
        <script
          id="novita-i18n"
          dangerouslySetInnerHTML={{
            __html: `window.__NOVITA_I18N__=${serializeI18nSnapshot(i18nSnapshot)};`,
          }}
        />
        <meta name="keywords" content="4090,gpu,ai,A100,h100" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        {/* LinkedIn (Open Graph) */}
        {/* <meta property="og:title" content="Novita AI" />
        <meta property="og:description" content="Novita AI provides model APIs and GPU cloud infrastructure." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://novita.ai" />
        <meta property="og:image" content="/mainpage/media-logo.png" /> */}

        {/* Twitter */}
        {/* <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Novita AI" />
        <meta name="twitter:description" content="Novita AI provides model APIs and GPU cloud infrastructure." />
        <meta name="twitter:image" content="/mainpage/media-logo.png" /> */}
        <link
          rel="icon"
          media="(prefers-color-scheme: light)"
          href="/favicon.ico"
        />
        <link
          rel="icon"
          media="(prefers-color-scheme: dark)"
          href="/favicon-dark.ico"
        />
        {process.env.NEXT_PUBLIC_BREVO_CLIENT_KEY && (
          <script
            id="brevo-tracker"
            {...marketingScriptProps}
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                function startBrevoTracker() {
                window.sib = {
                    equeue: [],
                    client_key: "${process.env.NEXT_PUBLIC_BREVO_CLIENT_KEY}"
                };
                /* OPTIONAL: email for identify request*/
                // window.sib.email_id = 'example@domain.com';
                window.sendinblue = {};
                for (var j = ['track', 'identify', 'trackLink', 'page'], i = 0; i < j.length; i++) {
                (function(k) {
                    window.sendinblue[k] = function() {
                        var arg = Array.prototype.slice.call(arguments);
                        (window.sib[k] || function() {
                                var t = {};
                                t[k] = arg;
                                window.sib.equeue.push(t);
                            })(arg[0], arg[1], arg[2], arg[3]);
                        };
                    })(j[i]);
                }
                if (!document.getElementById("sendinblue-js")) {
                  var n = document.createElement("script"),
                      i = document.getElementsByTagName("script")[0],
                      p = i && i.parentNode ? i.parentNode : document.head || document.body || document.documentElement;
                  n.type = "text/javascript", n.id = "sendinblue-js", n.async = !0, n.src = "https://sibautomation.com/sa.js?key=" + window.sib.client_key;
                  i && i.parentNode ? p.insertBefore(n, i) : p.appendChild(n);
                }
                window.sendinblue.page();
                }
                if (document.readyState === "complete") {
                  window.setTimeout(startBrevoTracker, 0);
                } else {
                  window.addEventListener("load", function() {
                    window.setTimeout(startBrevoTracker, 0);
                  }, { once: true });
                }
              })();`,
            }}
          />
        )}
      </head>
      <body>
        <noscript>
          The website requires JavaScript to function properly.
        </noscript>
        <ConsentProvider enabled={cookiebotEnabled}>
          <I18nProvider snapshot={i18nSnapshot}>
            <ReduxProvider
              initState={{
                config: {
                  ...configSlice.getInitialState(),
                  locale: i18nSnapshot.locale,
                  notice: noticeConfig,
                  permissionsConfig,
                  campaign: campaignData,
                  codingPlanCampaign:
                    campaignList.find(
                      (c: Campaign) => c.campaignCode === "CODING-PLAN",
                    ) || null,
                  modelProductPrice,
                  serverTimestamp,
                  campaignConfig,
                },
                user: {
                  ...userSlice.getInitialState(),
                  ...updateUserInfo(
                    {},
                    {
                      payload: userInfo,
                    },
                  ),
                },
              }}
            >
              <AppThemeProvider>
                <AnalyticsWrapper />
                <NavigationTracker />
                <WebMCPProvider />
                <div id="root">{children}</div>
                <PageTracker />
                <MarketingAttributionCollector />
                <Toaster />
                <IntercomManager />
                <Tapfiliate />
                <StorageTransform />
              </AppThemeProvider>
            </ReduxProvider>
          </I18nProvider>
          <ConsentControlledVercelInsights />
        </ConsentProvider>
        {process.env.NEXT_PUBLIC_GOOGLE_TRACKING_ID && (
          <script
            id="tag-manager"
            {...analyticsAndMarketingScriptProps}
            dangerouslySetInnerHTML={{
              __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});if(d.getElementById('gtm-js'))return;var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'',p=f&&f.parentNode?f.parentNode:d.head||d.body||d.documentElement;j.async=true;j.id='gtm-js';j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f&&f.parentNode?p.insertBefore(j,f):p.appendChild(j);
                  })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GOOGLE_TRACKING_ID}');
                `,
            }}
          />
        )}
        <script
          id="twitter"
          {...marketingScriptProps}
          dangerouslySetInnerHTML={{
            __html: `
            !function(e,t,n,s,u,a,p){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.id='twitter-pixel-js',u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],p=a&&a.parentNode?a.parentNode:t.head||t.body||t.documentElement,t.getElementById('twitter-pixel-js')||(a&&a.parentNode?p.insertBefore(u,a):p.appendChild(u)))}(window,document,'script');
            twq('config','oiy0m');
          `,
          }}
        />
      </body>
    </html>
  );
}
