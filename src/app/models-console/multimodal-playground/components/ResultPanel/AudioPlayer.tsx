"use client";

import { useEffect, useState, useRef } from "react";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

/**
 * Convert PCM audio data to WAV format for browser playback
 */
function pcmToWav(
  pcmData: ArrayBuffer,
  sampleRate = 24000,
  numChannels = 1,
  bitDepth = 16,
): Blob {
  const dataLength = pcmData.byteLength;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // byte rate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // block align
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  // Copy PCM data
  const pcmView = new Uint8Array(pcmData);
  const wavView = new Uint8Array(buffer);
  wavView.set(pcmView, 44);

  return new Blob([buffer], { type: "audio/wav" });
}

export const AudioPlayer = ({ src, className }: AudioPlayerProps) => {
  const [audioSrc, setAudioSrc] = useState<string>(src);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const convertIfNeeded = async () => {
      // Check if this blob needs conversion
      const pendingConversion = (window as any).__pendingAudioConversion?.[src];

      if (pendingConversion && pendingConversion instanceof Blob) {
        console.log("[AudioPlayer] Converting PCM to WAV", {
          originalSize: pendingConversion.size,
          originalType: pendingConversion.type,
        });

        setIsConverting(true);

        try {
          const arrayBuffer = await pendingConversion.arrayBuffer();
          const wavBlob = pcmToWav(arrayBuffer);
          const wavUrl = URL.createObjectURL(wavBlob);

          console.log("[AudioPlayer] Conversion complete", {
            wavSize: wavBlob.size,
            wavType: wavBlob.type,
            wavUrl,
          });

          setAudioSrc(wavUrl);

          // Clean up old blob URL
          URL.revokeObjectURL(src);
          delete (window as any).__pendingAudioConversion[src];
        } catch (err) {
          console.error("[AudioPlayer] Conversion failed:", err);
          setError("Audio conversion failed");
        } finally {
          setIsConverting(false);
        }
      }
    };

    convertIfNeeded();

    // Cleanup on unmount
    return () => {
      if (audioSrc !== src && audioSrc.startsWith("blob:")) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc, src]);

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.target as HTMLAudioElement;
    console.error("[AudioPlayer] Load error:", {
      url: audioSrc,
      error: audio.error,
      errorCode: audio.error?.code,
      errorMessage: audio.error?.message,
      networkState: audio.networkState,
      readyState: audio.readyState,
    });
    setError("Failed to load audio");
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.target as HTMLAudioElement;
    console.log("[AudioPlayer] Loaded successfully:", {
      url: audioSrc,
      duration: audio.duration,
      src: audio.src,
    });
    setError(null);
  };

  if (isConverting) {
    return (
      <div
        className={className}
        style={{ padding: "10px", textAlign: "center" }}
      >
        Converting audio format...
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ padding: "10px", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <audio
      ref={audioRef}
      src={audioSrc}
      controls
      onError={handleError}
      onLoadedMetadata={handleLoadedMetadata}
    />
  );
};
