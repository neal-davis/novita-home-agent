import { DemoProps } from "../DemoWrapper";
import DemoWrapper from "../components/DemoWrapper/DemoWrapper";
import VoiceBox from "@/app/components/voiceBox/VoiceBox";
import AudioPlayer from "@/app/components/audioPlayer/AudioPlayer";
import styles from "./Voice.module.css";

type ISection = {
  title: string;
  detail: string;
};
type IVoiceInfo = {
  src: string;
  title: string;
  tags?: string[];
  desc?: string;
  initVolume?: number;
};
type DescInfoProps = {
  sections: ISection[];
};
type ResultContentProps = {
  subType:
    | "transcription"
    | "translation"
    | "txt2speech"
    | "voice_cloning"
    | "voice_cloning_profession";
  audioSrc?: string;
  detectedLanguage?: string;
  transcription?: string;
  translate?: string;
  translation?: string;
  inputText?: string;
  voiceInfos?: IVoiceInfo[];
  guideInfo?: {
    title: string;
    sections: ISection[];
  };
  guidePreview?: {
    title: string;
    origin: IVoiceInfo;
    ai: IVoiceInfo;
  };
};
type IProps = DescInfoProps & ResultContentProps;

function DescInfo({ sections }: DescInfoProps) {
  return (
    <article>
      {(sections || []).map((obj, key) => (
        <section key={key}>
          <h2 className="font-h4 mb-2">{obj.title}</h2>
          <p className="font-h5 mb-[32px]">{obj.detail}</p>
        </section>
      ))}
    </article>
  );
}

function ResultContent({
  subType,
  audioSrc,
  detectedLanguage,
  transcription,
  translate,
  translation,
  inputText,
  voiceInfos,
  guideInfo,
  guidePreview,
}: ResultContentProps) {
  return (
    <div className={styles.contentContainer}>
      {["transcription", "translation"].includes(subType) && (
        <div className={styles.input}>
          <h1 className="font-h5 mb-4">Input</h1>
          {audioSrc && <AudioPlayer src={audioSrc} />}
        </div>
      )}
      {subType === "txt2speech" && (
        <div className={styles.input}>
          <h1 className="font-h5 mb-4">Input</h1>
          <p>{inputText}</p>
        </div>
      )}
      {["voice_cloning", "voice_cloning_profession"].includes(subType) && (
        <div className={styles.input}>
          <h1 className="font-h5 mb-4">{guideInfo?.title}</h1>
          {(guideInfo?.sections || []).map((sec, index) => (
            <section key={index} className={styles.guideSection}>
              <h2>{sec.title}</h2>
              <p>{sec.detail}</p>
            </section>
          ))}
        </div>
      )}

      {subType === "transcription" && (
        <div className={styles.output}>
          <h1 className="font-h5 mb-4">Output</h1>
          <p className={styles.content}>Detected_language</p>
          <div className={styles.textArea}>{detectedLanguage}</div>
          <p className={styles.content}>Transcription</p>
          <div className={styles.textArea}>{transcription}</div>
        </div>
      )}
      {subType === "translation" && (
        <div className={styles.output}>
          <h1 className="font-h5 mb-4">Output</h1>
          <div className={styles.languageInfo}>
            <div>
              <label>Detected_language</label>
              <span>{detectedLanguage}</span>
            </div>
            <div>
              <label>Translate</label>
              <span>{translate}</span>
            </div>
          </div>
          <p className={styles.content}>Translation</p>
          <div className={styles.textArea}>{translation}</div>
          <p className={styles.content}>Transcription</p>
          <div className={styles.textArea}>{transcription}</div>
        </div>
      )}
      {subType === "txt2speech" && (
        <div className={styles.output}>
          <h1 className="font-h5 mb-4">Output</h1>
          {(voiceInfos || []).map((info, index) => (
            <VoiceBox
              key={index}
              src={info.src}
              title={info.title}
              tags={info.tags}
              description={info.desc}
              style={{ marginTop: index === 0 ? 0 : 20 }}
            />
          ))}
        </div>
      )}
      {["voice_cloning", "voice_cloning_profession"].includes(subType) &&
        guidePreview && (
          <div className={styles.output}>
            <h1 className="font-h5 mb-4">{guidePreview?.title}</h1>
            <div className={styles.preview}>
              <VoiceBox {...guidePreview.origin} />
              <VoiceBox {...guidePreview.ai} />
            </div>
          </div>
        )}
    </div>
  );
}

export default function Voice(props: DemoProps & IProps) {
  const {
    rootPage,
    funcInfo,
    subType,
    translate,
    translation,
    audioSrc,
    detectedLanguage,
    transcription,
    sections,
    inputText,
    voiceInfos,
    guideInfo,
    guidePreview,
  } = props;
  return (
    <DemoWrapper
      rootPage={rootPage}
      funcInfo={funcInfo}
      formContent={DescInfo({ sections })}
      resultContent={ResultContent({
        subType,
        translate,
        translation,
        audioSrc,
        detectedLanguage,
        transcription,
        inputText,
        voiceInfos,
        guideInfo,
        guidePreview,
      })}
      formWidth={530}
      resultContentNoPadding={true}
    />
  );
}
