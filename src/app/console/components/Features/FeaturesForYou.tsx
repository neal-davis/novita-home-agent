import Image from "next/image";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import Link from "next/link";

interface FeatureCardConfig {
  icon: string;
  iconAlt: string;
  iconBgColor: string;
  title: string;
  description: string;
  link: string;
  id: string;
}

function createFeatureCards(): FeatureCardConfig[] {
  return [
    {
      icon: "/console/featured/brain.svg",
      iconAlt: "dedicated-endpoints",
      iconBgColor: "#F5F5F5",
      title: "Explore Dedicated Endpoints",
      description:
        "Run your LLMs on a private, high-performance endpoint — fast, secure, and always ready.",
      link: NOVITA_URL.MODEL_API_CONSOLE_LLM_DE,
      id: CLICK_BTN_IDs.MAIN_CONSOLE.FEATURED_LLM_DEDICATED_ENDPOINT,
    },
    {
      icon: "/console/featured/box.svg",
      iconAlt: "feature-2",
      iconBgColor: "#F5F5F5",
      title: "Sandbox Browser Use",
      description:
        "Enable your agents to browse, search, and interact with the web in a secure sandbox.",
      link: DOCS_URL.SANDBOX_BROWSER_USE,
      id: CLICK_BTN_IDs.MAIN_CONSOLE.FEATURED_SANDBOX_BROWSER_USE,
    },
    {
      icon: "/console/featured/cloud-upload.svg",
      iconAlt: "feature-3",
      iconBgColor: "#F5F5F5",
      title: "Global High-Performance GPU Instances",
      description:
        "Deploy high-performance GPU instances globally with flexible on-demand and spot pricing, built for all AI workloads.",
      link: DOCS_URL.GPU_INSTANCE,
      id: CLICK_BTN_IDs.MAIN_CONSOLE
        .FEATURED_GLOBAL_HIGH_PERFORMANCE_GPU_INSTANCES,
    },
  ];
}

const FeatureCard = ({ config }: { config: FeatureCardConfig }) => {
  return (
    <Link href={config.link} id={config.id} className="flex-1 flex">
      <div className="p-4 border border-border-2 rounded-sm flex-1 flex flex-col hover:border-[var(--border-1)] hover:bg-[var(--fill-3)] cursor-pointer">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-sm flex justify-center items-center"
            style={{
              background: config.iconBgColor,
            }}
          >
            <Image
              src={config.icon}
              alt={config.iconAlt}
              width={16}
              height={16}
            />
          </div>
          <div className="font-paragraph-14-medium text-text-1">
            {config.title}
          </div>
        </div>
        <div className="font-paragraph-12 text-text-3 mt-1 flex-1">
          {config.description}
        </div>
      </div>
    </Link>
  );
};

export default function FeaturesForYou() {
  const featureCards = createFeatureCards();

  return (
    <div className="">
      <h2 className="flex items-center gap-1 font-h5">
        <span>🔥</span>
        <span className="font-paragraph-20-medium text-text-1">
          Featured for You
        </span>
      </h2>
      <p className="font-paragraph-12 text-text-3 mt-1">
        Curated services and features to kickstart your journey with Novita AI.
      </p>
      <div className="flex mt-4 gap-3 items-stretch">
        {featureCards.map((card, index) => (
          <FeatureCard key={index} config={card} />
        ))}
      </div>
    </div>
  );
}
