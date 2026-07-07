import { Metadata } from "next";
import { FileText as FileTextOutlined } from "lucide-react";
import Markdown from "react-markdown";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { getLandingPageTemplatesInServerEnv } from "@/api/config";
import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import ErrorPage from "@/app/components/error/ErrPage";
import ReadyStart from "@/app/components/pageComponents/ReadyStart";
import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import Recommend from "./components/Recommend";
import ModelInfo from "./components/ModelInfo";
import styles from "./page.module.scss";
import { CANONICAL_URL } from "@/constants/canonical";
import { getLocalizedMetadataAlternates } from "@/i18n/metadata";

export async function generateMetadata(props: {
  params: { slug: string };
}): Promise<Metadata> {
  const templates: LangdingPageTemplateSchema[] =
    await getLandingPageTemplatesInServerEnv();
  const currentTemplate = templates.find(
    (item) => item.slug === props.params.slug,
  );
  return {
    title: currentTemplate?.title || "Template | Novita",
    description: currentTemplate?.description || "",
    alternates: getLocalizedMetadataAlternates(
      CANONICAL_URL.TEMPLATES + "/" + props.params.slug,
    ),
  };
}

export default async function Page(props: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const templates: LangdingPageTemplateSchema[] =
    await getLandingPageTemplatesInServerEnv();
  const currentTemplate = templates.find(
    (item) => item.slug === props.params.slug,
  );
  const recommendTemplates = templates
    .filter((item) => item.slug !== props.params.slug)
    .slice(-5);

  if (!currentTemplate) {
    return <ErrorPage page="404" />;
  }

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
    newSearchParams.set("utm_campaign", props.params.slug);

    // Construct the redirect URL with the current path
    const redirectUrl = `${pathname}?${newSearchParams.toString()}`;

    // Redirect to the new URL
    redirect(redirectUrl);
  }

  return (
    <main className={`relative max-w-full overflow-hidden ${styles.container}`}>
      <Header />
      <div className={`max_width_container ${styles.content}`}>
        <div className="mx-web">
          <ModelInfo data={currentTemplate} />
          <div className={styles.readme_wrap}>
            <div className={styles.readme_title}>
              <FileTextOutlined style={{ marginRight: 6 }} />
              {"README"}
            </div>
            <div className={styles.markdown}>
              <Markdown
                components={{
                  code({ className, children, ...props }: any) {
                    if (!children && children !== 0) return null;

                    const match = /language-(\w+)/.exec(className || "");
                    const inline =
                      typeof children.indexOf === "function"
                        ? children.indexOf("\n") === -1
                        : true;
                    return !inline || match ? (
                      <SyntaxHighlighter
                        showLineNumbers={true}
                        style={vscDarkPlus}
                        language={match?.[1] || "bash"}
                        PreTag="div"
                        codeTagProps={{
                          className: "!tt-mono",
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={`${className} ${styles.inline_code}`}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {currentTemplate.readme}
              </Markdown>
            </div>
          </div>
        </div>
      </div>
      {recommendTemplates.length > 0 && <Recommend data={recommendTemplates} />}
      <ReadyStart />
      <FooterBanner />
      <Footer />
    </main>
  );
}
