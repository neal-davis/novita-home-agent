"use client";

import { useCallback } from "react";
import Image from "next/image";
import Button from "@/app/components/button/Button";

const MODELS_LIBRARY_ANCHOR_ID = "models-library";

export default function ModelLibraryHero() {
  const handleExploreModelsClick = useCallback(() => {
    document
      .getElementById(MODELS_LIBRARY_ANCHOR_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section className="relative w-full min-h-[700px] bg-[var(--gray-50)] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/models/v5/modelapi-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
          aria-hidden="true"
        />
      </div>

      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[208px] pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--gray-50))",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-start pointer-events-none">
        <div className="w-full max-w-[1512px] mx-auto px-[var(--spacing-layout-x)] pt-[215px] pointer-events-auto">
          <div className="max-w-[560px]">
            <div className="flex flex-col gap-[var(--space-24)]">
              <div className="flex items-center gap-[var(--space-8)]">
                <span
                  className="h-2 w-2 rounded-[2px] bg-[var(--brand-0)]"
                  aria-hidden
                />
                <span className="font-mono-13 uppercase text-[var(--dark-2)]">
                  MODEL APIS
                </span>
              </div>

              <div className="flex flex-col gap-[var(--space-16)]">
                <h1 className="font-miletus font-display-md text-[var(--text-1)]">
                  Browse our supported open source models
                </h1>
                <p className="font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[400px]">
                  Developer-first infrastructure that scales from zero to
                  production.
                </p>
              </div>

              <div className="flex items-center gap-[var(--space-12)]">
                <Button
                  type="primary"
                  height={40}
                  onClick={handleExploreModelsClick}
                  className="font-miletus font-paragraph-15"
                >
                  Explore Models
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
