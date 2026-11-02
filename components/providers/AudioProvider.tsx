"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playClick: () => void;
  playMenu: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const STORAGE_KEY = "portfolio-audio-muted";
const FADE_DURATION = 0.6; // 600ms volume fade
const AMBIENT_TARGET_VOLUME = 0.18;

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default is always OFF as specified
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const userHasInteractedRef = useRef<boolean>(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const menuRef = useRef<HTMLAudioElement | null>(null);
  const fadeTweenRef = useRef<gsap.core.Tween | null>(null);

  // Initialize audio elements and load stored preference
  useEffect(() => {
    // Check saved preference from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialMuted = saved !== null ? saved === "true" : true;
    setIsMuted(initialMuted);

    // Initialize audio elements using standard Audio
    const ambient = new Audio("/audio/ambient-loop.wav");
    ambient.loop = true;
    ambient.volume = 0;
    ambientRef.current = ambient;

    const click = new Audio("/audio/hover-tick.wav");
    click.volume = 0.25;
    clickRef.current = click;

    const menu = new Audio("/audio/menu-open.wav");
    menu.volume = 0.35;
    menuRef.current = menu;

    // Track user gesture to allow playback if preference was unmuted
    const handleFirstGesture = () => {
      userHasInteractedRef.current = true;
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);

      // If user previously set sound ON, start playing after first user gesture
      if (localStorage.getItem(STORAGE_KEY) === "false" && ambientRef.current) {
        ambientRef.current.play()
          .then(() => {
            if (fadeTweenRef.current) fadeTweenRef.current.kill();
            fadeTweenRef.current = gsap.to(ambientRef.current, {
              volume: AMBIENT_TARGET_VOLUME,
              duration: FADE_DURATION,
              ease: "power1.inOut",
            });
          })
          .catch(() => {});
      }
    };

    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current.src = "";
        ambientRef.current = null;
      }
    };
  }, []);

  // Handle mute / unmute state change with 600ms fade
  const applyAudioState = useCallback((muted: boolean, isExplicitGesture: boolean) => {
    const ambient = ambientRef.current;
    if (!ambient) return;

    if (fadeTweenRef.current) {
      fadeTweenRef.current.kill();
    }

    if (!muted) {
      if (isExplicitGesture || userHasInteractedRef.current) {
        ambient.play()
          .then(() => {
            fadeTweenRef.current = gsap.to(ambient, {
              volume: AMBIENT_TARGET_VOLUME,
              duration: FADE_DURATION,
              ease: "power1.inOut",
            });
          })
          .catch(() => {});
      }
    } else {
      fadeTweenRef.current = gsap.to(ambient, {
        volume: 0,
        duration: FADE_DURATION,
        ease: "power1.inOut",
        onComplete: () => {
          ambient.pause();
        },
      });
    }
  }, []);

  const toggleMute = useCallback(() => {
    userHasInteractedRef.current = true;
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      applyAudioState(next, true);
      return next;
    });
  }, [applyAudioState]);

  const playClick = useCallback(() => {
    if (!isMuted && clickRef.current) {
      try {
        clickRef.current.currentTime = 0;
        clickRef.current.play().catch(() => {});
      } catch {
        // audio element busy or blocked
      }
    }
  }, [isMuted]);

  const playMenu = useCallback(() => {
    if (!isMuted && menuRef.current) {
      try {
        menuRef.current.currentTime = 0;
        menuRef.current.play().catch(() => {});
      } catch {
        // audio element busy or blocked
      }
    }
  }, [isMuted]);

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playClick, playMenu }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

export default AudioProvider;
