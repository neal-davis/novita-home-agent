import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import MDDocs from "@/components/ui/standard/md-docs";
import { ParametersPanel } from "../ParametersPanel";
import { ResultPanel } from "../ResultPanel/index";
import { ApiInfo } from "../ApiInfo";
import { ExamplesGallery } from "../ExamplesGallery";
import { CopyButton } from "../CopyButton";
import { convertFlatToNested } from "../../utils/result";
import { TaskState } from "../../hooks/useTaskExecution";
import { cn } from "@/lib/utils";
import styles from "./index.module.scss";
interface TabsSectionProps {
  pageType?: "web" | "console";
  activeTab: string;
  onTabChange: (value: string) => void;
  modelCategory: "image_gen" | "audio_gen" | "video_gen";
  modelDescription: string;
  requestSchema: Record<string, any>;
  requiredFields: string[];
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  onFieldChange: (field: string, value: any) => void;
  onReset: () => void;
  onRun: () => void;
  taskState: TaskState;
  endpoint: string;
  isAsyncTask: boolean;
  isLoggedIn: boolean;
  examples: {
    request: Record<string, any>;
    response: Record<string, any>;
  }[];
  markdown: string;
  onExampleSelect: (example: {
    request: Record<string, any>;
    response: Record<string, any>;
  }) => void;
  onCancelTask?: () => void;
  modelName?: string;
  modelHeader?: React.ReactNode;
}
// Scroll behavior constants
const SCROLL_OFFSET = 50; // Offset to prevent content from being hidden behind fixed headers
const SCROLL_ANIMATION_DURATION = 800; // Duration in ms for smooth scroll animation
export const TabsSection = ({
  pageType,
  activeTab,
  onTabChange,
  modelCategory,
  modelDescription,
  requestSchema,
  requiredFields,
  formData,
  errors,
  onFieldChange,
  onReset,
  onRun,
  taskState,
  endpoint,
  isAsyncTask,
  isLoggedIn,
  examples,
  markdown,
  onExampleSelect,
  onCancelTask,
  modelName,
  modelHeader,
}: TabsSectionProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const headerRef = useRef<HTMLDivElement>(null);
  const modelHeaderRef = useRef<HTMLDivElement>(null);
  const [isProgrammaticScrolling, setIsProgrammaticScrolling] = useState(false);
  const [isNearSnapPoint, setIsNearSnapPoint] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunning =
    taskState.status === "creating" || taskState.status === "polling";
  const tabs = useMemo(() => {
    const allTabs = [
      {
        value: "playground",
        label: "Playground",
      },
      ...(examples && Array.isArray(examples) && examples.length > 0
        ? [
            {
              value: "examples",
              label: "Examples",
            },
          ]
        : []),
      {
        value: "json",
        label: "Request JSON",
      },
      {
        value: "bash",
        label: "API",
      },
      ...(markdown
        ? [
            {
              value: "readme",
              label: "Model details",
            },
          ]
        : []),
    ];
    return allTabs;
  }, [examples, markdown]);
  const handleTabClick = (tabValue: string) => {
    const targetSection = sectionRefs.current[tabValue];
    const contentElement = contentRef.current;
    if (!targetSection || !contentElement) return;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    setIsProgrammaticScrolling(true);
    const targetScrollPosition = Math.max(
      0,
      targetSection.offsetTop - SCROLL_OFFSET,
    );
    contentElement.scrollTo({
      top: targetScrollPosition,
      behavior: "smooth",
    });
    scrollTimeoutRef.current = setTimeout(() => {
      onTabChange(tabValue);
    }, 50);
    // Reset flag after animation completes
    scrollTimeoutRef.current = setTimeout(() => {
      setIsProgrammaticScrolling(false);
    }, SCROLL_ANIMATION_DURATION);
  };
  const findVisibleSection = useCallback(
    (scrollPosition: number): string | null => {
      // Iterate from bottom to top to find the first section in view
      for (let i = tabs.length - 1; i >= 0; i--) {
        const tab = tabs[i];
        const section = sectionRefs.current[tab.value];
        if (section && section.offsetTop <= scrollPosition) {
          return tab.value;
        }
      }
      return null;
    },
    [tabs],
  );
  useEffect(() => {
    const contentElement = contentRef.current;
    const modelHeaderElement = modelHeaderRef.current;
    if (!contentElement) return;
    const handleScroll = () => {
      if (isProgrammaticScrolling) return;
      const currentScrollPosition = contentElement.scrollTop + SCROLL_OFFSET;
      const visibleSection = findVisibleSection(currentScrollPosition);
      if (visibleSection && visibleSection !== activeTab) {
        onTabChange(visibleSection);
      }
      // Opacity fade effect when close to sticky position
      if (modelHeaderElement && modelHeader) {
        const modelHeaderHeight = modelHeaderElement.offsetHeight;
        const scrollTop = contentElement.scrollTop;
        const fadeThreshold = 80; // Distance to trigger fade effect
        // Update near snap point state for opacity effect
        const isNear =
          (scrollTop > modelHeaderHeight - fadeThreshold &&
            scrollTop < modelHeaderHeight) ||
          (scrollTop > 0 && scrollTop < fadeThreshold);
        setIsNearSnapPoint(isNear);
      }
    };
    contentElement.addEventListener("scroll", handleScroll);
    return () => contentElement.removeEventListener("scroll", handleScroll);
  }, [
    activeTab,
    onTabChange,
    isProgrammaticScrolling,
    findVisibleSection,
    modelHeader,
  ]);
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  const renderTabButton = (tab: { value: string; label: string }) => (
    <button
      key={tab.value}
      className={`${styles.tab_trigger} ${activeTab === tab.value ? styles.active : ""}`}
      onClick={() => handleTabClick(tab.value)}
      type="button"
    >
      {tab.label}
    </button>
  );
  const registerSectionRef = (tabValue: string) => (el: HTMLElement | null) => {
    sectionRefs.current[tabValue] = el;
  };
  const nestedFormData = convertFlatToNested(formData);
  return (
    <div className={styles.tabs_container}>
      {/* Scrollable Content Area */}
      <div ref={contentRef} className={styles.content}>
        {/* Model Header (optional) */}
        {modelHeader && (
          <div
            ref={modelHeaderRef}
            className={`${styles.model_header_section} ${isNearSnapPoint ? styles.near_snap : ""}`}
          >
            {modelHeader}
          </div>
        )}

        {/* Sticky Tab Navigation */}
        <div
          ref={headerRef}
          className={`${styles.tabs_header} ${isNearSnapPoint ? styles.near_snap : ""} ${pageType === "web" ? "max_width_container" : styles.tabs_header_console}`}
        >
          <div className={styles.tabs_list}>{tabs.map(renderTabButton)}</div>
        </div>

        {/* Playground Section */}
        <section
          ref={registerSectionRef("playground")}
          id="playground"
          className={`${styles.section} ${pageType === "web" ? "max_width_container" : 0}`}
        >
          <div className={styles.playground_layout}>
            <div className={styles.left_panel}>
              <ParametersPanel
                schema={requestSchema}
                requiredFields={requiredFields}
                formData={formData}
                errors={errors}
                onChange={onFieldChange}
                onReset={onReset}
                onRun={onRun}
                isRunning={isRunning}
                isLoggedIn={isLoggedIn}
              />
            </div>

            <div className={styles.right_panel}>
              <ResultPanel
                pageType={pageType}
                category={modelCategory}
                status={taskState.status}
                result={taskState.result}
                error={taskState.error}
                taskId={taskState.taskId}
                traceId={taskState.traceId}
                onCancel={onCancelTask}
              />
            </div>
          </div>
        </section>

        {/* Examples Section */}
        {examples && Array.isArray(examples) && examples.length > 0 && (
          <section
            ref={registerSectionRef("examples")}
            id="examples"
            className={`${styles.section} ${pageType === "web" ? "max_width_container" : 0}`}
          >
            <div
              className={cn(
                styles.examples_tab,
                pageType === "web" ? styles.web_examples_tab : "",
              )}
            >
              <p className={styles.section_title}>{"Examples"}</p>
              <ExamplesGallery
                examples={examples}
                category={modelCategory}
                onExampleClick={onExampleSelect}
              />
            </div>
          </section>
        )}

        {/* JSON Section */}
        <section
          ref={registerSectionRef("json")}
          id="json"
          className={`${styles.section} ${pageType === "web" ? "max_width_container" : 0}`}
        >
          <div
            className={cn(
              styles.json_tab,
              pageType === "web" ? styles.web_json_tab : "",
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <p className={styles.section_title}>{"Request JSON"}</p>
              <CopyButton content={JSON.stringify(nestedFormData, null, 2)} />
            </div>
            <pre>{JSON.stringify(nestedFormData, null, 2)}</pre>
          </div>
        </section>

        {/* Bash Section */}
        <section
          ref={registerSectionRef("bash")}
          id="bash"
          className={`${styles.section} ${pageType === "web" ? "max_width_container" : 0}`}
        >
          <div
            className={cn(
              styles.bash_tab,
              pageType === "web" ? styles.web_bash_tab : "",
            )}
          >
            <p className={styles.section_title}>{"API"}</p>
            <ApiInfo
              endpoint={endpoint}
              isAsyncTask={isAsyncTask}
              formData={nestedFormData}
            />
          </div>
        </section>

        {/* README Section */}
        {markdown && (
          <section
            ref={registerSectionRef("readme")}
            id="readme"
            className={`${styles.section} ${pageType === "web" ? "max_width_container" : 0}`}
          >
            <div
              className={cn(
                styles.readme_tab,
                pageType === "web" ? styles.web_readme_tab : "",
              )}
            >
              <MDDocs content={markdown} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
