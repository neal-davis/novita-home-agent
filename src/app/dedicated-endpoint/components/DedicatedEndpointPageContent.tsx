"use client";

import { useI18nSubscription } from "@/i18n/provider";
import DedicatedEndpointHero from "./DedicatedEndpointHero";
import DedicatedEndpointFeatures from "./DedicatedEndpointFeatures";
import DedicatedEndpointModelCatalog from "./DedicatedEndpointModelCatalog";
import DedicatedEndpointWorkflow from "./DedicatedEndpointWorkflow";
import DedicatedEndpointPricing from "./DedicatedEndpointPricing";
import DedicatedEndpointFaq from "./DedicatedEndpointFaq";

export default function DedicatedEndpointPageContent() {
  useI18nSubscription();

  return (
    <>
      <DedicatedEndpointHero />
      <DedicatedEndpointFeatures />
      <DedicatedEndpointModelCatalog />
      <DedicatedEndpointWorkflow />
      <DedicatedEndpointPricing />
      <DedicatedEndpointFaq />
    </>
  );
}
