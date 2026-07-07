import Link from "next/link";
import { ButtonArrow } from "@/components/ui/button";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { DOCS_URL } from "@/constants/urls";

interface DocumentLink {
  id: string;
  title: string;
  href: string;
}

function createDocumentLinks(): DocumentLink[] {
  return [
    {
      id: CLICK_BTN_IDs.MAIN_CONSOLE.DOCUMENTS_QUICK_START,
      title: "Quick Start",
      href: DOCS_URL.QUICK_START,
    },
    {
      id: CLICK_BTN_IDs.MAIN_CONSOLE.DOCUMENTS_MODEL_API,
      title: "Model API",
      href: DOCS_URL.MODEL_API,
    },
    {
      id: CLICK_BTN_IDs.MAIN_CONSOLE.DOCUMENTS_SERVERLESS,
      title: "Serverless",
      href: DOCS_URL.SERVERLESS,
    },
    {
      id: CLICK_BTN_IDs.MAIN_CONSOLE.DOCUMENTS_AGENT_SANDBOX,
      title: "Agent Sandbox",
      href: DOCS_URL.SANDBOX_INTRODUCTION,
    },
    {
      id: CLICK_BTN_IDs.MAIN_CONSOLE.DOCUMENTS_GPU_INSTANCE,
      title: "GPUs",
      href: DOCS_URL.GPUS,
    },
  ];
}

export default function Documents() {
  const documentLinks = createDocumentLinks();

  const handleDocumentClick = (id: string) => {
    analytics.trackClick(id);
  };

  return (
    <div>
      <h2 className="font-h5 text-common-dark-1">
        <span className="font-paragraph-20-medium text-text-1">Documents</span>
      </h2>
      <div className="font-paragraph-12 text-text-3 mt-1">
        Find guides and references to start building with Novita AI.
      </div>
      <div className="flex items-center gap-4 mt-4 border border-common-gray-2 rounded-md p-4">
        {documentLinks.map((doc) => (
          <Link
            key={doc.id}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleDocumentClick(doc.id)}
            className="box-border w-[180px] h-[40px] bg-fill-4 rounded-lg flex items-center justify-between px-4 hover:bg-[var(--fill-3)] transition-colors cursor-pointer "
          >
            <span className="text-[14px]">{doc.title}</span>
            <ButtonArrow />
          </Link>
        ))}
      </div>
    </div>
  );
}
