"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Playground.module.scss";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { Button } from "@/components/ui/button";
import { apiProgress, txt2SpeechFetch } from "@/api/api";
import { useAppSelector } from "@/store";
import { LowBalanceModal } from "@/app/components/modals/Modals";
import { usePathname, useRouter } from "next/navigation";
import { DISCORD_INVITE_LINK, DOCS_URL } from "@/constants/urls";
import { message } from "@/components/ui/standard/notify";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
import { useI18nSubscription } from "@/i18n/provider";

type VoiceItem = {
  img: string;
  title: string;
  desc: string;
  voiceId: string;
  voiceSrc: string;
};

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getData(): VoiceItem[] {
  return [
    {
      img: "/product/txt2speech/vu_1.jpeg",
      title: "Sarah",
      desc: "British influencer",
      voiceId: "Sarah",
      voiceSrc: "/product/audio/txt2speech/voice_preview_sarah.wav",
    },
    {
      img: "/product/txt2speech/vu_2.jpeg",
      title: "Emily",
      desc: "American actor",
      voiceId: "Emily",
      voiceSrc: "/product/audio/txt2speech/voice_prieview_emily.wav",
    },
    {
      img: "/product/txt2speech/vu_3.jpeg",
      title: "Michael",
      desc: "American narrator",
      voiceId: "Michael",
      voiceSrc: "/product/audio/txt2speech/voice_preview_michael.wav",
    },
    {
      img: "/product/txt2speech/vu_4.jpeg",
      title: "John",
      desc: "Characters & Animation",
      voiceId: "John",
      voiceSrc: "/product/audio/txt2speech/voice_preview_john.wav",
    },
  ];
}

// Must stay a function: see getData above.
function getLanguageData() {
  return [
    {
      title: "English",
      icon: "/product/txt2speech/America.svg",
      param: "en-US",
      default:
        "Hey there, how's it going? I've been wondering how you've been. Hope life's been smooth and you're feeling fantastic!",
    },
    {
      title: "Chinese",
      icon: "/product/txt2speech/China.svg",
      param: "zh-CN",
      default: "你好，最近怎么样？一切都顺利吗？希望你一切都好，生活愉快。",
    },
    {
      title: "Japanese",
      icon: "/product/txt2speech/Japan.svg",
      param: "ja-JP",
      default:
        "こんにちは、元気ですか？最近、あなたのことを考えていたんだ。すべて順調ですか？生活が順調で、素晴らしい気分になっていることを願っています。",
    },
  ];
}

export default function Playground() {
  useI18nSubscription();
  const data = getData();
  const languageData = getLanguageData();
  const Limit = 500;
  const TTS_DOC = DOCS_URL.TXT2SPEECH;

  const user = useAppSelector((state) => state.user);
  const router = useRouter();
  const path = usePathname();

  const [voiceItem, setVoiceItem] = useState(data[0]);
  const [text, setText] = useState(languageData[0].default);
  const [language, setLanguage] = useState(languageData[0].param);
  const [outputVoice, setOutputVoice] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameIdRef = useRef<number>(0);

  const [paused, setPaused] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [loading, setLoading] = useState(false);

  const [lowModal, setLowModal] = useState(false);
  const keys = useSelectKeys();

  const handlePlaySwitch = useCallback(() => {
    const target = audioRef.current as HTMLAudioElement;
    if (target.paused) {
      target.play();
      setPaused(false);
    } else {
      target.pause();
      setPaused(true);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setPaused(true);
    setCurrentTime(0);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const target = audioRef.current as HTMLAudioElement;
    const newTime = target.currentTime;
    setCurrentTime(newTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const target = audioRef.current as HTMLAudioElement;
    setDuration(target.duration);
    if (outputVoice && paused) {
      target.play();
      setPaused(false);
    }
  }, [outputVoice, paused]);

  const generateSpeech = useCallback(() => {
    if (!user.email) {
      router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`);
      return;
    }
    setLoading(true);
    const key = keys[0];
    txt2SpeechFetch({
      language: language,
      voice_id: voiceItem.voiceId,
      texts: text,
      key: key,
    })
      .then((res) => {
        if (res && res.task_id) {
          timerRef.current = setInterval(() => {
            apiProgress(res.task_id, key).then((res) => {
              if (
                res.task?.status === "TASK_STATUS_QUEUED" ||
                res.task?.status === "TASK_STATUS_PROCESSING"
              ) {
                return;
              }
              // error
              if (res.task?.status === "TASK_STATUS_FAILED") {
                message.error("Failed to generate speech");
                return;
              }
              clearInterval(timerRef.current as NodeJS.Timeout);
              setLoading(false);
              if (res && Array.isArray(res.audios) && res.audios.length > 0) {
                const data = res.audios[0];
                setOutputVoice(data.audio_url);
              }
            });
          }, 1000);
        }
      })
      .catch((error) => {
        if (error == "failed to billing") {
          setLowModal(true);
        }
        setLoading(false);
      });
  }, [language, voiceItem, text, user, path, router, keys]);

  const cancelTask = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current as NodeJS.Timeout);
    }
  }, []);

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current as NodeJS.Timeout);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (text && voiceItem && language) {
      setOutputVoice("");
      setPaused(true);
      setCurrentTime(0);
      setDuration(0);
      setLoading(false);
      clearInterval(timerRef.current as NodeJS.Timeout);
    }
  }, [text, voiceItem, language]);

  // useEffect(() => {
  //   setLoading(true);
  // }, []);

  useEffect(() => {
    const handleUpdateProgress = () => {
      const target = audioRef.current as HTMLAudioElement;
      const newTime = target.currentTime;
      setCurrentTime(() => newTime);
      animationFrameIdRef.current = requestAnimationFrame(handleUpdateProgress);
    };

    const target = audioRef.current as HTMLAudioElement;
    if (target) {
      animationFrameIdRef.current = requestAnimationFrame(handleUpdateProgress);
    }

    return () => cancelAnimationFrame(animationFrameIdRef.current);
  }, []);

  const percent = () => (duration == 0 ? 0 : (currentTime / duration) * 100);

  return (
    <div className={`${styles.page_wrap} max_width_container`}>
      <div className={`${styles.main} px-web`}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <h1 className="font-h3 text-[var(--dark1)]">
              AI Text to Speech Online <br /> Captivating, Realistic, Voice
              Synthesis
            </h1>
            <div className={styles.voice_box}>
              <span className={`font-small-console ${styles.voice_box_label}`}>
                Select Voice
              </span>
              <div className={styles.voice_box_list}>
                {data.map((one) => (
                  <VoiceItem
                    key={one.title}
                    {...one}
                    onSelected={(title) => {
                      const item = data.find((k) => k.title == title);
                      item && setVoiceItem(item);
                    }}
                    isSelected={one.title == voiceItem.title}
                  />
                ))}
              </div>
            </div>
            <div className={"flex gap-5"}>
              <Button className={styles.btn} size="lg" asChild>
                <Link href={TTS_DOC} target="_blank">
                  <span>API Reference</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={styles.btn}
                asChild
              >
                <Link href={DISCORD_INVITE_LINK} target="_blank">
                  <span className="iconfont icon-discord mr-2"></span>
                  <span>Join Discord</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.output_wrap}>
              <div className={styles.textarea_wrap}>
                <textarea
                  value={text}
                  onChange={(e) => {
                    const v = e.target.value;
                    setText(v.slice(0, Limit));
                  }}
                />
                <div className={styles.textarea_footer}>
                  <div>
                    <button
                      className={styles.clear_btn}
                      onClick={() => {
                        setText("");
                      }}
                    >
                      CLEAR
                    </button>
                  </div>
                  <div>
                    {text.length} / {Limit}
                  </div>
                </div>
                <div className={styles.audio_wrap}>
                  <div
                    className={`${styles.g_btn} ${
                      loading ? styles.loading : ""
                    }`}
                    onClick={() => {
                      if (loading) return;
                      if (!outputVoice) {
                        generateSpeech();
                      } else {
                        handlePlaySwitch();
                      }
                    }}
                  >
                    {loading ? (
                      <Loader2 size={14} className={`animate-spin`} />
                    ) : paused ? (
                      <span
                        className="iconfont icon-play"
                        style={{ fontSize: 10, width: 9, height: 14 }}
                      />
                    ) : (
                      <span
                        className="iconfont icon-pause"
                        style={{ fontSize: 10, width: 9, height: 14 }}
                      />
                    )}
                  </div>
                  <div className={styles.timeline}>
                    <div className={styles.start}>
                      {formatTime(currentTime)}
                    </div>
                    <div className={styles.bar}>
                      <div className={styles.bar_line}>
                        <div
                          className={styles.bar_line_progress}
                          style={{
                            width: percent() + "%",
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className={styles.end}>{formatTime(duration)}</div>
                  </div>
                  <audio
                    ref={audioRef}
                    src={outputVoice}
                    onEnded={handleAudioEnded}
                    className={styles.audio_hidden}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                  ></audio>
                </div>
              </div>

              <div className={styles.language_wrap}>
                <div className={styles.language_title}>
                  Click to generate speech in
                </div>
                <div className={styles.language_select}>
                  {languageData.map((one) => (
                    <div
                      key={one.param}
                      className={
                        one.param == language
                          ? `${styles.language_item} ${styles.language_active}`
                          : styles.language_item
                      }
                      onClick={() => {
                        if (language === one.param) return;
                        cancelTask();
                        setLanguage(one.param);
                        setText(one.default);
                      }}
                    >
                      {one.param == language && (
                        <div className={styles.check_tag}>
                          <Check
                            size={8}
                            className="absolute top-[1px] right-[1px] z-10"
                          />
                        </div>
                      )}
                      <img src={one.icon} alt={one.title} />
                      <span>{one.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LowBalanceModal
        show={lowModal}
        close={() => {
          setLowModal(false);
        }}
      />
    </div>
  );
}

export function VoiceItem({
  isSelected,
  img,
  title,
  desc,
  voiceSrc,
  onSelected,
}: VoiceItem & {
  isSelected?: boolean;
  onSelected: (title: string) => void;
}) {
  const [paused, setPaused] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlaySwitch = useCallback(() => {
    const target = audioRef.current as HTMLAudioElement;
    if (target.paused) {
      target.play();
      setPaused(false);
    } else {
      target.pause();
      setPaused(true);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setPaused(true);
  }, []);

  return (
    <div
      className={
        isSelected ? `${styles.item} ${styles.item_active}` : styles.item
      }
      onClick={() => {
        onSelected(title);
      }}
    >
      <img src={img} alt={title} className={styles.img} />
      <div className={styles.content}>
        <div className="font-h6">{title}</div>
        <div className="font-small-console">{desc}</div>
      </div>
      <div
        className={styles.opt}
        onClick={(e) => {
          e.stopPropagation();
          handlePlaySwitch();
        }}
      >
        {paused ? (
          <span className="iconfont icon-play text-sm" />
        ) : (
          <span className="iconfont icon-pause text-sm" />
        )}
      </div>
      <audio
        ref={audioRef}
        src={voiceSrc}
        onEnded={handleAudioEnded}
        className={styles.audio_hidden}
      ></audio>
    </div>
  );
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
