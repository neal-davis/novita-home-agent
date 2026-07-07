"use client";

import Voice from "@/app/components/demos/Voice/Voice";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

const AUDIO_SRC = "/product/audio/speech2txt/input-En.mp3";
const DETECTED_LANGUAGE = "English";
const TRANSCRIPTION =
  "You're watching The Legal Breakdown. So, Glenn, I want to work out here how the D.C. trial could still happen before the election. Let's do a bit of a thought experiment here. So first, let's discuss the possibility that the Supreme Court rules on the immunity issue. What is the timeline for that specifically?";
const DESC_TITLE = "Real-time and Accurate Speech-to-Text";
const DESC_DETAIL =
  "Unleash the potential of artificial intelligence to extract natural and accurate text from audio.";
// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getSections() {
  return [
    {
      title: "Real-time Transcription",
      detail: "Swiftly convert spoken words into text in real-time.",
    },
    {
      title: "High Accuracy",
      detail:
        "Ensure precise recognition of speech, delivering accurate transcriptions.",
    },
    {
      title: "Multilingual Support",
      detail:
        "Recognize and transcribe various languages and dialects with precision.",
    },
  ];
}

export default function Case() {
  useI18nSubscription();
  const sections = getSections();
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>{DESC_TITLE}</h2>
      <div className={`font-p text-center`}>{DESC_DETAIL}</div>
      <CaseWrapper
        funcInfo={FUNCS.SPEECH2TXT}
        renderCase={(props) => {
          return (
            <Voice
              {...props}
              subType="transcription"
              audioSrc={AUDIO_SRC}
              detectedLanguage={DETECTED_LANGUAGE}
              transcription={TRANSCRIPTION}
              sections={sections}
            />
          );
        }}
      />
    </div>
  );
}
