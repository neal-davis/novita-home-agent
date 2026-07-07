"use client";

import Voice from "@/app/components/demos/Voice/Voice";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { useI18nSubscription } from "@/i18n/provider";

const AUDIO_SRC = "/product/audio/speech2txt-translate/input-Japanese.mp3";
const DETECTED_LANGUAGE = "Japanese";
const TRANSCRIPTION =
  "10歳未満の男の子に生体ドナーから提供された肺や肝臓の一部を同時に移植する手術が世界で初めて行われました。";
const TRANSLATE = "English";
const TRANSLATION =
  "The world's first surgery to simultaneously transplant portions of the lungs and liver from a living donor to a boy under 10 years old has been successfully performed.";
const DESC_TITLE = "Effortless Multilingual Communication.";
const DESC_DETAIL =
  "Convert and translate spoken words seamlessly with precision and efficiency using Speech2Txt-Translation.";
// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getSections() {
  return [
    {
      title: "Elevate voice translation to new heights.",
      detail:
        "Building upon our exceptional Speech-to-Text technology, we introduce the Speech-to-Text Translation service. Instantly transcribe and translate, breaking language barriers for seamless communication.",
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
        funcInfo={FUNCS.SPEECH2_TXT_TRANSLATION}
        renderCase={(props) => {
          return (
            <Voice
              {...props}
              subType="translation"
              audioSrc={AUDIO_SRC}
              detectedLanguage={DETECTED_LANGUAGE}
              transcription={TRANSCRIPTION}
              translate={TRANSLATE}
              translation={TRANSLATION}
              sections={sections}
            />
          );
        }}
      />
    </div>
  );
}
