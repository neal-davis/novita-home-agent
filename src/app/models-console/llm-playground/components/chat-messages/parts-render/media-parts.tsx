"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AudioStreamPlayer from "./AudioStreamPlayer";
import { FilePartRenderProps, AudioPartsRenderProps } from "./types";

/**
 * Render file content (images/videos)
 */
export const RenderFilePart = ({ part, keyPrefix }: FilePartRenderProps) => {
  if (part.mediaType?.startsWith("image/")) {
    return (
      <img
        key={`${keyPrefix}-image`}
        src={part.url}
        alt={part.filename || "image"}
        className="max-w-full max-h-[200px] object-contain"
      />
    );
  }

  if (part.mediaType?.startsWith("video/")) {
    return (
      <video
        key={`${keyPrefix}-video`}
        src={part.url}
        className="max-w-full max-h-[200px] object-contain"
        controls
      />
    );
  }

  if (part.mediaType?.startsWith("audio/")) {
    return (
      <audio
        key={`${keyPrefix}-audio`}
        src={part.url}
        controls
        className="max-w-full"
      />
    );
  }

  return null;
};

/**
 * Render audio parts with streaming support
 */
export const RenderAudioParts = ({
  parts,
  keyPrefix,
}: AudioPartsRenderProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<AudioStreamPlayer | null>(null);
  const enqueMap = useRef<Map<string, string>>(new Map());
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  const isEnd = useMemo(() => {
    return parts.some((part) => part.url.includes("[end]"));
  }, [parts]);

  useEffect(() => {
    if (audioRef.current) {
      playerRef.current = new AudioStreamPlayer();
      setIsPlayerReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    parts.forEach((part, index) => {
      if (
        enqueMap.current.has(index.toString()) &&
        enqueMap.current.get(index.toString()) === "true"
      ) {
        return;
      }

      // singal not to enqueue
      if (part.url.includes("[start]") || part.url.includes("[end]")) {
        return;
      }

      // More robust base64 extraction
      const base64 = part.url;

      if (base64) {
        enqueMap.current.set(index.toString(), "true");
        playerRef.current?.addBase64Chunk(base64);
      }
    });
  }, [parts, isPlayerReady]);

  useEffect(() => {
    if (isEnd) {
      playerRef.current?.generateWAVFile().then(({ blob, url }) => {
        setAudioUrl(url);
      });
    }
  }, [isEnd]);

  const handlePlay = async () => {
    if (playerRef.current) {
      try {
        await playerRef.current.stop();
      } catch (error) {
        console.error("Error resuming audio:", error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isEnd && <Loader2 className="size-4 animate-spin" />}
      <audio
        key={keyPrefix}
        controls
        ref={audioRef}
        className={cn("w-full", !isEnd && "opacity-50")}
        src={audioUrl}
        onPlay={handlePlay}
      />
    </div>
  );
};
