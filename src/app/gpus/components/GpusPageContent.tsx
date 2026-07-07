import GpusCapabilitiesSection from "./GpusCapabilitiesSection";
import GpusCodeShowcaseSection from "./GpusCodeShowcaseSection";
import GpusSpecsSection from "./GpusSpecsSection";

export default function GpusPageContent() {
  return (
    <section className="mx-auto w-full min-w-0 max-w-layout-safe px-[var(--spacing-layout-x)] pb-space-120 pt-space-24">
      <GpusSpecsSection />
      <GpusCodeShowcaseSection />
      <GpusCapabilitiesSection />
    </section>
  );
}
