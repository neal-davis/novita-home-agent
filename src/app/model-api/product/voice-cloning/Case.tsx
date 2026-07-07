"use client";

import Voice from "@/app/components/demos/Voice/Voice";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

const DESC_TITLE = "Professional Voice Cloning:The Best Voice Cloning API";
const DESC_DETAIL =
  "Generate your AI voice replica using only a few minutes of audio. ";
// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getSections() {
  return [
    {
      title: "Perfect Replication",
      detail:
        "Generate your AI voice replica using only a few minutes of audio. ",
    },
    {
      title: "Support for multiple languages",
      detail:
        "Effortlessly transition between our extensive selection of 20+ supported languages using the replicated voice.",
    },
  ];
}

// Must stay a function: see getSections above.
function getGuideInfo() {
  return {
    title: "AI Cloning Tips",
    sections: [
      {
        title: "1. Provide enough data",
        detail:
          "Ensure a sufficient amount of audio content for precise cloning. We recommend a minimum of 30 minutes, while 3 hours is considered optimal for achieving high-fidelity results.",
      },
      {
        title: "2. Keep it clean",
        detail:
          "Ensure your training data comprises pristine audio files featuring a solitary speaker, devoid of any background noise, music, or additional effects.",
      },
      {
        title: "3. Match your samples",
        detail:
          "If you upload multiple audio files, match their recording conditions - differences in reverb, distance from the microphone etc. may pollute the output.",
      },
    ],
  };
}

export default function Case() {
  useI18nSubscription();
  const sections = getSections();
  const guideInfo = getGuideInfo();
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>{DESC_TITLE}</h2>
      <div className={`font-p text-center`}>{DESC_DETAIL}</div>
      <CaseWrapper
        funcInfo={FUNCS.VOICE_CLONING}
        renderCase={(props) => {
          return (
            <Voice
              {...props}
              subType="voice_cloning_profession"
              sections={sections}
              guideInfo={guideInfo}
            />
          );
        }}
      />
    </div>
  );
}
