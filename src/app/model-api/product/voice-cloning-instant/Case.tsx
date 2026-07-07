"use client";

import Voice from "@/app/components/demos/Voice/Voice";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

const DESC_TITLE =
  "Instant voice cloning: Minimize effort, maximize your productivity";
const DESC_DETAIL =
  "Generate your AI voice replica using only a few minutes of audio.";
// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getSections() {
  return [
    {
      title: "Clone Your Voice in Minutes",
      detail:
        "Efficiently generate a reliable voice clone from short audio samples with Instant Voice Cloning for immediate results.Achieve exceptional accuracy across 20+ languages.",
    },
  ];
}

// Must stay a function: see getSections above.
function getGuideInfo() {
  return {
    title: "How to Clone Your Voice",
    sections: [
      {
        title: "1. Upload samples",
        detail:
          "Clone a voice from a clean sample recording. Samples should contain 1 speaker and be over 1 minute long.",
      },
      {
        title: "2. Generate audio",
        detail: "Get instant results with instant voice cloning.",
      },
    ],
  };
}

// Must stay a function: see getSections above.
function getGuidePreview() {
  return {
    title: "Use your voice for text to speech",
    origin: {
      src: "/product/audio/voice-cloning/original.mp3",
      title: "Original",
      tags: ["Biden"],
      initVolume: 0.2,
    },
    ai: {
      src: "/product/audio/voice-cloning/ai.mp3",
      title: "AI",
      tags: ["Biden"],
    },
  };
}

export default function Case() {
  useI18nSubscription();
  const sections = getSections();
  const guideInfo = getGuideInfo();
  const guidePreview = getGuidePreview();
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>{DESC_TITLE}</h2>
      <div className={`font-p text-center`}>{DESC_DETAIL}</div>
      <CaseWrapper
        funcInfo={FUNCS.VOICE_CLONING_INSTANT}
        renderCase={(props) => {
          return (
            <Voice
              {...props}
              subType="voice_cloning"
              sections={sections}
              guideInfo={guideInfo}
              guidePreview={guidePreview}
            />
          );
        }}
      />
    </div>
  );
}
