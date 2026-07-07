import type { AnyModel } from "@/lib/model-library/capabilities";
import { getFeaturedModels } from "@/lib/model-library/sections";
import { groupConsoleModelsByType } from "../utils/consoleModelSections";
import { ConsoleModelCard } from "./ConsoleModelCard";
import { ConsoleModelEmptyState } from "./ConsoleModelEmptyState";
import { ConsoleModelList } from "./ConsoleModelList";
import { ConsoleRecommendModelCard } from "./ConsoleRecommendModelCard";
import type { ConsoleModelViewMode } from "./ConsoleModelToolbar";

interface ConsoleModelMainProps {
  models: AnyModel[];
  allModels: AnyModel[];
  viewMode: ConsoleModelViewMode;
  showFeatured: boolean;
  showFlatResults: boolean;
  onViewAllSection?: (value: string) => void;
}

const sectionModelVisibilityClassNames = [
  "",
  "hidden sm:block",
  "hidden xl:block",
  "hidden 2xl:block",
] as const;

const sectionViewAllVisibilityClassNames = [
  "sm:hidden",
  "hidden sm:inline-flex xl:hidden",
  "hidden xl:inline-flex 2xl:hidden",
  "hidden 2xl:inline-flex",
] as const;

function getSectionViewAllVisibilityClassNames(modelCount: number) {
  return sectionViewAllVisibilityClassNames.filter(
    (_, index) => modelCount > index + 1,
  );
}

export function ConsoleModelMain({
  models,
  allModels,
  viewMode,
  showFeatured,
  showFlatResults,
  onViewAllSection,
}: ConsoleModelMainProps) {
  const featuredModels = showFeatured ? getFeaturedModels(allModels) : [];

  if (models.length === 0) {
    return <ConsoleModelEmptyState />;
  }

  if (showFlatResults) {
    if (viewMode === "list") {
      return <ConsoleModelList models={models} />;
    }

    return (
      <div className="grid gap-space-12 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {models.map((model) => (
          <ConsoleModelCard key={model.id} model={model} />
        ))}
      </div>
    );
  }

  const sections = groupConsoleModelsByType(models);

  return (
    <div className="flex flex-col gap-space-32">
      {featuredModels.length > 0 ? (
        <section className="flex flex-col gap-space-12">
          <h2 className="font-miletus text-heading-h5 text-brand-1">
            Featured Models
          </h2>
          <div className="grid gap-space-12 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {featuredModels.map((model) => (
              <ConsoleModelCard key={model.id} model={model} />
            ))}
            <ConsoleRecommendModelCard />
          </div>
        </section>
      ) : null}

      {sections.map((section) => (
        <section key={section.key} className="flex flex-col gap-space-12">
          <div className="flex items-center justify-between px-space-16 pt-space-12">
            <div className="flex items-center gap-space-8">
              <h2 className="font-miletus text-paragraph-16 text-[var(--text-1)]">
                {section.title}
              </h2>
              <span className="font-miletus text-paragraph-12 text-[var(--text-4)]">
                {section.models.length}
              </span>
            </div>
            {getSectionViewAllVisibilityClassNames(section.models.length).map(
              (visibilityClassName) => (
                <button
                  key={visibilityClassName}
                  type="button"
                  onClick={() => onViewAllSection?.(section.modality)}
                  className={`${visibilityClassName} cursor-pointer font-miletus text-paragraph-14 text-[var(--text-3)] underline underline-offset-2 transition-colors duration-200 hover:text-[var(--text-1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0`}
                >
                  View all
                </button>
              ),
            )}
          </div>
          <div className="grid gap-space-12 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {section.models.slice(0, 4).map((model, index) => (
              <div
                key={model.id}
                className={sectionModelVisibilityClassNames[index]}
              >
                <ConsoleModelCard model={model} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
