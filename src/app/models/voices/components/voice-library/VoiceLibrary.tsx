import AudioItem from "./AudioItem";
import styles from "./VoiceLibrary.module.scss";
import Head from "next/head";

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getData() {
  return [
    {
      title: "Character Voices",
      desc: "Perfect for chatbots、creative videos、Gaming",
      url: "/product/audio/txt2speech/voice_preview_john.wav",
      voiceId: "John",
    },
    {
      title: "Narrative Voices",
      desc: "Ideal for audiobooks, explainer videos and documentary videos",
      url: "/product/audio/txt2speech/voice_preview_james.wav",
      voiceId: "James",
    },
    {
      title: "Local Accents",
      desc: "Localize your enterainment videos, adverts and audiobooks",
      url: "/product/audio/txt2speech/voice_prieview_emily.wav",
      voiceId: "Emily",
    },
    {
      title: "Explainer Voices",
      desc: "Ideal for explainer videos, podcasts and audiobooks",
      url: "/product/audio/txt2speech/voice_preview_michael.wav",
      voiceId: "Michael",
    },
    {
      title: "Emotions",
      desc: "Ideal for gaming, creative videos and ads",
      url: "/product/audio/txt2speech/voice_preview_olivia.wav",
      voiceId: "Olivia",
    },
    {
      title: "Training Voices",
      desc: "Suitable for training videos, L&D and E-learning",
      url: "/product/audio/txt2speech/voice_preview_sarah.wav",
      voiceId: "Sarah",
    },
  ];
}

export default function VoiceLibrary() {
  const data = getData();
  return (
    <div className={`${styles.page_wrap} max_width_container text-center`}>
      <Head>
        <link rel="prefetch" href="/product/txt2speech/box.png" />
        <link rel="prefetch" href="/product/txt2speech/box-hover.png" />
      </Head>
      <div className="px-web">
        <h3 className="font-h3 mb-[8px]">
          Explore the Best Library of AI Voices
        </h3>
        <div className="font-body text-[var(--dark-2)] mb-[56px]">
          From character voicing and audiobook narration to educational tools
          and interactive experiences, the Novita AI Voice Library offers a wide
          selection of voices tailored to your specific needs.
        </div>
        <div className="flex flex-wrap gap-5 justify-center">
          {data.map((one) => (
            <AudioItem
              audioUrl={one.url}
              key={one.title}
              title={one.title}
              desc={one.desc}
              voiceId={one.voiceId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
