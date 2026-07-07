"use client";
import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MultimodalTaskResult } from "@/types/multimodal-playground";
import {
  getResultType,
  extractImages,
  extractVideos,
  extractAudios,
  extractTexts,
} from "../../utils/result";
import { downloadMedia } from "../../utils/download";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { PreviewContent } from "./PreviewContent";
import { JSONContent } from "./JSONContent";
import { cn } from "@/lib/utils";
import styles from "./ResultPanel.module.scss";
interface ResultPanelProps {
  pageType?: "web" | "console";
  category: "image_gen" | "audio_gen" | "video_gen";
  status: "idle" | "creating" | "polling" | "success" | "error";
  result: MultimodalTaskResult | null;
  error?: string | null;
  taskId?: string | null;
  traceId?: string;
  onCancel?: () => void;
}
export const ResultPanel = ({
  pageType,
  category,
  status,
  result,
  error,
  taskId,
  traceId,
  onCancel,
}: ResultPanelProps) => {
  const [viewMode, setViewMode] = useState<"preview" | "json">("preview");
  // Memoize extracted media to prevent re-extraction on view mode change
  const { images, videos, audios, texts, resultType } = useMemo(() => {
    const isSuccess = status === "success" && result;
    const isExample = status === "idle" && result;
    return {
      images: isSuccess || isExample ? extractImages(result, category) : [],
      videos: isSuccess || isExample ? extractVideos(result, category) : [],
      audios: isSuccess || isExample ? extractAudios(result, category) : [],
      texts: isSuccess || isExample ? extractTexts(result, category) : [],
      resultType:
        isSuccess || isExample ? getResultType(result, category) : null,
    };
  }, [status, result, category]);
  // Get all media URLs for download
  const mediaUrls = useMemo(() => {
    if (resultType === "image") return images;
    if (resultType === "video") return videos;
    if (resultType === "audio") return audios;
    return [];
  }, [resultType, images, videos, audios]);
  // Handle batch download
  const handleDownloadAll = async () => {
    for (let index = 0; index < mediaUrls.length; index++) {
      const url = mediaUrls[index];
      try {
        await downloadMedia(url, index);
        // Add delay between downloads to prevent browser blocking
        if (index < mediaUrls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Failed to download media ${index + 1}:`, error);
      }
    }
  };
  const renderContent = () => {
    if (status === "idle" && !result) {
      return <EmptyState />;
    }
    if (status === "creating" || status === "polling") {
      return (
        <LoadingState status={status} taskId={taskId} onCancel={onCancel} />
      );
    }
    if (status === "error") {
      return <ErrorState error={error} traceId={traceId} />;
    }
    if ((status === "success" || status === "idle") && result) {
      return (
        <>
          <div style={{ display: viewMode === "preview" ? "block" : "none" }}>
            <PreviewContent
              images={images}
              videos={videos}
              audios={audios}
              texts={texts}
              resultType={resultType as "image" | "video" | "audio" | null}
            />
          </div>
          <div style={{ display: viewMode === "json" ? "block" : "none" }}>
            <JSONContent result={result} />
          </div>
        </>
      );
    }
    return null;
  };
  return (
    <div
      className={cn(
        styles.result_panel,
        pageType === "web" ? styles.web_result_panel : "",
      )}
    >
      {/* Status bar */}
      <div className={styles.status_bar}>
        <StatusBadge status={status} result={result} category={category} />
        {(status === "success" || status === "idle") && result && (
          <div className={styles.controls_group}>
            {mediaUrls.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAll}
                className="h-6 px-2 text-xs border-[var(--gray-1)] text-[var(--dark-1)] rounded"
              >
                <Download size={14} className="mr-1" />
                {"Download"}
              </Button>
            )}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="h-6 p-1 bg-[var(--gray-3)] rounded">
                <TabsTrigger
                  value="preview"
                  className="px-3 py-0.5 text-xs h-5 rounded-[2px] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--dark-2)]"
                >
                  {"Preview"}
                </TabsTrigger>
                <TabsTrigger
                  value="json"
                  className="px-3 py-0.5 text-xs h-5 rounded-[2px] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--dark-2)]"
                >
                  {"JSON result"}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content_area}>{renderContent()}</div>
    </div>
  );
};
