"use client";
import { useState, useEffect } from "react";
import { TaskResultResponse } from "@/types/multimodal-playground";
import {
  getResultType,
  extractImages,
  extractVideos,
  extractAudios,
} from "../../utils/result";
import styles from "./index.module.scss";
interface ExampleItem {
  request: Record<string, any>;
  response: Record<string, any>;
}
interface ExamplesGalleryProps {
  examples: ExampleItem[];
  category: "image_gen" | "audio_gen" | "video_gen";
  onExampleClick: (example: ExampleItem) => void;
}
export const ExamplesGallery = ({
  examples,
  category,
  onExampleClick,
}: ExamplesGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    examples?.length ? 0 : null,
  );
  useEffect(() => {
    setSelectedIndex(examples?.length ? 0 : null);
  }, [examples]);
  if (!examples || examples.length === 0) {
    return (
      <div className={styles.empty_state}>
        <p className={styles.empty_text}>{"No examples yet"}</p>
      </div>
    );
  }
  const handleExampleClick = (example: ExampleItem, index: number) => {
    setSelectedIndex(index);
    onExampleClick(example);
  };
  const renderThumbnail = (response: Record<string, any>, index: number) => {
    const resultType = getResultType(response as TaskResultResponse, category);
    if (resultType === "image") {
      const images = extractImages(response as TaskResultResponse, category);
      if (images.length > 0) {
        return (
          <img
            src={images[0]}
            alt="Example preview"
            className={styles.thumbnail_image}
          />
        );
      }
    }
    if (resultType === "video") {
      const videos = extractVideos(response as TaskResultResponse, category);
      if (videos.length > 0) {
        return (
          <video
            src={videos[0]}
            className={styles.thumbnail_video}
            muted
            playsInline
          />
        );
      }
    }
    if (resultType === "audio") {
      const audios = extractAudios(response as TaskResultResponse, category);
      if (audios.length > 0) {
        return (
          <div className={styles.thumbnail_audio}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{"Audio"}</span>
          </div>
        );
      }
    }
    return (
      <div className={styles.thumbnail_placeholder}>
        <span>{"Example {index}".replace("{index}", String(index + 1))}</span>
      </div>
    );
  };
  const getExampleTitle = (request: Record<string, any>, index: number) => {
    const textContent =
      request.prompt || request.text || request?.input?.prompt;
    if (textContent) {
      const text = String(textContent);
      return text.length > 50 ? `${text.substring(0, 50)}...` : text;
    }
    return "Example {index}".replace("{index}", String(index + 1));
  };
  if (!examples || !Array.isArray(examples) || examples.length === 0) {
    return null;
  }
  return (
    <div className={styles.examples_gallery}>
      <div className={styles.gallery_grid}>
        {examples.map((example, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.example_card} ${selectedIndex === index ? styles.selected : ""}`}
            onClick={() => handleExampleClick(example, index)}
            aria-label={"Load example {index}".replace(
              "{index}",
              String(index + 1),
            )}
            tabIndex={0}
          >
            <div className={styles.thumbnail}>
              {renderThumbnail(example.response, index)}
            </div>
            <div className={styles.example_info}>
              <div className={styles.example_title}>
                {getExampleTitle(example.request, index)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
