import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  "Custom pricing",
  "Guaranteed uptime & latency",
  "Unlimited scale",
  "Dedicated clusters",
];

export default function DeBanner({ className }: { className?: string }) {
  return (
    <div className={cn("max_width_container py-[70px]", className)}>
      <div className="bg-black relative rounded-lg overflow-hidden max-w-full md:h-[447px] flex flex-col md:flex-row justify-between box-border  mx-web py-[43px] md:px-[50px] px-5">
        <div className="flex-1">
          <h1 className="font-h2 md:font-h1 max-w-[400px] text-white">
            Dedicated Endpoint
          </h1>
          <p className="text-[#E9E9E9] mt-5">
            Enterprise-Grade Infrastructure for AI
          </p>
        </div>
        <div className="w-[340px] mt-14">
          <div className="text-white text-lg mb-5">
            For enterprises that require higher performance, tailored SLAs, or
            private hosting for custom models
          </div>
          <ul className="flex flex-col gap-2">
            {features.map((feature) => (
              <li className="flex items-center gap-2" key={feature}>
                <CheckCircle className="w-4 h-4 text-[var(--brand-0)]" />
                <span className="text-white text-sm italic">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            asChild
            className="mt-6 h-[40px]"
            id={CLICK_BTN_IDs.COMMON_COMPONENT.DE_BANNER_GO_TO_DE}
          >
            <Link href={NOVITA_URL.DEDICATED_ENDPOINT}>
              Get Enterprise-Grade Endpoint
            </Link>
          </Button>
        </div>
        <Image
          src="/de/de-mask.png"
          alt="de-banner"
          width={550}
          height={331}
          className="absolute left-[100px] bottom-0"
        />
      </div>
    </div>
  );
}
