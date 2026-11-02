"use client";

import React, { useEffect, useRef, useState } from "react";
import { MenuPanel } from "./MenuPanel";
import { useAudio } from "@/components/providers/AudioProvider";

export function Header() {
  const { isMuted, toggleMute, playClick, playMenu } = useAudio();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [localTime, setLocalTime] = useState<string>("");
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Live local time for West Java updated every second using Intl.DateTimeFormat
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const updateTime = () => {
      setLocalTime(formatter.format(new Date()));
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
    playMenu();
  };

  const handleSoundToggle = () => {
    toggleMute();
    if (isMuted) {
      // If it was muted, we are now enabling sound. 
      // User gesture here (click) will satisfy autoplay policy.
      playClick();
    }
  };

  return (
    <>
      <header
        role="banner"
        className="fixed top-0 left-0 right-0 z-40 w-full h-14 sm:h-16 px-4 sm:px-8 lg:px-12 flex items-center justify-between bg-[#080808]/85 backdrop-blur-md border-b border-white/10 font-hud text-[11px] uppercase tracking-[0.2em] text-white/70 select-none transition-colors"
      >
        {/* Left: RIP */}
        <div className="flex items-center gap-2">
          <a
            href="#hero"
            aria-label="Portfolio Home - RIP"
            data-cursor="link"
            onMouseEnter={playClick}
            className="flex items-center gap-2 text-white hover:text-[var(--lime)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--lime)]"
          >
            <span className="font-bold text-white tracking-[0.25em] border border-white/20 bg-white/[0.04] px-2 py-0.5 hover:border-[var(--lime)] transition-colors">
              RIP
            </span>
            <span className="hidden lg:inline text-[9px] tracking-[0.25em] text-[var(--text-dim)]">
              {"// SYS.RUN"}
            </span>
          </a>
        </div>

        {/* Center-left: SOUND · ON/OFF toggle */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleSoundToggle}
            onMouseEnter={playClick}
            data-cursor="link"
            aria-label={`Toggle sound system. Currently ${!isMuted ? "ON" : "OFF"}`}
            aria-pressed={!isMuted}
            className="flex items-center gap-1.5 px-2.5 py-1 border border-white/10 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--lime)]"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all ${!isMuted
                  ? "bg-[var(--lime)] shadow-[0_0_8px_var(--lime)]"
                  : "bg-white/20"
                }`}
            />
            <span className="text-[10px] sm:text-[11px] text-white/80">SOUND ·</span>
            <span
              className={`text-[10px] sm:text-[11px] transition-colors ${!isMuted ? "text-[var(--lime)] font-semibold" : "text-white/30"
                }`}
            >
              ON
            </span>
            <span className="text-white/20">/</span>
            <span
              className={`text-[10px] sm:text-[11px] transition-colors ${isMuted ? "text-[var(--lime)] font-semibold" : "text-white/30"
                }`}
            >
              OFF
            </span>
          </button>
        </div>

        {/* Center-right: local time and CV location */}
        <div className="hidden md:flex items-center gap-3 text-[10px] sm:text-[11px] tracking-[0.2em] text-[var(--text-dim)]">
          <span className="tabular-nums text-white/90">
            SUMEDANG {localTime ? `${localTime} WIB` : "--:--:-- WIB"}
          </span>
          <span className="text-white/20">|</span>
          <span className="hidden xl:inline text-white/60">
            WEST JAVA, INDONESIA
          </span>
        </div>

        {/* Right: MENU button with 1px border */}
        <div className="flex items-center">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={handleMenuToggle}
            onMouseEnter={playClick}
            data-cursor="link"
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation-panel"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--lime)] ${isMenuOpen
                ? "border-[var(--lime)] bg-[var(--lime)]/10 text-white"
                : "border-white/20 hover:border-[var(--lime)] bg-black/40 text-white/90 hover:text-white"
              }`}
          >
            <span>{isMenuOpen ? "CLOSE" : "MENU"}</span>
            <span
              className={`text-[10px] text-[var(--lime)] transition-transform duration-300 ${isMenuOpen ? "rotate-90" : ""
                }`}
            >
              {isMenuOpen ? "✕" : "[+]"}
            </span>
          </button>
        </div>
      </header>

      {/* Menu Panel */}
      <MenuPanel
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        triggerRef={menuButtonRef}
      />
    </>
  );
}

export default Header;
