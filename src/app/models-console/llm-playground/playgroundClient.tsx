"use client";

import { ReactNode } from "react";
import {
  CombinedProvider,
  PlaygroundConfig,
} from "./providers/CombinedProvider";
import { useModel } from "./providers/ModelProvider";
import { PlaygroundSidebar } from "./components/layout/PlaygroundSidebar";
import { PlaygroundMainContent } from "./components/layout/PlaygroundMainContent";
import { PlaygroundHeader } from "./components/layout/PlaygroundHeader";
import { Loader2 } from "lucide-react";
import { PLAYGROUND_HEADER_HEIGHT } from "./constants";

interface PlaygroundSlots {
  header?: ReactNode;
  sidebar?: ReactNode;
  mainContent?: ReactNode;
  loadingFallback?: ReactNode;
}

interface PlaygroundClientProps extends PlaygroundConfig {
  slots?: PlaygroundSlots;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-common-dark-2">Loading models...</p>
      </div>
    </div>
  );
}

function PlaygroundContent({ slots }: { slots?: PlaygroundSlots }) {
  const { isLoadingModels } = useModel();

  if (isLoadingModels) {
    return slots?.loadingFallback ? (
      <>{slots.loadingFallback}</>
    ) : (
      <LoadingFallback />
    );
  }

  const HeaderComponent = slots?.header ?? <PlaygroundHeader />;
  const SidebarComponent = slots?.sidebar ?? <PlaygroundSidebar />;
  const MainContentComponent = slots?.mainContent ?? <PlaygroundMainContent />;

  return (
    <div className="flex h-full">
      {SidebarComponent}
      <div className="flex flex-col flex-1">
        {HeaderComponent}
        <div
          className="flex flex-1"
          style={{
            height: `calc(100% - ${PLAYGROUND_HEADER_HEIGHT}px)`,
          }}
        >
          {MainContentComponent}
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundClient({
  slots,
  ...config
}: PlaygroundClientProps) {
  return (
    <CombinedProvider {...config}>
      <PlaygroundContent slots={slots} />
    </CombinedProvider>
  );
}
