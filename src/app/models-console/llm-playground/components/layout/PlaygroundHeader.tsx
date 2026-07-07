import { ModelSelector } from "../model-selector/ModelSelector";
import { useModel } from "../../providers/ModelProvider";
import { useChatConfig } from "../../providers/ChatConfigProvider";
import { useUIState } from "../../providers/UIStateProvider";
import CopyBtn from "@/components/ui/standard/code-copy-btn";
import { Button } from "@/components/ui/button";
import { CodeXml, MoveUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { CodeDrawer } from "../code-drawer/CodeDrawer";
import {
  PLAYGROUND_HEADER_HEIGHT,
  PLAYGROUND_MODEL_SELECTOR_WIDTH,
} from "../../constants";
import { MaxContainerWrapper } from "./MaxContainerWrappr";
import { ModelLabelMap } from "@/types/models";
import PartnerTag from "@/app/components/ModelLibrary/PartnerTag";
import getCampaignConfig from "@/config/campaign";
import BuildMonthTag from "@/app/components/buildMonth";

export function PlaygroundHeader() {
  const campaign = getCampaignConfig();
  const { currentModel } = useModel();
  const { chatMode, chatConfig } = useChatConfig();
  const { codeDrawerOpen, setCodeDrawerOpen } = useUIState();
  const hfMirrorUrl = (currentModel as any)?.hf_mirror_url?.trim();
  const hasHfMirrorUrl = Boolean(hfMirrorUrl);

  const handleViewCode = () => {
    setCodeDrawerOpen(true);
  };

  const handleCreateEndpoint = () => {
    if (!currentModel?.id) {
      return;
    }

    const params = new URLSearchParams({
      modelId: currentModel.id,
    });
    const url = `/models-console/llm-dedicated-endpoints?${params.toString()}`;
    window.open(url, "_blank");
  };

  const isPartner = currentModel?.labels?.some(
    (label) =>
      label.key === ModelLabelMap.Partner &&
      label.value === ModelLabelMap.Partner,
  );

  return (
    <>
      <div
        className="flex items-center justify-between w-full shrink-0 border-b border-common-gray-2"
        style={{ height: `${PLAYGROUND_HEADER_HEIGHT}px` }}
      >
        <MaxContainerWrapper className="flex items-center justify-between flex-wrap gap-1">
          <>
            <div className="flex items-center gap-4">
              {/* PLAYGROUND_SIDEBAR_WIDTH - 24 PADDING_X */}
              <div
                className="shrink-0"
                style={{
                  minWidth: `${PLAYGROUND_MODEL_SELECTOR_WIDTH}px`,
                  maxWidth: `${PLAYGROUND_MODEL_SELECTOR_WIDTH + 60}px`,
                }}
              >
                <ModelSelector />
              </div>
              <div className="flex flex-wrap">
                <div className="flex items-center gap-2">
                  {campaign?.enabled &&
                    currentModel?.input_pricing?.originPricePerM !==
                      currentModel?.input_pricing?.pricePerM && (
                      <BuildMonthTag
                        type="common"
                        text={campaign?.modelPageDiscountLabel || ""}
                      />
                    )}
                  {isPartner && (
                    <PartnerTag
                      className="h-5 leading-5 text-black"
                      size={14}
                    />
                  )}
                  <div className="flex items-center gap-2 text-sm bg-common-gray-3 h-5 px-1 rounded-sm">
                    {currentModel?.id}
                    <CopyBtn content={currentModel?.id || ""} size={14} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild className="px-2 h-[28px]" size="sm">
                <Link
                  className="flex items-center gap-1"
                  href={`/models-console/model-detail/${currentModel?.linkPath}`}
                >
                  <MoveUpRight className="w-4 h-4" />
                  Model Detail
                </Link>
              </Button>
              {hasHfMirrorUrl && (
                <Button
                  variant="outline"
                  onClick={handleCreateEndpoint}
                  className="px-2 h-[28px]"
                  size="sm"
                >
                  <div className="flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Create Endpoint
                  </div>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleViewCode}
                className="px-2 h-[28px]"
                size="sm"
              >
                <div className="flex items-center gap-1">
                  <CodeXml className="w-4 h-4" />
                  View Code
                </div>
              </Button>
            </div>
          </>
        </MaxContainerWrapper>
      </div>
      <CodeDrawer
        open={codeDrawerOpen}
        onOpenChange={setCodeDrawerOpen}
        model={currentModel}
        chatParams={chatConfig}
        chatMode={chatMode}
      />
    </>
  );
}
