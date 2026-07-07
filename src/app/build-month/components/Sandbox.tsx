import outStyles from "./Products.module.scss";
import styles from "./Sandbox.module.scss";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import Capabilities from "./Capabilities";
import Features from "./Features";

export default function Sandbox() {
  return (
    <div>
      <div className={outStyles.badge_container}>
        <span className={outStyles.badge_primary}>UP TO 20% OFF</span>
        <span className={outStyles.badge_secondary}>
          <span>Novita Build Month 2025</span>
        </span>
      </div>
      <h3 className={outStyles.product_title}>
        Safe, instant runtimes for AI agents
      </h3>
      <p className={outStyles.product_description}>
        <div>Run autonomous agents with ease using our Agent Sandbox!</div>
        <div>
          Experience fast startups and secure tool use, billed per-second for
          CPU/RAM.
        </div>
      </p>
      <Button size="sl" asChild className="my-6">
        <Link href={NOVITA_URL.SANDBOX_PRICING}>Start Now</Link>
      </Button>
      <div>
        <Features />
      </div>
      <div>
        <Capabilities />
      </div>
    </div>
  );
}
