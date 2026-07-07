"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import Loading from "../../Loading/Loading";
import { CLICK_BTN_IDs } from "../../analytics/constants";

export default function AIChatMenu() {
  // const [currentAnimation, setCurrentAnimation] = useState("");
  // const [animationKey, setAnimationKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // const animations = ["animate__flip", "animate__tada"];

  // useEffect(() => {
  //   const startAnimationCycle = () => {
  //     let currentIndex = 0;

  //     const runAnimation = () => {
  //       setCurrentAnimation(animations[currentIndex]);
  //       setAnimationKey((prev) => prev + 1);

  //       setTimeout(() => {
  //         setCurrentAnimation("");
  //       }, 1000);

  //       currentIndex = (currentIndex + 1) % animations.length;
  //     };

  //     runAnimation();

  //     const interval = setInterval(runAnimation, 4000);

  //     return interval;
  //   };

  //   const interval = startAnimationCycle();

  //   return () => clearInterval(interval);
  // }, []);

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setIsIframeLoading(true);
    }
  };

  return (
    <div className="mr-3">
      <Dialog onOpenChange={handleDialogChange}>
        <DialogTrigger asChild id={CLICK_BTN_IDs.HEADER_LINK_IDs.ASK_AI}>
          <span
            // key={animationKey}
            className={`cursor-pointer font-subtle animate__animated bg-gradient-to-r from-[var(--brand-0)] via-[var(--cyan-2)] to-[var(--purple-2)] bg-clip-text text-transparent`}
          >
            Ask AI
          </span>
        </DialogTrigger>
        <DialogContent
          className="!max-w-80vw min-w-[800px] !p-0 !gap-0 overflow-hidden"
          closeable={false}
        >
          <div className="h-[650px] relative">
            {isIframeLoading && (
              <Loading
                text="Loading AI assistant..."
                desc="Please wait a moment"
              />
            )}
            <iframe
              src="https://www.chatbase.co/chatbot-iframe/jwZvlXD0czUBwa6s-fDwl"
              className="w-full h-full"
              onLoad={handleIframeLoad}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
