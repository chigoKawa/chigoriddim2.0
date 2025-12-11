"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  src?: string;
  className?: string;
}

const DEFAULT_AUDIO_URL =
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export function AudioPlayer({ src, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const audioUrl =
    src || process.env.NEXT_PUBLIC_FOOTER_AUDIO_URL || DEFAULT_AUDIO_URL;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <audio ref={audioRef} src={audioUrl} loop preload="none" />

      <button
        onClick={togglePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative flex items-center justify-center
          w-16 h-16 sm:w-20 sm:h-20
          rounded-full
          bg-white/20 backdrop-blur-sm
          border-2 border-white/40
          hover:bg-white/30 hover:border-white/60
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
          ${isPlaying && !isHovered ? "animate-dance" : ""}
        `}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {/* Pulsing ring when playing */}
        {isPlaying && (
          <>
            <span className="absolute inset-0 rounded-full bg-white/20 animate-ping-slow" />
            <span className="absolute inset-[-4px] rounded-full border-2 border-white/30 animate-pulse-ring" />
          </>
        )}

        {/* Icon */}
        <span className="relative z-10">
          {isPlaying ? (
            <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
          ) : (
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
          )}
        </span>
      </button>

      {/* Now playing indicator */}
      {isPlaying && (
        <div className="flex items-end gap-1 h-6">
          <span className="w-1 bg-white/80 rounded-full animate-equalizer-1" />
          <span className="w-1 bg-white/80 rounded-full animate-equalizer-2" />
          <span className="w-1 bg-white/80 rounded-full animate-equalizer-3" />
          <span className="w-1 bg-white/80 rounded-full animate-equalizer-4" />
        </div>
      )}
    </div>
  );
}

export default AudioPlayer;
